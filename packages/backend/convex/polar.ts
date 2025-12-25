// Server-only enforcement handled by package.json exports

import { Polar } from "@convex-dev/polar";
import { v } from "convex/values";
import { api, components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { env } from "./env";

// Type assertion needed until `convex dev` regenerates types with polar component
// biome-ignore lint/suspicious/noExplicitAny: Polar component types not yet generated
const polarComponent = (components as unknown as { polar: any }).polar;

/**
 * Polar client for subscription and payment handling.
 * Configure your products in the Polar dashboard and map them here.
 *
 * Environment variables required:
 * - POLAR_ORGANIZATION_TOKEN: Your Polar organization access token
 * - POLAR_WEBHOOK_SECRET: Webhook secret for verifying Polar events
 * - POLAR_SERVER: "sandbox" or "production" (defaults to "sandbox")
 *
 * @see https://polar.sh/docs
 */
export const polar = new Polar<DataModel>(polarComponent, {
  /**
   * Get user info for subscription lookup.
   * This connects Polar subscriptions to your user system.
   */
  getUserInfo: async (ctx) => {
    const user = await ctx.runQuery(api.auth.getCurrentUser);
    if (!user) {
      throw new Error("User not authenticated");
    }
    return {
      userId: user._id,
      email: user.email,
    };
  },

  /**
   * Product mapping - map your product keys to Polar product IDs.
   * Replace these with your actual product IDs from the Polar dashboard.
   *
   * Example products structure:
   * - free: Free tier (if you want to track it)
   * - pro: Pro monthly subscription
   * - proYearly: Pro yearly subscription
   * - team: Team monthly subscription
   * - teamYearly: Team yearly subscription
   */
  products: {
    // Free tier (optional - you can track free users too)
    // free: env.POLAR_PRODUCT_FREE ?? "polar_product_free",

    // Pro tier
    proMonthly: env.POLAR_PRODUCT_PRO_MONTHLY ?? "polar_product_pro_monthly",
    proYearly: env.POLAR_PRODUCT_PRO_YEARLY ?? "polar_product_pro_yearly",

    // Team tier (if you need organization-level billing)
    teamMonthly: env.POLAR_PRODUCT_TEAM_MONTHLY ?? "polar_product_team_monthly",
    teamYearly: env.POLAR_PRODUCT_TEAM_YEARLY ?? "polar_product_team_yearly",
  },

  // Optional: Override env vars in code (defaults to env vars)
  // organizationToken: env.POLAR_ORGANIZATION_TOKEN,
  // webhookSecret: env.POLAR_WEBHOOK_SECRET,
  server: (env.POLAR_SERVER as "sandbox" | "production") ?? "sandbox",
});

/**
 * Export Polar API functions for use in frontend and other backend functions.
 * These are automatically generated from the Polar client.
 */
export const {
  // Subscription management
  changeCurrentSubscription,
  cancelCurrentSubscription,

  // Product information
  getConfiguredProducts,
  listAllProducts,

  // Checkout and portal
  generateCheckoutLink,
  generateCustomerPortalUrl,
} = polar.api();

/**
 * Get current subscription for the authenticated user.
 * This wraps the polar.getCurrentSubscription method as a query.
 */
export const getCurrentSubscription = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const user = await ctx.runQuery(api.auth.getCurrentUser);
    if (!user) {
      return null; // Not authenticated = no subscription
    }
    return await polar.getCurrentSubscription(ctx, { userId: user._id });
  },
});

/**
 * Subscription tier helpers
 */
export type SubscriptionTier = "free" | "pro" | "team";

/**
 * Get the subscription tier from a product key.
 */
export function getSubscriptionTier(productKey: string | null): SubscriptionTier {
  if (!productKey) {
    return "free";
  }

  if (productKey.startsWith("team")) {
    return "team";
  }
  if (productKey.startsWith("pro")) {
    return "pro";
  }

  return "free";
}

/**
 * Check if a subscription tier has access to a feature.
 * Useful for feature gating.
 */
export function hasAccess(tier: SubscriptionTier, requiredTier: SubscriptionTier): boolean {
  const tierOrder: Record<SubscriptionTier, number> = {
    free: 0,
    pro: 1,
    team: 2,
  };

  return tierOrder[tier] >= tierOrder[requiredTier];
}
