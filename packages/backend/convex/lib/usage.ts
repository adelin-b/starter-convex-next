// Server-only enforcement handled by package.json exports

import type { Id } from "../_generated/dataModel";
import { AppErrors } from "./errors";
import type { MutationCtx, QueryCtx } from "./functions";

// =============================================================================
// Plan Definitions
// =============================================================================

export type PlanType = "free" | "starter" | "pro" | "enterprise";

export type PlanLimits = {
  /** Monthly API call limit */
  apiCalls: number;
  /** Maximum agents per organization */
  maxAgents: number;
  /** Maximum campaigns per organization */
  maxCampaigns: number;
  /** Maximum prospects per organization */
  maxProspects: number;
  /** Maximum API keys per organization */
  maxApiKeys: number;
  /** Maximum monthly call minutes */
  maxCallMinutes: number;
};

/** Plan limits by plan type */
export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    apiCalls: 100,
    maxAgents: 2,
    maxCampaigns: 1,
    maxProspects: 50,
    maxApiKeys: 1,
    maxCallMinutes: 30,
  },
  starter: {
    apiCalls: 1000,
    maxAgents: 5,
    maxCampaigns: 5,
    maxProspects: 500,
    maxApiKeys: 3,
    maxCallMinutes: 300,
  },
  pro: {
    apiCalls: 10_000,
    maxAgents: 25,
    maxCampaigns: 25,
    maxProspects: 5000,
    maxApiKeys: 10,
    maxCallMinutes: 1500,
  },
  enterprise: {
    apiCalls: 100_000,
    maxAgents: -1, // unlimited
    maxCampaigns: -1, // unlimited
    maxProspects: -1, // unlimited
    maxApiKeys: -1, // unlimited
    maxCallMinutes: -1, // unlimited
  },
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get current month string (YYYY-MM format)
 */
export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * Get current date string (YYYY-MM-DD format)
 */
export function getCurrentDate(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
}

/**
 * Get plan limits for an organization
 */
export async function getOrganizationPlanLimits(
  ctx: QueryCtx | MutationCtx,
  organizationId: Id<"organizations">,
): Promise<PlanLimits> {
  const subscription = await ctx.db
    .query("subscriptions")
    .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
    .first();

  const planType = (subscription?.plan as PlanType) || "free";
  return PLAN_LIMITS[planType] || PLAN_LIMITS.free;
}

/**
 * Get current monthly usage for an organization
 */
export async function getOrganizationMonthlyUsage(
  ctx: QueryCtx | MutationCtx,
  organizationId: Id<"organizations">,
): Promise<{ apiCalls: number; month: string }> {
  const month = getCurrentMonth();

  const usage = await ctx.db
    .query("organizationUsage")
    .withIndex("by_org_month", (q) => q.eq("organizationId", organizationId).eq("month", month))
    .first();

  return {
    apiCalls: usage?.apiCalls ?? 0,
    month,
  };
}

// =============================================================================
// Quota Checking
// =============================================================================

export type QuotaType = "apiCalls" | "agents" | "campaigns" | "prospects" | "apiKeys";

export type QuotaCheckResult = {
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
  plan: PlanType;
};

/**
 * Check if an organization has quota remaining for a specific resource type
 */
export async function checkQuota(
  ctx: QueryCtx | MutationCtx,
  organizationId: Id<"organizations">,
  quotaType: QuotaType,
): Promise<QuotaCheckResult> {
  const subscription = await ctx.db
    .query("subscriptions")
    .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
    .first();

  const plan = (subscription?.plan as PlanType) || "free";
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

  let current: number;
  let limit: number;

  switch (quotaType) {
    case "apiCalls": {
      const usage = await getOrganizationMonthlyUsage(ctx, organizationId);
      current = usage.apiCalls;
      limit = limits.apiCalls;
      break;
    }
    case "agents": {
      const agents = await ctx.db
        .query("agents")
        .filter((q) => q.eq(q.field("organizationId"), organizationId))
        .collect();
      current = agents.length;
      limit = limits.maxAgents;
      break;
    }
    case "campaigns": {
      const campaigns = await ctx.db
        .query("campaigns")
        .filter((q) => q.eq(q.field("organizationId"), organizationId))
        .collect();
      current = campaigns.length;
      limit = limits.maxCampaigns;
      break;
    }
    case "prospects": {
      const prospects = await ctx.db
        .query("prospects")
        .filter((q) => q.eq(q.field("organizationId"), organizationId))
        .collect();
      current = prospects.length;
      limit = limits.maxProspects;
      break;
    }
    case "apiKeys": {
      const apiKeys = await ctx.db
        .query("apiKeys")
        .filter((q) => q.eq(q.field("organizationId"), organizationId))
        .collect();
      current = apiKeys.length;
      limit = limits.maxApiKeys;
      break;
    }
    default: {
      throw new Error(`Unknown quota type: ${quotaType}`);
    }
  }

  // -1 means unlimited
  const allowed = limit === -1 || current < limit;
  const remaining = limit === -1 ? -1 : Math.max(0, limit - current);

  return {
    allowed,
    current,
    limit,
    remaining,
    plan,
  };
}

/**
 * Enforce quota - throws if quota exceeded
 */
export async function enforceQuota(
  ctx: QueryCtx | MutationCtx,
  organizationId: Id<"organizations">,
  quotaType: QuotaType,
  resourceName?: string,
): Promise<void> {
  const result = await checkQuota(ctx, organizationId, quotaType);

  if (!result.allowed) {
    const name = resourceName || quotaType;
    throw AppErrors.quotaExceeded(name, result.limit, result.current, result.plan);
  }
}

// =============================================================================
// Usage Tracking
// =============================================================================

export type EventType =
  | "api_call"
  | "agent_created"
  | "agent_deleted"
  | "campaign_created"
  | "campaign_started"
  | "campaign_completed"
  | "prospect_added"
  | "call_started"
  | "call_completed";

/**
 * Track a usage event for an organization
 */
export async function trackUsage(
  ctx: MutationCtx,
  params: {
    organizationId: Id<"organizations">;
    userId: string;
    eventType: EventType;
    apiKeyId?: Id<"apiKeys">;
    metadata?: unknown;
  },
): Promise<Id<"usageEvents">> {
  const now = Date.now();
  const date = getCurrentDate();
  const month = getCurrentMonth();

  // Insert the usage event
  const eventId = await ctx.db.insert("usageEvents", {
    organizationId: params.organizationId,
    userId: params.userId,
    eventType: params.eventType,
    apiKeyId: params.apiKeyId,
    metadata: params.metadata as "required" | undefined,
    timestamp: now,
  });

  // Update daily usage
  const dailyUsage = await ctx.db
    .query("dailyUsage")
    .withIndex("by_org_date", (q) => q.eq("organizationId", params.organizationId).eq("date", date))
    .first();

  if (dailyUsage) {
    await ctx.db.patch(dailyUsage._id, {
      apiCalls: dailyUsage.apiCalls + (params.eventType === "api_call" ? 1 : 0),
      totalEvents: dailyUsage.totalEvents + 1,
    });
  } else {
    await ctx.db.insert("dailyUsage", {
      organizationId: params.organizationId,
      date,
      apiCalls: params.eventType === "api_call" ? 1 : 0,
      featuresUsed: 1,
      totalEvents: 1,
    });
  }

  // Update monthly usage (for API calls)
  if (params.eventType === "api_call") {
    const monthlyUsage = await ctx.db
      .query("organizationUsage")
      .withIndex("by_org_month", (q) =>
        q.eq("organizationId", params.organizationId).eq("month", month),
      )
      .first();

    if (monthlyUsage) {
      await ctx.db.patch(monthlyUsage._id, {
        apiCalls: monthlyUsage.apiCalls + 1,
        lastUpdated: now,
      });
    } else {
      await ctx.db.insert("organizationUsage", {
        organizationId: params.organizationId,
        month,
        apiCalls: 1,
        lastUpdated: now,
      });
    }
  }

  return eventId;
}

/**
 * Get usage summary for an organization
 */
export async function getUsageSummary(
  ctx: QueryCtx | MutationCtx,
  organizationId: Id<"organizations">,
): Promise<{
  plan: PlanType;
  limits: PlanLimits;
  usage: {
    apiCalls: { current: number; limit: number; remaining: number };
    agents: { current: number; limit: number; remaining: number };
    campaigns: { current: number; limit: number; remaining: number };
    prospects: { current: number; limit: number; remaining: number };
  };
  month: string;
}> {
  const subscription = await ctx.db
    .query("subscriptions")
    .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
    .first();

  const plan = (subscription?.plan as PlanType) || "free";
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  const month = getCurrentMonth();

  // Get all quota checks in parallel
  const [apiCallsCheck, agentsCheck, campaignsCheck, prospectsCheck] = await Promise.all([
    checkQuota(ctx, organizationId, "apiCalls"),
    checkQuota(ctx, organizationId, "agents"),
    checkQuota(ctx, organizationId, "campaigns"),
    checkQuota(ctx, organizationId, "prospects"),
  ]);

  return {
    plan,
    limits,
    usage: {
      apiCalls: {
        current: apiCallsCheck.current,
        limit: apiCallsCheck.limit,
        remaining: apiCallsCheck.remaining,
      },
      agents: {
        current: agentsCheck.current,
        limit: agentsCheck.limit,
        remaining: agentsCheck.remaining,
      },
      campaigns: {
        current: campaignsCheck.current,
        limit: campaignsCheck.limit,
        remaining: campaignsCheck.remaining,
      },
      prospects: {
        current: prospectsCheck.current,
        limit: prospectsCheck.limit,
        remaining: prospectsCheck.remaining,
      },
    },
    month,
  };
}
