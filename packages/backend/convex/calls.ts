// Server-only enforcement handled by package.json exports

import { z } from "zod";
import { zid } from "zodvex";
import { AppErrors } from "./lib/errors";
import { zodMutation, zodQuery } from "./lib/functions";
import { callDirections, callOutcomes, callSentiments, callStatuses } from "./schema";

// =============================================================================
// Args Schemas
// =============================================================================

const CreateCallArgsSchema = z.object({
  organizationId: zid("organizations").optional(),
  campaignId: zid("campaigns").optional(),
  prospectId: zid("prospects"),
  agentId: zid("agents"),
  scriptId: zid("scripts").optional(),
  phoneNumber: z.string().min(1),
  direction: z.enum(callDirections),
  roomName: z.string().optional(),
  livekitRoomId: z.string().optional(),
  metadata: z.any().optional(),
});

const UpdateCallArgsSchema = z.object({
  id: zid("calls"),
  status: z.enum(callStatuses).optional(),
  outcome: z.enum(callOutcomes).optional(),
  sipParticipantId: z.string().optional(),
  startedAt: z.number().optional(),
  answeredAt: z.number().optional(),
  endedAt: z.number().optional(),
  duration: z.number().optional(),
  recordingUrl: z.string().optional(),
  recordingStorageId: z.string().optional(),
  transcriptStorageId: z.string().optional(),
  fullTranscript: z.string().optional(),
  sentiment: z.enum(callSentiments).optional(),
  keyPoints: z.array(z.string()).optional(),
  actionItems: z.array(z.string()).optional(),
  errorMessage: z.string().optional(),
  sipStatusCode: z.string().optional(),
  metadata: z.any().optional(),
});

// =============================================================================
// Queries
// =============================================================================

/**
 * List all calls for the current user
 */
export const list = zodQuery({
  args: {
    status: z.enum(callStatuses).optional(),
    outcome: z.enum(callOutcomes).optional(),
    campaignId: zid("campaigns").optional(),
    organizationId: zid("organizations").optional(),
    limit: z.number().int().positive().max(100).optional(),
  },
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("view calls");
    }
    const limit = args.limit ?? 50;

    let calls;

    if (args.status) {
      calls = await context.db
        .query("calls")
        .withIndex("by_userId_and_status", (q) =>
          q.eq("userId", identity.subject).eq("status", args.status!),
        )
        .order("desc")
        .take(limit);
    } else {
      calls = await context.db
        .query("calls")
        .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
        .order("desc")
        .take(limit);
    }

    // Filter in memory for optional params
    return calls.filter((call) => {
      if (args.outcome && call.outcome !== args.outcome) return false;
      if (args.campaignId && call.campaignId !== args.campaignId) return false;
      if (args.organizationId && call.organizationId !== args.organizationId) return false;
      return true;
    });
  },
});

/**
 * Get a single call by ID
 */
export const getById = zodQuery({
  args: { id: zid("calls") },
  handler: async (context, { id }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("view call");
    }

    const call = await context.db.get(id);
    if (!call) {
      throw AppErrors.notFound("Call", id);
    }

    if (call.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("view this call");
    }

    return call;
  },
});

/**
 * Get call with related data (prospect, agent, campaign)
 */
export const getWithDetails = zodQuery({
  args: { id: zid("calls") },
  handler: async (context, { id }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("view call");
    }

    const call = await context.db.get(id);
    if (!call) {
      throw AppErrors.notFound("Call", id);
    }

    if (call.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("view this call");
    }

    // Fetch related data
    const prospect = await context.db.get(call.prospectId);
    const agent = await context.db.get(call.agentId);
    const campaign = call.campaignId ? await context.db.get(call.campaignId) : null;
    const script = call.scriptId ? await context.db.get(call.scriptId) : null;

    return {
      ...call,
      prospect,
      agent,
      campaign,
      script,
    };
  },
});

/**
 * Get call by room name (for LiveKit integration)
 */
export const getByRoomName = zodQuery({
  args: { roomName: z.string().min(1) },
  handler: async (context, { roomName }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("view call");
    }

    const call = await context.db
      .query("calls")
      .withIndex("by_roomName", (q) => q.eq("roomName", roomName))
      .first();

    if (!call) {
      throw AppErrors.notFound("Call", roomName);
    }

    if (call.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("view this call");
    }

    return call;
  },
});

/**
 * Get calls for a prospect
 */
export const getByProspect = zodQuery({
  args: {
    prospectId: zid("prospects"),
    limit: z.number().int().positive().max(50).optional(),
  },
  handler: async (context, { prospectId, limit = 20 }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("view calls");
    }

    // Verify prospect belongs to user
    const prospect = await context.db.get(prospectId);
    if (!prospect || prospect.userId !== identity.subject) {
      throw AppErrors.notFound("Prospect", prospectId);
    }

    const calls = await context.db
      .query("calls")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    return calls.filter((call) => call.prospectId === prospectId).slice(0, limit);
  },
});

/**
 * Get recent calls with stats
 */
export const getRecentWithStats = zodQuery({
  args: {
    days: z.number().int().positive().max(30).optional(),
  },
  handler: async (context, { days = 7 }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("view calls");
    }
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;

    const calls = await context.db
      .query("calls")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    const recentCalls = calls.filter((call) => call.createdAt >= cutoffTime);

    // Calculate stats
    const stats = {
      total: recentCalls.length,
      completed: recentCalls.filter((c) => c.status === "completed").length,
      failed: recentCalls.filter((c) => c.status === "failed").length,
      inProgress: recentCalls.filter((c) => c.status === "in_progress").length,
      meetingsBooked: recentCalls.filter((c) => c.outcome === "meeting_booked").length,
      callbacksScheduled: recentCalls.filter((c) => c.outcome === "callback_scheduled").length,
      averageDuration:
        recentCalls.filter((c) => c.duration).reduce((sum, c) => sum + (c.duration ?? 0), 0) /
        (recentCalls.filter((c) => c.duration).length || 1),
    };

    return { calls: recentCalls.slice(0, 20), stats };
  },
});

// =============================================================================
// Mutations
// =============================================================================

/**
 * Create a new call
 */
export const create = zodMutation({
  args: CreateCallArgsSchema.shape,
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("create call");
    }

    // Verify prospect belongs to user
    const prospect = await context.db.get(args.prospectId);
    if (!prospect || prospect.userId !== identity.subject) {
      throw AppErrors.notFound("Prospect", args.prospectId);
    }

    // Verify agent belongs to user
    const agent = await context.db.get(args.agentId);
    if (!agent || agent.userId !== identity.subject) {
      throw AppErrors.notFound("Agent", args.agentId);
    }

    // Verify campaign if provided
    if (args.campaignId) {
      const campaign = await context.db.get(args.campaignId);
      if (!campaign || campaign.userId !== identity.subject) {
        throw AppErrors.notFound("Campaign", args.campaignId);
      }
    }

    // Verify script if provided
    if (args.scriptId) {
      const script = await context.db.get(args.scriptId);
      if (!script || script.userId !== identity.subject) {
        throw AppErrors.notFound("Script", args.scriptId);
      }
    }

    const now = Date.now();
    return await context.db.insert("calls", {
      ...args,
      organizationId: args.organizationId ?? null,
      campaignId: args.campaignId,
      scriptId: args.scriptId,
      userId: identity.subject,
      status: "initiated",
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update an existing call
 */
export const update = zodMutation({
  args: UpdateCallArgsSchema.shape,
  handler: async (context, { id, ...updates }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("update call");
    }

    const existing = await context.db.get(id);
    if (!existing) {
      throw AppErrors.notFound("Call", id);
    }

    if (existing.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("update this call");
    }

    await context.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

/**
 * Update call status
 */
export const updateStatus = zodMutation({
  args: {
    id: zid("calls"),
    status: z.enum(callStatuses),
    errorMessage: z.string().optional(),
    sipStatusCode: z.string().optional(),
  },
  handler: async (context, { id, status, errorMessage, sipStatusCode }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("update call status");
    }

    const existing = await context.db.get(id);
    if (!existing) {
      throw AppErrors.notFound("Call", id);
    }

    if (existing.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("update this call");
    }

    const now = Date.now();
    const updates: Record<string, unknown> = {
      status,
      updatedAt: now,
    };

    // Set timing based on status
    if (status === "answered" && !existing.answeredAt) {
      updates.answeredAt = now;
    }
    if ((status === "completed" || status === "failed") && !existing.endedAt) {
      updates.endedAt = now;
      if (existing.startedAt) {
        updates.duration = now - existing.startedAt;
      }
    }
    if (errorMessage) {
      updates.errorMessage = errorMessage;
    }
    if (sipStatusCode) {
      updates.sipStatusCode = sipStatusCode;
    }

    await context.db.patch(id, updates);

    return { id, status };
  },
});

/**
 * Set call outcome
 */
export const setOutcome = zodMutation({
  args: {
    id: zid("calls"),
    outcome: z.enum(callOutcomes),
    sentiment: z.enum(callSentiments).optional(),
    keyPoints: z.array(z.string()).optional(),
    actionItems: z.array(z.string()).optional(),
  },
  handler: async (context, { id, outcome, sentiment, keyPoints, actionItems }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("set call outcome");
    }

    const existing = await context.db.get(id);
    if (!existing) {
      throw AppErrors.notFound("Call", id);
    }

    if (existing.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("update this call");
    }

    await context.db.patch(id, {
      outcome,
      sentiment,
      keyPoints,
      actionItems,
      updatedAt: Date.now(),
    });

    // Update prospect status based on outcome
    if (existing.prospectId) {
      const prospectStatusMap: Record<string, string> = {
        meeting_booked: "meeting_scheduled",
        callback_scheduled: "callback_scheduled",
        interested: "interested",
        not_interested: "not_interested",
        wrong_number: "invalid_contact",
      };

      const newStatus = prospectStatusMap[outcome];
      if (newStatus) {
        await context.db.patch(existing.prospectId, {
          status: newStatus as
            | "meeting_scheduled"
            | "callback_scheduled"
            | "interested"
            | "not_interested"
            | "invalid_contact",
          lastCallResult: outcome,
          lastContactedAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }

    return { id, outcome };
  },
});

/**
 * Add transcript to call
 */
export const addTranscript = zodMutation({
  args: {
    id: zid("calls"),
    fullTranscript: z.string(),
    transcriptStorageId: z.string().optional(),
  },
  handler: async (context, { id, fullTranscript, transcriptStorageId }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("add call transcript");
    }

    const existing = await context.db.get(id);
    if (!existing) {
      throw AppErrors.notFound("Call", id);
    }

    if (existing.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("update this call");
    }

    await context.db.patch(id, {
      fullTranscript,
      transcriptStorageId,
      updatedAt: Date.now(),
    });

    return id;
  },
});

/**
 * Add recording to call
 */
export const addRecording = zodMutation({
  args: {
    id: zid("calls"),
    recordingUrl: z.string().optional(),
    recordingStorageId: z.string().optional(),
  },
  handler: async (context, { id, recordingUrl, recordingStorageId }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("add call recording");
    }

    const existing = await context.db.get(id);
    if (!existing) {
      throw AppErrors.notFound("Call", id);
    }

    if (existing.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("update this call");
    }

    await context.db.patch(id, {
      recordingUrl,
      recordingStorageId,
      updatedAt: Date.now(),
    });

    return id;
  },
});

/**
 * End a call
 */
export const end = zodMutation({
  args: {
    id: zid("calls"),
    status: z.enum(["completed", "failed", "no_answer", "busy"]).optional(),
    outcome: z.enum(callOutcomes).optional(),
    errorMessage: z.string().optional(),
  },
  handler: async (context, { id, status = "completed", outcome, errorMessage }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("end call");
    }

    const existing = await context.db.get(id);
    if (!existing) {
      throw AppErrors.notFound("Call", id);
    }

    if (existing.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("end this call");
    }

    const now = Date.now();
    const duration = existing.startedAt ? now - existing.startedAt : undefined;

    await context.db.patch(id, {
      status,
      outcome,
      endedAt: now,
      duration,
      errorMessage,
      updatedAt: now,
    });

    // Update campaign stats if applicable
    if (existing.campaignId) {
      const campaign = await context.db.get(existing.campaignId);
      if (campaign) {
        const updates: Record<string, number> = {
          callsInProgress: Math.max(0, campaign.callsInProgress - 1),
        };
        if (status === "completed") {
          updates.callsCompleted = campaign.callsCompleted + 1;
        } else if (status === "failed" || status === "no_answer" || status === "busy") {
          updates.callsFailed = campaign.callsFailed + 1;
        }
        if (outcome === "meeting_booked") {
          updates.meetingsBooked = campaign.meetingsBooked + 1;
        }
        if (outcome === "callback_scheduled") {
          updates.callbacksScheduled = campaign.callbacksScheduled + 1;
        }

        await context.db.patch(existing.campaignId, {
          ...updates,
          updatedAt: now,
        });
      }
    }

    return { id, status, duration };
  },
});

/**
 * Delete a call
 */
export const remove = zodMutation({
  args: { id: zid("calls") },
  handler: async (context, { id }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("delete call");
    }

    const existing = await context.db.get(id);
    if (!existing) {
      throw AppErrors.notFound("Call", id);
    }

    if (existing.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("delete this call");
    }

    // Delete associated transcripts
    const transcripts = await context.db
      .query("callTranscripts")
      .withIndex("by_callId_and_timestamp", (q) => q.eq("callId", id))
      .collect();

    for (const transcript of transcripts) {
      await context.db.delete(transcript._id);
    }

    await context.db.delete(id);
    return { success: true };
  },
});
