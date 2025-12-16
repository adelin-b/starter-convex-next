import type { Doc, Id } from "@starter-saas/backend/convex/_generated/dataModel";
import type { OrganizationRole, InvitationStatus } from "@starter-saas/backend/convex/schema";

/** User data from better-auth */
export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  image: string | null;
};

/** Organization document type */
export type Organization = Doc<"organizations">;

/** Organization status type */
export type OrganizationStatus = NonNullable<Organization["status"]>;

/** Member status - active for confirmed members, invitation status for pending */
export type MemberStatus = "active" | InvitationStatus;

/**
 * Unified member row that can represent either:
 * - An active member (from organizationMembers table)
 * - A pending/accepted/revoked/expired invitation (from organizationInvitations table)
 */
export type UnifiedMemberRow = {
  /** Unique ID for the row (member ID or invitation ID) */
  _id: string;
  /** Whether this is a member or invitation */
  type: "member" | "invitation";
  /** Email address */
  email: string;
  /** Display name (from user for members, null for invitations) */
  name: string | null;
  /** Avatar image */
  image: string | null;
  /** Assigned roles */
  roles: OrganizationRole[];
  /** Status: "active" for members, invitation status for invitations */
  status: MemberStatus;
  /** Organization ID */
  organizationId: Id<"organizations">;
  /** Organization name (for admin views that show all organizations) */
  organizationName?: string | null;
  /** User ID (for members) */
  userId: string | null;
  /** Original member ID (for members only) */
  memberId?: Id<"organizationMembers">;
  /** Original invitation ID (for invitations only) */
  invitationId?: Id<"organizationInvitations">;
  /** Invitation expiry (for invitations only) */
  expiresAt?: number;
  /** Who invited (for invitations only) */
  invitedBy?: AuthUser | null;
  /** Creation timestamp */
  createdAt: number;
};
