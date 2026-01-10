// Server-only enforcement handled by package.json exports

import { AppErrors } from "./errors";
import type { MutationCtx as MutationContext, QueryCtx as QueryContext } from "./functions";

/**
 * Check if user is a system admin (in admins table).
 *
 * @example
 * const admin = await isSystemAdmin(ctx, userId);
 * if (!admin) {
 *   throw AppErrors.insufficientPermissions("admin only");
 * }
 */
export async function isSystemAdmin(
  context: QueryContext | MutationContext,
  userId: string,
): Promise<boolean> {
  const admin = await context.db
    .query("admins")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
  return admin !== null;
}

/**
 * Require user to be authenticated.
 * Throws notAuthenticated error if no identity.
 *
 * @returns The user's subject (userId)
 * @example
 * const userId = await requireAuth(ctx, "view items");
 */
export async function requireAuth(
  context: QueryContext | MutationContext,
  action: string,
): Promise<string> {
  const identity = await context.auth.getUserIdentity();
  if (!identity) {
    throw AppErrors.notAuthenticated(action);
  }
  return identity.subject;
}

/**
 * Require user to be a system admin for admin operations.
 * Combines authentication and admin role check.
 *
 * @returns The user's subject (userId)
 * @throws notAuthenticated if not logged in
 * @throws insufficientPermissions if not an admin
 *
 * @example
 * const userId = await requireAdminAccess(ctx);
 */
export async function requireAdminAccess(context: QueryContext | MutationContext): Promise<string> {
  const identity = await context.auth.getUserIdentity();
  if (!identity) {
    throw AppErrors.notAuthenticated("admin access");
  }

  const isAdmin = await isSystemAdmin(context, identity.subject);
  if (!isAdmin) {
    throw AppErrors.insufficientPermissions("admin access requires admin role");
  }

  return identity.subject;
}
