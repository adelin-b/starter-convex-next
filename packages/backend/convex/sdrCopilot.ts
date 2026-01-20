// Server-only enforcement handled by package.json exports

import { zid } from "zodvex";
import { AppErrors } from "./lib/errors";
import { zodQuery } from "./lib/functions";

// =============================================================================
// SDR Copilot Queries
// =============================================================================

/**
 * Get prospect brief for a specific prospect
 */
export const getProspectBrief = zodQuery({
  args: {
    prospectId: zid("prospects").optional(),
  },
  handler: async (context, { prospectId }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("access SDR copilot");
    }

    if (!prospectId) {
      return null;
    }

    // Get prospect
    const prospect = await context.db.get(prospectId);
    if (!prospect) {
      return null;
    }

    // Return brief data
    const prospectName = prospect.firstName
      ? `${prospect.firstName} ${prospect.lastName || ""}`.trim()
      : "Unknown Prospect";

    return {
      prospect,
      summary: `Brief for ${prospectName}`,
      recommendations: [],
      lastInteraction: null,
    };
  },
});

/**
 * Get SDR insights and recommendations
 */
export const getInsights = zodQuery({
  args: {},
  handler: async (context) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("access SDR copilot");
    }

    // Get prospects for this user
    const prospects = await context.db
      .query("prospects")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .take(10);

    // Get calls for this user
    const calls = await context.db
      .query("calls")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .take(20);

    return {
      totalProspects: prospects.length,
      totalCalls: calls.length,
      insights: [
        {
          type: "recommendation",
          title: "Follow up with prospects",
          description: "You have prospects that haven't been contacted recently.",
        },
      ],
      recentActivity: calls.slice(0, 5).map((c) => ({
        id: c._id,
        type: "call",
        timestamp: c.createdAt,
      })),
    };
  },
});
