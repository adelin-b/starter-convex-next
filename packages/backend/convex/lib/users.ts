// Server-only enforcement handled by package.json exports

import { components } from "../_generated/api";
import type { QueryCtx as QueryContext } from "./functions";

/**
 * Minimal user data returned from better-auth.
 */
export type MinimalUser = {
  _id: string;
  name: string;
  email: string;
  image: string | null;
} | null;

/**
 * Check if an error is a "not found" type error from better-auth.
 * These are expected and should not be logged as errors.
 */
function isNotFoundError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes("not found") || message.includes("invalid");
  }
  return false;
}

/**
 * Fetch user by ID from better-auth.
 * Returns null if user not found (graceful degradation for display).
 * Throws on unexpected service errors to ensure visibility.
 *
 * @example
 * const user = await fetchUserById(ctx, member.userId);
 * return { ...member, user };
 */
export async function fetchUserById(context: QueryContext, userId: string): Promise<MinimalUser> {
  try {
    const result = await context.runQuery(components.betterAuth.adapter.findOne, {
      model: "user",
      where: [{ field: "_id", operator: "eq", value: userId }],
      select: ["_id", "name", "email", "image"],
    });
    return result as MinimalUser;
  } catch (error) {
    // Expected: user doesn't exist or invalid ID format (e.g., test data)
    // Return null silently for graceful UI degradation
    if (isNotFoundError(error)) {
      return null;
    }
    // Unexpected: service errors should be surfaced for debugging
    // Re-throw to let Convex error handling surface the issue
    throw error;
  }
}

/**
 * Enhance an array of items with user data.
 * Useful for batch-fetching user details for member lists.
 *
 * @example
 * const members = await ctx.db.query("organizationMembers").collect();
 * const withUsers = await enhanceWithUsers(ctx, members, (m) => m.userId);
 */
export function enhanceWithUsers<T extends { userId: string }>(
  context: QueryContext,
  items: T[],
): Promise<(T & { user: MinimalUser })[]> {
  return Promise.all(
    items.map(async (item) => {
      const user = await fetchUserById(context, item.userId);
      return { ...item, user };
    }),
  );
}

/**
 * User data returned by email lookup.
 */
export type UserByEmail = {
  id: string;
  name: string;
  email: string;
  image: string | null;
} | null;

/**
 * Fetch user by email from better-auth.
 * Returns null if user not found.
 * Useful for checking if a user with a given email already exists.
 *
 * @example
 * const user = await fetchUserByEmail(ctx, "john@example.com");
 * if (user) {
 *   // User exists
 * }
 */
export async function fetchUserByEmail(context: QueryContext, email: string): Promise<UserByEmail> {
  try {
    const result = await context.runQuery(components.betterAuth.adapter.findOne, {
      model: "user",
      where: [{ field: "email", operator: "eq", value: email }],
      select: ["_id", "name", "email", "image"],
    });
    if (!result) {
      return null;
    }
    // Transform _id to id for consistency
    return {
      id: (result as Record<string, unknown>)._id as string,
      name: (result as Record<string, unknown>).name as string,
      email: (result as Record<string, unknown>).email as string,
      image: ((result as Record<string, unknown>).image as string) ?? null,
    };
  } catch (error) {
    if (isNotFoundError(error)) {
      return null;
    }
    throw error;
  }
}
