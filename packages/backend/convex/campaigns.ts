// Server-only enforcement handled by package.json exports

import { z } from "zod";
import { zid } from "zodvex";
import { AppErrors } from "./lib/errors";
import { zodMutation, zodQuery } from "./lib/functions";
import { campaignStatuses } from "./schema";

// =============================================================================
// Args Schemas
// =============================================================================

const campaignScheduleSchema = z.object({
  daysOfWeek: z.array(z.number()).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  timezone: z.string().optional(),
});

const CreateCampaignArgsSchema = z.object({
  organizationId: zid("organizations").optional(),
  agentId: zid("agents"),
  scriptId: zid("scripts").optional(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  startDate: z.number().optional(),
  endDate: z.number().optional(),
  schedule: campaignScheduleSchema.optional(),
  maxConcurrentCalls: z.number().int().positive().optional(),
  retryFailedCalls: z.boolean().optional(),
  maxRetryAttempts: z.number().int().positive().optional(),
});

const UpdateCampaignArgsSchema = CreateCampaignArgsSchema.partial().extend({
  id: zid("campaigns"),
  status: z.enum(campaignStatuses).optional(),
});

// =============================================================================
// Queries
// =============================================================================

/**
 * List all campaigns for the current user
 */
export const list = zodQuery({
  args: {
    status: z.enum(campaignStatuses).optional(),
    organizationId: zid("organizations").optional(),
  },
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("view campaigns");
    }

    let campaigns;

    if (args.status) {
      campaigns = await context.db
        .query("campaigns")
        .withIndex("by_userId_and_status", (q) =>
          q.eq("userId", identity.subject).eq("status", args.status!),
        )
        .collect();
    } else {
      campaigns = await context.db
        .query("campaigns")
        .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
        .collect();
    }

    // Filter by organization if provided
    if (args.organizationId) {
      campaigns = campaigns.filter((c) => c.organizationId === args.organizationId);
    }

    return campaigns;
  },
});

/**
 * Get a single campaign by ID
 */
export const getById = zodQuery({
  args: { id: zid("campaigns") },
  handler: async (context, { id }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("view campaign");
    }

    const campaign = await context.db.get(id);
    if (!campaign) {
      throw AppErrors.notFound("Campaign", id);
    }

    if (campaign.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("view this campaign");
    }

    return campaign;
  },
});

/**
 * Get campaign with stats
 */
export const getWithStats = zodQuery({
  args: { id: zid("campaigns") },
  handler: async (context, { id }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("view campaign");
    }

    const campaign = await context.db.get(id);
    if (!campaign) {
      throw AppErrors.notFound("Campaign", id);
    }

    if (campaign.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("view this campaign");
    }

    // Get associated agent
    const agent = campaign.agentId ? await context.db.get(campaign.agentId) : null;

    // Get associated script
    const script = campaign.scriptId ? await context.db.get(campaign.scriptId) : null;

    // Count prospects in this campaign
    const prospects = await context.db
      .query("prospects")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();
    const prospectCount = prospects.filter((p) => p.campaignId === id).length;

    return {
      ...campaign,
      agent,
      script,
      prospectCount,
    };
  },
});

// =============================================================================
// Mutations
// =============================================================================

/**
 * Create a new campaign
 */
export const create = zodMutation({
  args: CreateCampaignArgsSchema.shape,
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("create campaign");
    }

    // Verify agent belongs to user
    const agent = await context.db.get(args.agentId);
    if (!agent || agent.userId !== identity.subject) {
      throw AppErrors.notFound("Agent", args.agentId);
    }

    // Verify script belongs to user if provided
    if (args.scriptId) {
      const script = await context.db.get(args.scriptId);
      if (!script || script.userId !== identity.subject) {
        throw AppErrors.notFound("Script", args.scriptId);
      }
    }

    const now = Date.now();
    return await context.db.insert("campaigns", {
      ...args,
      organizationId: args.organizationId ?? null,
      userId: identity.subject,
      status: "draft",
      totalProspects: 0,
      callsCompleted: 0,
      callsInProgress: 0,
      callsFailed: 0,
      meetingsBooked: 0,
      callbacksScheduled: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update an existing campaign
 */
export const update = zodMutation({
  args: UpdateCampaignArgsSchema.shape,
  handler: async (context, { id, ...updates }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("update campaign");
    }

    const existing = await context.db.get(id);
    if (!existing) {
      throw AppErrors.notFound("Campaign", id);
    }

    if (existing.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("update this campaign");
    }

    // Verify agent if being updated
    if (updates.agentId) {
      const agent = await context.db.get(updates.agentId);
      if (!agent || agent.userId !== identity.subject) {
        throw AppErrors.notFound("Agent", updates.agentId);
      }
    }

    // Verify script if being updated
    if (updates.scriptId) {
      const script = await context.db.get(updates.scriptId);
      if (!script || script.userId !== identity.subject) {
        throw AppErrors.notFound("Script", updates.scriptId);
      }
    }

    await context.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

/**
 * Update campaign status
 */
export const updateStatus = zodMutation({
  args: {
    id: zid("campaigns"),
    status: z.enum(campaignStatuses),
  },
  handler: async (context, { id, status }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("update campaign status");
    }

    const existing = await context.db.get(id);
    if (!existing) {
      throw AppErrors.notFound("Campaign", id);
    }

    if (existing.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("update this campaign");
    }

    await context.db.patch(id, {
      status,
      updatedAt: Date.now(),
    });

    return { id, status };
  },
});

/**
 * Start a campaign
 */
export const start = zodMutation({
  args: { id: zid("campaigns") },
  handler: async (context, { id }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("start campaign");
    }

    const existing = await context.db.get(id);
    if (!existing) {
      throw AppErrors.notFound("Campaign", id);
    }

    if (existing.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("start this campaign");
    }

    if (existing.status !== "draft" && existing.status !== "paused") {
      throw AppErrors.invalidState("Campaign", "Can only start draft or paused campaigns");
    }

    await context.db.patch(id, {
      status: "active",
      updatedAt: Date.now(),
    });

    return { id, status: "active" as const };
  },
});

/**
 * Pause a campaign
 */
export const pause = zodMutation({
  args: { id: zid("campaigns") },
  handler: async (context, { id }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("pause campaign");
    }

    const existing = await context.db.get(id);
    if (!existing) {
      throw AppErrors.notFound("Campaign", id);
    }

    if (existing.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("pause this campaign");
    }

    if (existing.status !== "active") {
      throw AppErrors.invalidState("Campaign", "Can only pause active campaigns");
    }

    await context.db.patch(id, {
      status: "paused",
      updatedAt: Date.now(),
    });

    return { id, status: "paused" as const };
  },
});

/**
 * Complete a campaign
 */
export const complete = zodMutation({
  args: { id: zid("campaigns") },
  handler: async (context, { id }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("complete campaign");
    }

    const existing = await context.db.get(id);
    if (!existing) {
      throw AppErrors.notFound("Campaign", id);
    }

    if (existing.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("complete this campaign");
    }

    await context.db.patch(id, {
      status: "completed",
      updatedAt: Date.now(),
    });

    return { id, status: "completed" as const };
  },
});

/**
 * Update campaign stats (internal use for call tracking)
 */
export const updateStats = zodMutation({
  args: {
    id: zid("campaigns"),
    callsCompleted: z.number().int().optional(),
    callsInProgress: z.number().int().optional(),
    callsFailed: z.number().int().optional(),
    meetingsBooked: z.number().int().optional(),
    callbacksScheduled: z.number().int().optional(),
    totalProspects: z.number().int().optional(),
  },
  handler: async (context, { id, ...stats }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("update campaign stats");
    }

    const existing = await context.db.get(id);
    if (!existing) {
      throw AppErrors.notFound("Campaign", id);
    }

    if (existing.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("update this campaign");
    }

    await context.db.patch(id, {
      ...stats,
      updatedAt: Date.now(),
    });

    return id;
  },
});

/**
 * Delete a campaign
 */
export const remove = zodMutation({
  args: { id: zid("campaigns") },
  handler: async (context, { id }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("delete campaign");
    }

    const existing = await context.db.get(id);
    if (!existing) {
      throw AppErrors.notFound("Campaign", id);
    }

    if (existing.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("delete this campaign");
    }

    // Unassign prospects from this campaign
    const prospects = await context.db
      .query("prospects")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();

    for (const prospect of prospects) {
      if (prospect.campaignId === id) {
        await context.db.patch(prospect._id, {
          campaignId: undefined,
          updatedAt: Date.now(),
        });
      }
    }

    await context.db.delete(id);
    return { success: true };
  },
});

/**
 * Archive a campaign
 */
export const archive = zodMutation({
  args: { id: zid("campaigns") },
  handler: async (context, { id }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("archive campaign");
    }

    const existing = await context.db.get(id);
    if (!existing) {
      throw AppErrors.notFound("Campaign", id);
    }

    if (existing.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("archive this campaign");
    }

    await context.db.patch(id, {
      status: "archived",
      updatedAt: Date.now(),
    });

    return { id, status: "archived" as const };
  },
});
