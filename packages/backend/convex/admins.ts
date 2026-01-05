// Server-only enforcement handled by package.json exports

import { zodQuery } from "./lib/functions";

// =============================================================================
// Admins Queries
// =============================================================================

/**
 * Check if the current user is a system admin.
 * Returns a boolean indicating admin status.
 */
export const isAdmin = zodQuery({
  args: {},
  handler: async (context) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const admin = await context.db
      .query("admins")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    return admin !== null;
  },
});
