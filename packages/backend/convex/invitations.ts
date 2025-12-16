import { z } from "zod";
import { zid } from "zodvex";
import { internal } from "./_generated/api";
import type { Doc as Document } from "./_generated/dataModel";
import { env } from "./env";
import { requireAdminAccess } from "./lib/authorization";
import { AppErrors } from "./lib/errors";
import { zodMutation, zodQuery } from "./lib/functions";
import { fetchUserByEmail, fetchUserById, type MinimalUser } from "./lib/users";
import { organizationRoles, roleLabels } from "./schema";

/** Invitation with inviter info */
type InvitationWithInviter = Document<"organizationInvitations"> & { inviter: MinimalUser };

/** Invitation with organization info */
type InvitationWithOrganization = Document<"organizationInvitations"> & {
  organization: { _id: Document<"organizations">["_id"]; name: string };
};

/** Default invitation expiration: 7 days */
const INVITATION_EXPIRY_DAYS = 7;

/**
 * Generate a cryptographically secure random token.
 * Uses Web Crypto API for secure randomness.
 */
function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Invitation with inviter and organization info */
type InvitationWithDetails = Document<"organizationInvitations"> & {
  inviter: MinimalUser;
  organization: { _id: Document<"organizations">["_id"]; name: string } | null;
};

// ============================================
// Invitation Queries
// ============================================

/**
 * Get all invitations across all organizations (admin only).
 * Used in admin dashboard to see all invitation activity.
 */
export const getAll = zodQuery({
  handler: async (context) => {
    await requireAdminAccess(context);

    const invitations = await context.db.query("organizationInvitations").order("desc").collect();

    // Fetch inviter and organization details for each invitation
    const withDetails: InvitationWithDetails[] = [];
    for (const inv of invitations) {
      const inviter = await fetchUserById(context, inv.invitedBy);
      const organization = await context.db.get(inv.organizationId);
      withDetails.push({
        ...inv,
        inviter,
        organization: organization ? { _id: organization._id, name: organization.name } : null,
      });
    }

    return withDetails;
  },
});

/**
 * Get all invitations for an organization.
 */
export const getByOrganization = zodQuery({
  args: { organizationId: zid("organizations") },
  handler: async (context, { organizationId }) => {
    await requireAdminAccess(context);

    const invitations = await context.db
      .query("organizationInvitations")
      .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
      .collect();

    // Fetch inviter details for each invitation
    return await Promise.all(
      invitations.map(async (inv) => {
        const inviter = await fetchUserById(context, inv.invitedBy);
        return { ...inv, inviter };
      }),
    );
  },
});

/**
 * Get pending invitations for an organization.
 * Note: Does not auto-expire invitations (queries are read-only).
 * Expired invitations are filtered out client-side or by accept mutation.
 */
export const getPendingByOrganization = zodQuery({
  args: { organizationId: zid("organizations") },
  handler: async (context, { organizationId }) => {
    await requireAdminAccess(context);

    const now = Date.now();
    const invitations = await context.db
      .query("organizationInvitations")
      .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    // Filter out expired invitations (they'll be marked expired when accessed via mutation)
    const validInvitations: InvitationWithInviter[] = [];
    for (const inv of invitations) {
      if (inv.expiresAt >= now) {
        const inviter = await fetchUserById(context, inv.invitedBy);
        validInvitations.push({ ...inv, inviter });
      }
    }

    return validInvitations;
  },
});

/**
 * Get invitation by token (public - used for accepting invitations).
 * Does NOT require authentication - used on the accept page before user signs in.
 */
export const getByToken = zodQuery({
  args: { token: z.string().min(32) },
  handler: async (context, { token }) => {
    const invitation = await context.db
      .query("organizationInvitations")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();

    if (!invitation) {
      return null;
    }

    // Fetch organization details
    const organization = await context.db.get(invitation.organizationId);

    // Don't include sensitive fields
    return {
      _id: invitation._id,
      email: invitation.email,
      roles: invitation.roles,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt,
      organization: organization
        ? {
            _id: organization._id,
            name: organization.name,
          }
        : null,
    };
  },
});

/**
 * Get all pending invitations for the current user's email.
 * Note: Does not auto-expire invitations (queries are read-only).
 */
export const getMyPendingInvitations = zodQuery({
  handler: async (context) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity?.email) {
      return [];
    }

    const now = Date.now();
    const invitations = await context.db
      .query("organizationInvitations")
      .withIndex("by_email", (q) => q.eq("email", identity.email as string))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    // Filter out expired invitations and fetch organization details
    const validInvitations: InvitationWithOrganization[] = [];
    for (const inv of invitations) {
      if (inv.expiresAt >= now) {
        const organization = await context.db.get(inv.organizationId);
        if (organization) {
          validInvitations.push({
            ...inv,
            organization: { _id: organization._id, name: organization.name },
          });
        }
      }
    }

    return validInvitations;
  },
});

// ============================================
// Invitation Mutations
// ============================================

/**
 * Create a new invitation.
 * Sends an email with a link to accept.
 */
export const create = zodMutation({
  args: {
    email: z.string().email(),
    organizationId: zid("organizations"),
    roles: z.array(z.enum(organizationRoles)).min(1),
  },
  handler: async (context, { email, organizationId, roles }) => {
    await requireAdminAccess(context);

    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("create invitation");
    }

    // Verify organization exists
    const organization = await context.db.get(organizationId);
    if (!organization) {
      throw AppErrors.organizationNotFound(organizationId);
    }

    // Check if user is already a member (by email)
    const existingUser = await fetchUserByEmail(context, email);
    if (existingUser) {
      const existingMember = await context.db
        .query("organizationMembers")
        .withIndex("by_user_organization", (q) =>
          q.eq("userId", existingUser.id).eq("organizationId", organizationId),
        )
        .first();

      if (existingMember) {
        throw AppErrors.duplicateValue("membership", `${email} in organization`);
      }
    }

    // Check for existing pending invitation
    const existingInvitation = await context.db
      .query("organizationInvitations")
      .withIndex("by_email_organization", (q) => q.eq("email", email).eq("organizationId", organizationId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existingInvitation) {
      // If expired, we'll update it; otherwise throw
      if (existingInvitation.expiresAt > Date.now()) {
        throw AppErrors.duplicateValue("invitation", `${email} for this organization`);
      }
      // Mark old one as expired
      await context.db.patch(existingInvitation._id, {
        status: "expired",
        updatedAt: Date.now(),
      });
    }

    const now = Date.now();
    const token = generateToken();
    const expiresAt = now + INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    const invitationId = await context.db.insert("organizationInvitations", {
      email,
      organizationId,
      roles,
      token,
      status: "pending",
      invitedBy: identity.subject,
      expiresAt,
      createdAt: now,
      updatedAt: now,
    });

    // Get inviter name for the email
    const inviter = await fetchUserById(context, identity.subject);
    const inviterName = inviter?.name || identity.name || "A team member";

    // Build invitation URL
    const invitationUrl = `${env.SITE_URL}/invitations/accept?token=${token}`;

    // Send invitation email
    await context.scheduler.runAfter(0, internal.emails.index.sendInvitationEmail, {
      to: email,
      inviterName,
      organizationName: organization.name,
      invitationUrl,
      roles: roles.map((r) => roleLabels[r]),
      expiresInDays: INVITATION_EXPIRY_DAYS,
    });

    return { invitationId, token };
  },
});

/**
 * Accept an invitation.
 * Requires authentication - the logged-in user accepts the invitation.
 */
export const accept = zodMutation({
  args: { token: z.string().min(32) },
  handler: async (context, { token }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("accept invitation");
    }

    const invitation = await context.db
      .query("organizationInvitations")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();

    if (!invitation) {
      throw AppErrors.invitationNotFound();
    }

    if (invitation.status !== "pending") {
      throw AppErrors.invitationNotPending(invitation.status);
    }

    if (invitation.expiresAt < Date.now()) {
      await context.db.patch(invitation._id, {
        status: "expired",
        updatedAt: Date.now(),
      });
      throw AppErrors.invitationExpired();
    }

    // Verify organization still exists
    const organization = await context.db.get(invitation.organizationId);
    if (!organization) {
      throw AppErrors.organizationNotFound(invitation.organizationId);
    }

    // Check if user is already a member
    const existingMember = await context.db
      .query("organizationMembers")
      .withIndex("by_user_organization", (q) =>
        q.eq("userId", identity.subject).eq("organizationId", invitation.organizationId),
      )
      .first();

    if (existingMember) {
      // Already a member - just mark invitation as accepted
      await context.db.patch(invitation._id, {
        status: "accepted",
        acceptedAt: Date.now(),
        acceptedBy: identity.subject,
        updatedAt: Date.now(),
      });
      return { memberId: existingMember._id, alreadyMember: true };
    }

    const now = Date.now();

    // Create membership
    const memberId = await context.db.insert("organizationMembers", {
      userId: identity.subject,
      organizationId: invitation.organizationId,
      roles: invitation.roles,
      createdAt: now,
      updatedAt: now,
    });

    // Mark invitation as accepted
    await context.db.patch(invitation._id, {
      status: "accepted",
      acceptedAt: now,
      acceptedBy: identity.subject,
      updatedAt: now,
    });

    return { memberId, alreadyMember: false };
  },
});

/**
 * Revoke an invitation (admin only).
 */
export const revoke = zodMutation({
  args: { invitationId: zid("organizationInvitations") },
  handler: async (context, { invitationId }) => {
    await requireAdminAccess(context);

    const invitation = await context.db.get(invitationId);
    if (!invitation) {
      throw AppErrors.invitationNotFound();
    }

    if (invitation.status !== "pending") {
      throw AppErrors.invitationNotPending(invitation.status);
    }

    await context.db.patch(invitationId, {
      status: "revoked",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Resend an invitation (generates new token, extends expiry).
 */
export const resend = zodMutation({
  args: { invitationId: zid("organizationInvitations") },
  handler: async (context, { invitationId }) => {
    await requireAdminAccess(context);

    const invitation = await context.db.get(invitationId);
    if (!invitation) {
      throw AppErrors.invitationNotFound();
    }

    if (invitation.status !== "pending") {
      throw AppErrors.invitationNotPending(invitation.status);
    }

    const organization = await context.db.get(invitation.organizationId);
    if (!organization) {
      throw AppErrors.organizationNotFound(invitation.organizationId);
    }

    const now = Date.now();
    const newToken = generateToken();
    const newExpiresAt = now + INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    await context.db.patch(invitationId, {
      token: newToken,
      expiresAt: newExpiresAt,
      updatedAt: now,
    });

    // Get current user as the "resender"
    const identity = await context.auth.getUserIdentity();
    const inviter = identity ? await fetchUserById(context, identity.subject) : null;
    const inviterName = inviter?.name || identity?.name || "A team member";

    // Build invitation URL
    const invitationUrl = `${env.SITE_URL}/invitations/accept?token=${newToken}`;

    // Send invitation email
    await context.scheduler.runAfter(0, internal.emails.index.sendInvitationEmail, {
      to: invitation.email,
      inviterName,
      organizationName: organization.name,
      invitationUrl,
      roles: invitation.roles.map((r) => roleLabels[r]),
      expiresInDays: INVITATION_EXPIRY_DAYS,
    });

    return { token: newToken };
  },
});
