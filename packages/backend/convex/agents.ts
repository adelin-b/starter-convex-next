// Server-only enforcement handled by package.json exports

import { z } from "zod";
import { zid } from "zodvex";
import { AppErrors } from "./lib/errors";
import { zodMutation, zodQuery } from "./lib/functions";
import {
  agentConfigSchema,
  agentTypes,
  dataSchemaSchema,
  integrationsSchema,
  llmProviders,
  sttProviders,
  ttsProviders,
  turnDetectionModes,
} from "./schema";

// =============================================================================
// Args Schemas
// =============================================================================

const CreateAgentArgsSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  type: z.enum(agentTypes).optional(),
  organizationId: zid("organizations").optional(),
  // Chat-specific
  templateId: zid("agentTemplates").optional(),
  folderId: zid("agentFolders").optional(),
  dataSchema: dataSchemaSchema.optional(),
  config: agentConfigSchema.optional(),
  integrations: integrationsSchema.optional(),
  // Voice-specific
  instructions: z.string().optional(),
  greetingMessage: z.string().optional(),
  sttProvider: z.enum(sttProviders).optional(),
  sttModel: z.string().optional(),
  sttLanguage: z.string().optional(),
  llmProvider: z.enum(llmProviders).optional(),
  llmModel: z.string().optional(),
  llmTemperature: z.number().optional(),
  llmMaxTokens: z.number().optional(),
  ttsProvider: z.enum(ttsProviders).optional(),
  ttsVoice: z.string().optional(),
  ttsModel: z.string().optional(),
  ttsSpeakingRate: z.number().optional(),
  vadEnabled: z.boolean().optional(),
  vadProvider: z.string().optional(),
  allowInterruptions: z.boolean().optional(),
  minInterruptionDuration: z.number().optional(),
  minEndpointingDelay: z.number().optional(),
  maxEndpointingDelay: z.number().optional(),
  turnDetection: z.enum(turnDetectionModes).optional(),
  preemptiveGeneration: z.boolean().optional(),
  transcriptionEnabled: z.boolean().optional(),
  maxToolSteps: z.number().optional(),
});

const UpdateAgentArgsSchema = CreateAgentArgsSchema.partial().extend({
  id: zid("agents"),
  isActive: z.boolean().optional(),
  order: z.number().optional(),
});

// =============================================================================
// Queries
// =============================================================================

/**
 * List all agents for the current user
 */
export const list = zodQuery({
  args: {
    type: z.enum(agentTypes).optional(),
    isActive: z.boolean().optional(),
    organizationId: zid("organizations").optional(),
  },
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("view agents");
    }

    const query = context.db
      .query("agents")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject));

    const agents = await query.collect();

    // Filter in memory for optional params
    return agents.filter((agent) => {
      if (args.type && agent.type !== args.type) return false;
      if (args.isActive !== undefined && agent.isActive !== args.isActive) return false;
      if (args.organizationId && agent.organizationId !== args.organizationId) return false;
      return true;
    });
  },
});

/**
 * Get a single agent by ID
 */
export const getById = zodQuery({
  args: { id: zid("agents") },
  handler: async (context, { id }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("view agent");
    }

    const agent = await context.db.get(id);
    if (!agent) {
      throw AppErrors.notFound("Agent", id);
    }

    if (agent.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("view this agent");
    }

    return agent;
  },
});

/**
 * Get agent by ID for LiveKit agent (server-to-server auth)
 */
export const getByIdForAgent = zodQuery({
  args: {
    id: zid("agents"),
    systemToken: z.string(),
  },
  handler: async (context, { id, systemToken }) => {
    // Verify system token
    const expectedToken = process.env.CONVEX_SYSTEM_ADMIN_TOKEN;
    if (!expectedToken || systemToken !== expectedToken) {
      throw AppErrors.insufficientPermissions("access agent config");
    }

    const agent = await context.db.get(id);
    if (!agent) {
      throw AppErrors.notFound("Agent", id);
    }

    return agent;
  },
});

/**
 * Get agents by folder
 */
export const getByFolder = zodQuery({
  args: { folderId: zid("agentFolders") },
  handler: async (context, { folderId }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("view agents");
    }

    const agents = await context.db
      .query("agents")
      .withIndex("folderId", (q) => q.eq("folderId", folderId))
      .collect();

    // Filter to only user's agents
    return agents.filter((agent) => agent.userId === identity.subject);
  },
});

// =============================================================================
// Mutations
// =============================================================================

/**
 * Create a new agent
 */
export const create = zodMutation({
  args: CreateAgentArgsSchema.shape,
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("create agent");
    }

    const now = Date.now();
    return await context.db.insert("agents", {
      ...args,
      userId: identity.subject,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update an existing agent
 */
export const update = zodMutation({
  args: UpdateAgentArgsSchema.shape,
  handler: async (context, { id, ...updates }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("update agent");
    }

    const existing = await context.db.get(id);
    if (!existing) {
      throw AppErrors.notFound("Agent", id);
    }

    if (existing.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("update this agent");
    }

    await context.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

/**
 * Delete an agent
 */
export const remove = zodMutation({
  args: { id: zid("agents") },
  handler: async (context, { id }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("delete agent");
    }

    const existing = await context.db.get(id);
    if (!existing) {
      throw AppErrors.notFound("Agent", id);
    }

    if (existing.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("delete this agent");
    }

    await context.db.delete(id);
    return { success: true };
  },
});

/**
 * Toggle agent active status
 */
export const toggleActive = zodMutation({
  args: { id: zid("agents") },
  handler: async (context, { id }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("toggle agent");
    }

    const existing = await context.db.get(id);
    if (!existing) {
      throw AppErrors.notFound("Agent", id);
    }

    if (existing.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("toggle this agent");
    }

    const newStatus = !existing.isActive;
    await context.db.patch(id, {
      isActive: newStatus,
      updatedAt: Date.now(),
    });

    return { id, isActive: newStatus };
  },
});

/**
 * Read/get a single agent by ID (alias for getById)
 */
export const read = zodQuery({
  args: { id: zid("agents") },
  handler: async (context, { id }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("view agent");
    }

    const agent = await context.db.get(id);
    if (!agent) {
      throw AppErrors.notFound("Agent", id);
    }

    if (agent.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("view this agent");
    }

    return agent;
  },
});

/**
 * Move agent to folder
 */
export const moveToFolder = zodMutation({
  args: {
    id: zid("agents"),
    folderId: zid("agentFolders").optional(),
  },
  handler: async (context, { id, folderId }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("move agent");
    }

    const existing = await context.db.get(id);
    if (!existing) {
      throw AppErrors.notFound("Agent", id);
    }

    if (existing.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("move this agent");
    }

    // Verify folder belongs to user if provided
    if (folderId) {
      const folder = await context.db.get(folderId);
      if (!folder || folder.userId !== identity.subject) {
        throw AppErrors.notFound("Folder", folderId);
      }
    }

    await context.db.patch(id, {
      folderId,
      updatedAt: Date.now(),
    });

    return { id, folderId };
  },
});
