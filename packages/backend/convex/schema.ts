import { defineSchema } from "convex/server";
import { z } from "zod";
import { zid, zodTable } from "zodvex";

const FIELDS_CONSTANTS = {
  MAX_LENGTH_SMALL: 255,
} as const;

// =============================================================================
// TODOS (Example Domain)
// =============================================================================

export const todoStatuses = ["pending", "in_progress", "completed"] as const;
export type TodoStatus = (typeof todoStatuses)[number];

export const todoPriorities = ["low", "medium", "high"] as const;
export type TodoPriority = (typeof todoPriorities)[number];

export const Todos = zodTable("todos", {
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  status: z.enum(todoStatuses),
  priority: z.enum(todoPriorities).optional(),
  dueDate: z.number().int().positive().optional(),
  userId: z.string().min(1),
  organizationId: zid("organizations").optional(), // Optionally scoped to org
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
  completedAt: z.number().int().positive().optional(),
});

const TodosTable = Todos.table
  .index("by_user", ["userId"])
  .index("by_status", ["status"])
  .index("by_user_status", ["userId", "status"])
  .index("by_organization", ["organizationId"]);

// =============================================================================
// ORGANIZATIONS (Multi-tenant support)
// =============================================================================

export const organizationRoles = ["member", "admin", "owner"] as const;
export type OrganizationRole = (typeof organizationRoles)[number];

export const organizationStatuses = ["active", "inactive"] as const;
export type OrganizationStatus = (typeof organizationStatuses)[number];

export const roleLabels: Record<OrganizationRole, string> = {
  member: "Member",
  admin: "Admin",
  owner: "Owner",
};

export const roleColors: Record<OrganizationRole, "default" | "secondary"> = {
  member: "secondary",
  admin: "default",
  owner: "default",
};

export const Organizations = zodTable("organizations", {
  name: z.string().min(1).max(FIELDS_CONSTANTS.MAX_LENGTH_SMALL),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  status: z.enum(organizationStatuses).optional(),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
  deletedAt: z.number().int().positive().optional(),
});

const OrganizationsTable = Organizations.table
  .index("by_name", ["name"])
  .index("by_status", ["status"]);

// =============================================================================
// ORGANIZATION MEMBERS (Junction table for user-org membership)
// =============================================================================

export const OrganizationMembers = zodTable("organizationMembers", {
  userId: z.string().min(1),
  organizationId: zid("organizations"),
  roles: z.array(z.enum(organizationRoles)).min(1),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});

const OrganizationMembersTable = OrganizationMembers.table
  .index("by_user", ["userId"])
  .index("by_organization", ["organizationId"])
  .index("by_user_organization", ["userId", "organizationId"]);

// =============================================================================
// ORGANIZATION INVITATIONS (Email-based invites)
// =============================================================================

export const invitationStatuses = ["pending", "accepted", "revoked", "expired"] as const;
export type InvitationStatus = (typeof invitationStatuses)[number];

export const OrganizationInvitations = zodTable("organizationInvitations", {
  email: z.string().email(),
  organizationId: zid("organizations"),
  roles: z.array(z.enum(organizationRoles)).min(1),
  token: z.string().min(32),
  status: z.enum(invitationStatuses),
  invitedBy: z.string().min(1),
  expiresAt: z.number().int().positive(),
  acceptedAt: z.number().int().positive().optional(),
  acceptedBy: z.string().optional(),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});

const OrganizationInvitationsTable = OrganizationInvitations.table
  .index("by_token", ["token"])
  .index("by_email", ["email"])
  .index("by_organization", ["organizationId"])
  .index("by_email_organization", ["email", "organizationId"])
  .index("by_status", ["status"]);

// =============================================================================
// ADMINS (System-level admins, separate from org owners)
// =============================================================================

export const Admins = zodTable("admins", {
  userId: z.string().min(1),
  createdAt: z.number().int().positive(),
});

const AdminsTable = Admins.table.index("by_user", ["userId"]);

// =============================================================================
// SCHEMA EXPORT
// =============================================================================

export default defineSchema({
  todos: TodosTable,
  organizations: OrganizationsTable,
  organizationMembers: OrganizationMembersTable,
  organizationInvitations: OrganizationInvitationsTable,
  admins: AdminsTable,
});
