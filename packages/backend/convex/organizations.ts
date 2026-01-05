// Server-only enforcement handled by package.json exports

import { z } from "zod";
import { zid } from "zodvex";
import { isSystemAdmin, requireAdminAccess } from "./lib/authorization";
import { AppErrors } from "./lib/errors";
import { mutation, query, zodInternalMutation, zodMutation, zodQuery } from "./lib/functions";
import { fetchUserById } from "./lib/users";
import schema, { Organizations, organizationRoles, organizationStatuses } from "./schema";
import { crud } from "./utils/crud";

// Generate CRUD operations
export const { read, readMany, update, destroy, count, exists, findOne, softDelete, restore } =
  crud(schema, "organizations", query, mutation);

// Create args schema - excludes auto-set fields
const CreateOrganizationArgsSchema = z
  .object(Organizations.zDoc.shape)
  .omit({
    _id: true,
    _creationTime: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    status: true, // Status is set automatically to "active" on creation
  })
  .partial({ description: true, address: true, phone: true, email: true });

export const getAll = zodQuery({
  handler: async (context) => {
    await requireAdminAccess(context);
    return await context.db.query("organizations").collect();
  },
});

export const getById = zodQuery({
  args: { id: zid("organizations") },
  handler: async (context, { id }) => {
    await requireAdminAccess(context);
    const organization = await context.db.get(id);
    if (!organization) {
      throw AppErrors.organizationNotFound(id);
    }
    return organization;
  },
});

export const create = zodMutation({
  args: CreateOrganizationArgsSchema.shape,
  handler: async (context, args) => {
    await requireAdminAccess(context);

    // Check for duplicate name
    const existing = await context.db
      .query("organizations")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing) {
      throw AppErrors.duplicateValue("name", args.name);
    }

    const now = Date.now();
    const newOrganizationId = await context.db.insert("organizations", {
      ...args,
      status: "active", // New organizations are active by default
      createdAt: now,
      updatedAt: now,
    });
    return await context.db.get(newOrganizationId);
  },
});

export const updateOrganization = zodMutation({
  args: {
    id: zid("organizations"),
    name: Organizations.shape.name.optional(),
    description: Organizations.shape.description,
    address: Organizations.shape.address,
    phone: Organizations.shape.phone,
    email: Organizations.shape.email,
  },
  handler: async (context, { id, ...updates }) => {
    await requireAdminAccess(context);

    const organization = await context.db.get(id);
    if (!organization) {
      throw AppErrors.organizationNotFound(id);
    }

    // If name is being updated, check for duplicates
    if (updates.name && updates.name !== organization.name) {
      const existing = await context.db
        .query("organizations")
        .withIndex("by_name", (q) => q.eq("name", updates.name as string))
        .first();

      if (existing) {
        throw AppErrors.duplicateValue("name", updates.name);
      }
    }

    // Filter out undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined),
    );

    await context.db.patch(id, { ...cleanUpdates, updatedAt: Date.now() });
    return await context.db.get(id);
  },
});

export const updateStatus = zodMutation({
  args: {
    id: zid("organizations"),
    status: z.enum(organizationStatuses),
  },
  handler: async (context, { id, status }) => {
    await requireAdminAccess(context);

    const organization = await context.db.get(id);
    if (!organization) {
      throw AppErrors.organizationNotFound(id);
    }

    await context.db.patch(id, { status, updatedAt: Date.now() });
    return { success: true };
  },
});

export const remove = zodMutation({
  args: { id: zid("organizations") },
  handler: async (context, { id }) => {
    await requireAdminAccess(context);

    const organization = await context.db.get(id);
    if (!organization) {
      throw AppErrors.organizationNotFound(id);
    }

    // Remove all members first
    const members = await context.db
      .query("organizationMembers")
      .withIndex("by_organization", (q) => q.eq("organizationId", id))
      .collect();

    for (const member of members) {
      await context.db.delete(member._id);
    }

    await context.db.delete(id);
    return { success: true };
  },
});

// ============================================
// Organization Members CRUD
// ============================================

const CreateMemberArgsSchema = z.object({
  userId: z.string().min(1),
  organizationId: zid("organizations"),
  roles: z.array(z.enum(organizationRoles)).min(1),
});

export const getOrganizationMembers = zodQuery({
  args: { organizationId: zid("organizations") },
  handler: async (context, { organizationId }) => {
    await requireAdminAccess(context);

    const members = await context.db
      .query("organizationMembers")
      .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
      .collect();

    // Fetch user details for each member using shared helper
    return await Promise.all(
      members.map(async (m) => {
        const user = await fetchUserById(context, m.userId);
        return { ...m, user };
      }),
    );
  },
});

export const getMemberById = zodQuery({
  args: { memberId: zid("organizationMembers") },
  handler: async (context, { memberId }) => {
    await requireAdminAccess(context);

    const member = await context.db.get(memberId);
    if (!member) {
      throw AppErrors.organizationMemberNotFound(memberId);
    }

    // Fetch organization and user details using shared helper
    const organization = await context.db.get(member.organizationId);
    if (!organization) {
      throw AppErrors.organizationNotFound(member.organizationId);
    }
    const user = await fetchUserById(context, member.userId);

    return { ...member, organization, user };
  },
});

export const getAllMembers = zodQuery({
  handler: async (context) => {
    await requireAdminAccess(context);

    const members = await context.db.query("organizationMembers").collect();

    // Fetch organization and user details for each member using shared helper
    // Filter out orphaned members (organization deleted but member record remains)
    const withDetails = await Promise.all(
      members.map(async (m) => {
        const organization = await context.db.get(m.organizationId);
        // Skip orphaned members where organization no longer exists
        if (!organization) {
          return null;
        }
        const user = await fetchUserById(context, m.userId);
        return { ...m, organization, user };
      }),
    );

    // Filter out null entries (orphaned members)
    return withDetails.filter((m): m is NonNullable<typeof m> => m !== null);
  },
});

export const getUserMemberships = zodQuery({
  args: { userId: z.string().min(1) },
  handler: async (context, { userId }) => {
    await requireAdminAccess(context);

    const memberships = await context.db
      .query("organizationMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Fetch organization details for each membership
    // Filter out orphaned memberships (organization deleted but member record remains)
    const withOrganizations = await Promise.all(
      memberships.map(async (m) => {
        const organization = await context.db.get(m.organizationId);
        if (!organization) {
          return null;
        }
        return { ...m, organization };
      }),
    );

    return withOrganizations.filter((m): m is NonNullable<typeof m> => m !== null);
  },
});

export const getCurrentUserMemberships = zodQuery({
  handler: async (context) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("view memberships");
    }

    const memberships = await context.db
      .query("organizationMembers")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    // Fetch organization details for each membership
    // Filter out orphaned memberships (organization deleted but member record remains)
    const withOrganizations = await Promise.all(
      memberships.map(async (m) => {
        const organization = await context.db.get(m.organizationId);
        if (!organization) {
          return null;
        }
        return { ...m, organization };
      }),
    );

    return withOrganizations.filter((m): m is NonNullable<typeof m> => m !== null);
  },
});

export const addMember = zodMutation({
  args: CreateMemberArgsSchema.shape,
  handler: async (context, args) => {
    await requireAdminAccess(context);

    // Check if user is already a member
    const existing = await context.db
      .query("organizationMembers")
      .withIndex("by_user_organization", (q) =>
        q.eq("userId", args.userId).eq("organizationId", args.organizationId),
      )
      .first();

    if (existing) {
      throw AppErrors.duplicateValue("membership", `${args.userId} in organization`);
    }

    // Verify organization exists
    const organization = await context.db.get(args.organizationId);
    if (!organization) {
      throw AppErrors.organizationNotFound(args.organizationId);
    }

    const now = Date.now();
    const memberId = await context.db.insert("organizationMembers", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });

    return await context.db.get(memberId);
  },
});

export const updateMemberRoles = zodMutation({
  args: {
    memberId: zid("organizationMembers"),
    roles: z.array(z.enum(organizationRoles)).min(1),
  },
  handler: async (context, { memberId, roles }) => {
    await requireAdminAccess(context);

    const member = await context.db.get(memberId);
    if (!member) {
      throw AppErrors.organizationMemberNotFound(memberId);
    }

    await context.db.patch(memberId, { roles, updatedAt: Date.now() });
    return await context.db.get(memberId);
  },
});

export const removeMember = zodMutation({
  args: { memberId: zid("organizationMembers") },
  handler: async (context, { memberId }) => {
    await requireAdminAccess(context);

    const member = await context.db.get(memberId);
    if (!member) {
      throw AppErrors.organizationMemberNotFound(memberId);
    }

    await context.db.delete(memberId);
    return { success: true };
  },
});

// ============================================
// Role-based Access Helpers
// ============================================

export const hasRole = zodQuery({
  args: {
    organizationId: zid("organizations"),
    role: z.enum(organizationRoles),
  },
  handler: async (context, { organizationId, role }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const membership = await context.db
      .query("organizationMembers")
      .withIndex("by_user_organization", (q) =>
        q.eq("userId", identity.subject).eq("organizationId", organizationId),
      )
      .first();

    if (!membership) {
      return false;
    }

    return membership.roles.includes(role);
  },
});

export const isOwner = zodQuery({
  args: { organizationId: zid("organizations") },
  handler: async (context, { organizationId }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const membership = await context.db
      .query("organizationMembers")
      .withIndex("by_user_organization", (q) =>
        q.eq("userId", identity.subject).eq("organizationId", organizationId),
      )
      .first();

    if (!membership) {
      return false;
    }

    return membership.roles.includes("owner");
  },
});

/**
 * Check if current user is a system admin.
 * Used by sidebar/navigation to conditionally show admin links.
 */
export const hasAdminAccess = zodQuery({
  handler: async (context) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      return false;
    }
    return await isSystemAdmin(context, identity.subject);
  },
});

// ============================================
// Test Mutations (E2E test seeding only)
// ============================================

/**
 * Seed a test user as system admin.
 * INTERNAL mutation - callable only from other Convex functions or admin dashboard.
 * Takes userId directly to bypass auth for test setup.
 */
export const seedTestAdmin = zodInternalMutation({
  args: {
    userId: z.string().min(1),
  },
  handler: async (context, { userId }) => {
    // Check if already admin
    const existing = await context.db
      .query("admins")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      return { adminId: existing._id, userId };
    }

    const adminId = await context.db.insert("admins", {
      userId,
      createdAt: Date.now(),
    });

    return { adminId, userId };
  },
});

/**
 * Seed a test organization with specified user as owner.
 * INTERNAL mutation - callable only from other Convex functions or admin dashboard.
 * Takes userId directly to bypass auth for test setup.
 */
export const seedTestOrganization = zodInternalMutation({
  args: {
    userId: z.string().min(1),
    organizationName: z.string().min(1).default("Test Organization"),
    description: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  },
  handler: async (context, { userId, organizationName, description, email, phone }) => {
    const now = Date.now();

    // Create the organization
    const organizationId = await context.db.insert("organizations", {
      name: organizationName,
      description,
      email,
      phone,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    // Add user as organization-manager
    await context.db.insert("organizationMembers", {
      userId,
      organizationId,
      roles: ["owner"],
      createdAt: now,
      updatedAt: now,
    });

    return { organizationId, userId };
  },
});

/**
 * Seed a test organization member.
 * INTERNAL mutation - callable only from other Convex functions or admin dashboard.
 * Takes organizationName to look up the org, memberEmail as userId placeholder, and roles.
 */
export const seedTestOrganizationMember = zodInternalMutation({
  args: {
    organizationName: z.string().min(1),
    memberEmail: z.string().min(1),
    roles: z.array(z.enum(organizationRoles)).min(1),
  },
  handler: async (context, { organizationName, memberEmail, roles }) => {
    // Find the organization by name
    const organization = await context.db
      .query("organizations")
      .withIndex("by_name", (q) => q.eq("name", organizationName))
      .first();

    if (!organization) {
      throw AppErrors.organizationNotFound(organizationName);
    }

    // Use email as userId for test seeding
    const userId = memberEmail;

    // Check if already a member
    const existing = await context.db
      .query("organizationMembers")
      .withIndex("by_user_organization", (q) =>
        q.eq("userId", userId).eq("organizationId", organization._id),
      )
      .first();

    if (existing) {
      // Update roles if member already exists
      await context.db.patch(existing._id, { roles, updatedAt: Date.now() });
      return { memberId: existing._id, organizationId: organization._id, userId };
    }

    const now = Date.now();
    const memberId = await context.db.insert("organizationMembers", {
      userId,
      organizationId: organization._id,
      roles,
      createdAt: now,
      updatedAt: now,
    });

    return { memberId, organizationId: organization._id, userId };
  },
});
