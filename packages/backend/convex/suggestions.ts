// Server-only enforcement handled by package.json exports

import { z } from "zod";
import { zid } from "zodvex";
import { AppErrors } from "./lib/errors";
import { zodMutation, zodQuery } from "./lib/functions";
import { callPhases, suggestionTypes } from "./schema";

// =============================================================================
// Real-Time Call Suggestions
// =============================================================================

/**
 * Get live suggestions for an active call
 */
export const getByCallId = zodQuery({
  args: {
    callId: zid("calls"),
  },
  handler: async (context, { callId }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("view call suggestions");
    }

    // Verify call belongs to user
    const call = await context.db.get(callId);
    if (!call) {
      throw AppErrors.notFound("Call", callId);
    }
    if (call.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("view suggestions for this call");
    }

    // Get all suggestions for this call, ordered by priority and creation time
    const suggestions = await context.db
      .query("sdrLiveSuggestions")
      .withIndex("by_callId", (q) => q.eq("callId", callId))
      .order("desc")
      .collect();

    // Sort by priority (higher first) then by creation time (newer first)
    return suggestions.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return b.createdAt - a.createdAt;
    });
  },
});

/**
 * Get pending suggestions for an active call
 */
export const getPendingByCallId = zodQuery({
  args: {
    callId: zid("calls"),
  },
  handler: async (context, { callId }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("view call suggestions");
    }

    // Verify call belongs to user
    const call = await context.db.get(callId);
    if (!call) {
      throw AppErrors.notFound("Call", callId);
    }
    if (call.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("view suggestions for this call");
    }

    // Get pending suggestions for this call
    const suggestions = await context.db
      .query("sdrLiveSuggestions")
      .withIndex("by_callId_status", (q) => q.eq("callId", callId).eq("status", "pending"))
      .order("desc")
      .collect();

    // Sort by priority (higher first)
    return suggestions.sort((a, b) => b.priority - a.priority);
  },
});

/**
 * Create a new suggestion (typically called by the AI agent during a call)
 */
export const create = zodMutation({
  args: {
    callId: zid("calls"),
    organizationId: zid("organizations").optional(),
    prepId: zid("sdrCallPreps").optional(),
    insightId: zid("vehicleInsights").optional(),
    suggestionType: z.enum(suggestionTypes),
    title: z.string().min(1).max(255),
    content: z.string().min(1),
    priority: z.number().min(1).max(10).default(5),
    triggerPhase: z.enum(callPhases).optional(),
    objectionType: z.string().optional(),
  },
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("create suggestion");
    }

    // Verify call belongs to user
    const call = await context.db.get(args.callId);
    if (!call) {
      throw AppErrors.notFound("Call", args.callId);
    }
    if (call.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("create suggestions for this call");
    }

    const now = Date.now();
    return await context.db.insert("sdrLiveSuggestions", {
      organizationId: args.organizationId ?? call.organizationId ?? null,
      callId: args.callId,
      prepId: args.prepId,
      insightId: args.insightId,
      suggestionType: args.suggestionType,
      title: args.title,
      content: args.content,
      priority: args.priority,
      triggerPhase: args.triggerPhase,
      objectionType: args.objectionType,
      status: "pending",
      createdAt: now,
    });
  },
});

/**
 * Create a suggestion from the LiveKit agent (system context, no auth required)
 */
export const createFromAgent = zodMutation({
  args: {
    callId: zid("calls"),
    systemToken: z.string().min(1),
    suggestionType: z.enum(suggestionTypes),
    title: z.string().min(1).max(255),
    content: z.string().min(1),
    priority: z.number().min(1).max(10).default(5),
    triggerPhase: z.enum(callPhases).optional(),
    objectionType: z.string().optional(),
  },
  handler: async (context, args) => {
    // Verify system token
    // biome-ignore lint/style/noProcessEnv: Convex action requires direct env access
    const expectedToken = process.env.CONVEX_SYSTEM_ADMIN_TOKEN;
    if (!expectedToken || args.systemToken !== expectedToken) {
      throw AppErrors.insufficientPermissions("create agent suggestions");
    }

    // Get call to extract organization info
    const call = await context.db.get(args.callId);
    if (!call) {
      throw AppErrors.notFound("Call", args.callId);
    }

    const now = Date.now();
    return await context.db.insert("sdrLiveSuggestions", {
      organizationId: call.organizationId ?? null,
      callId: args.callId,
      suggestionType: args.suggestionType,
      title: args.title,
      content: args.content,
      priority: args.priority,
      triggerPhase: args.triggerPhase,
      objectionType: args.objectionType,
      status: "pending",
      createdAt: now,
    });
  },
});

/**
 * Mark a suggestion as used
 */
export const markUsed = zodMutation({
  args: {
    id: zid("sdrLiveSuggestions"),
    wasHelpful: z.boolean().optional(),
  },
  handler: async (context, { id, wasHelpful }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("update suggestion");
    }

    const suggestion = await context.db.get(id);
    if (!suggestion) {
      throw AppErrors.notFound("Suggestion", id);
    }

    // Verify call belongs to user
    const call = await context.db.get(suggestion.callId);
    if (!call || call.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("update this suggestion");
    }

    const now = Date.now();
    await context.db.patch(id, {
      status: "used",
      usedAt: now,
      wasHelpful,
    });

    return { id, status: "used" };
  },
});

/**
 * Dismiss a suggestion
 */
export const dismiss = zodMutation({
  args: {
    id: zid("sdrLiveSuggestions"),
  },
  handler: async (context, { id }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("dismiss suggestion");
    }

    const suggestion = await context.db.get(id);
    if (!suggestion) {
      throw AppErrors.notFound("Suggestion", id);
    }

    // Verify call belongs to user
    const call = await context.db.get(suggestion.callId);
    if (!call || call.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("dismiss this suggestion");
    }

    await context.db.patch(id, {
      status: "dismissed",
    });

    return { id, status: "dismissed" };
  },
});

/**
 * Rate a suggestion's helpfulness (after call)
 */
export const rate = zodMutation({
  args: {
    id: zid("sdrLiveSuggestions"),
    wasHelpful: z.boolean(),
  },
  handler: async (context, { id, wasHelpful }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("rate suggestion");
    }

    const suggestion = await context.db.get(id);
    if (!suggestion) {
      throw AppErrors.notFound("Suggestion", id);
    }

    // Verify call belongs to user
    const call = await context.db.get(suggestion.callId);
    if (!call || call.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("rate this suggestion");
    }

    await context.db.patch(id, {
      wasHelpful,
    });

    return { id, wasHelpful };
  },
});

/**
 * Get suggestion statistics for a call
 */
export const getStats = zodQuery({
  args: {
    callId: zid("calls"),
  },
  handler: async (context, { callId }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("view suggestion stats");
    }

    // Verify call belongs to user
    const call = await context.db.get(callId);
    if (!call) {
      throw AppErrors.notFound("Call", callId);
    }
    if (call.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("view stats for this call");
    }

    const suggestions = await context.db
      .query("sdrLiveSuggestions")
      .withIndex("by_callId", (q) => q.eq("callId", callId))
      .collect();

    const total = suggestions.length;
    const used = suggestions.filter((s) => s.status === "used").length;
    const dismissed = suggestions.filter((s) => s.status === "dismissed").length;
    const pending = suggestions.filter((s) => s.status === "pending").length;
    const helpful = suggestions.filter((s) => s.wasHelpful === true).length;
    const notHelpful = suggestions.filter((s) => s.wasHelpful === false).length;

    // Count by type
    const byType = suggestions.reduce(
      (acc, s) => {
        acc[s.suggestionType] = (acc[s.suggestionType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total,
      used,
      dismissed,
      pending,
      helpful,
      notHelpful,
      useRate: total > 0 ? used / total : 0,
      helpfulRate: used > 0 ? helpful / used : 0,
      byType,
    };
  },
});

/**
 * Bulk create suggestions (for AI-generated batch suggestions)
 */
export const bulkCreate = zodMutation({
  args: {
    callId: zid("calls"),
    suggestions: z.array(
      z.object({
        suggestionType: z.enum(suggestionTypes),
        title: z.string().min(1).max(255),
        content: z.string().min(1),
        priority: z.number().min(1).max(10).default(5),
        triggerPhase: z.enum(callPhases).optional(),
        objectionType: z.string().optional(),
      }),
    ),
  },
  handler: async (context, { callId, suggestions }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("create suggestions");
    }

    // Verify call belongs to user
    const call = await context.db.get(callId);
    if (!call) {
      throw AppErrors.notFound("Call", callId);
    }
    if (call.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("create suggestions for this call");
    }

    const now = Date.now();
    const ids = [];

    for (const suggestion of suggestions) {
      const id = await context.db.insert("sdrLiveSuggestions", {
        organizationId: call.organizationId ?? null,
        callId,
        suggestionType: suggestion.suggestionType,
        title: suggestion.title,
        content: suggestion.content,
        priority: suggestion.priority,
        triggerPhase: suggestion.triggerPhase,
        objectionType: suggestion.objectionType,
        status: "pending",
        createdAt: now,
      });
      ids.push(id);
    }

    return { count: ids.length, ids };
  },
});
