// Server-only enforcement handled by package.json exports

import { z } from "zod";
import { zid } from "zodvex";
import { AppErrors } from "./lib/errors";
import { zodMutation, zodQuery } from "./lib/functions";
import { scriptCategories } from "./schema";

// =============================================================================
// Args Schemas
// =============================================================================

const CreateScriptArgsSchema = z.object({
  organizationId: zid("organizations").optional(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.enum(scriptCategories).optional(),
  greetingPrompt: z.string().min(1),
  mainPrompt: z.string().min(1),
  objectionHandling: z.string().optional(),
  closingPrompt: z.string().optional(),
  variables: z.array(z.string()).optional(),
  exampleConversation: z.string().optional(),
  isPublic: z.boolean().optional(),
});

const UpdateScriptArgsSchema = CreateScriptArgsSchema.partial().extend({
  id: zid("scripts"),
});

// =============================================================================
// Queries
// =============================================================================

/**
 * List all scripts for the current user
 */
export const list = zodQuery({
  args: {
    category: z.enum(scriptCategories).optional(),
    isPublic: z.boolean().optional(),
    organizationId: zid("organizations").optional(),
  },
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("view scripts");
    }

    // Get user's own scripts
    const scripts = await context.db
      .query("scripts")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();

    // Also include public scripts from other users
    if (args.isPublic !== false) {
      const publicScripts = await context.db
        .query("scripts")
        .withIndex("by_isPublic", (q) => q.eq("isPublic", true))
        .collect();

      // Merge, avoiding duplicates
      const userScriptIds = new Set(scripts.map((s) => s._id));
      for (const publicScript of publicScripts) {
        if (!userScriptIds.has(publicScript._id)) {
          scripts.push(publicScript);
        }
      }
    }

    // Filter in memory for optional params
    return scripts.filter((script) => {
      if (args.category && script.category !== args.category) {
        return false;
      }
      if (args.isPublic !== undefined && script.isPublic !== args.isPublic) {
        return false;
      }
      if (args.organizationId && script.organizationId !== args.organizationId) {
        return false;
      }
      return true;
    });
  },
});

/**
 * Get a single script by ID
 */
export const getById = zodQuery({
  args: { id: zid("scripts") },
  handler: async (context, { id }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("view script");
    }

    const script = await context.db.get(id);
    if (!script) {
      throw AppErrors.notFound("Script", id);
    }

    // Allow access to own scripts or public scripts
    if (script.userId !== identity.subject && !script.isPublic) {
      throw AppErrors.insufficientPermissions("view this script");
    }

    return script;
  },
});

/**
 * Get scripts by category
 */
export const getByCategory = zodQuery({
  args: { category: z.enum(scriptCategories) },
  handler: async (context, { category }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("view scripts");
    }

    const scripts = await context.db
      .query("scripts")
      .withIndex("by_category", (q) => q.eq("category", category))
      .collect();

    // Filter to only user's scripts or public scripts
    return scripts.filter((script) => script.userId === identity.subject || script.isPublic);
  },
});

/**
 * Get public scripts (for marketplace/templates)
 */
export const getPublic = zodQuery({
  args: {
    category: z.enum(scriptCategories).optional(),
    limit: z.number().int().positive().max(100).optional(),
  },
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("view public scripts");
    }
    const limit = args.limit ?? 50;

    let scripts = await context.db
      .query("scripts")
      .withIndex("by_isPublic", (q) => q.eq("isPublic", true))
      .collect();

    if (args.category) {
      scripts = scripts.filter((s) => s.category === args.category);
    }

    // Sort by usage count (most popular first)
    scripts.sort((a, b) => b.usageCount - a.usageCount);

    return scripts.slice(0, limit);
  },
});

/**
 * Search scripts by name or description
 */
export const search = zodQuery({
  args: {
    query: z.string().min(1),
    includePublic: z.boolean().optional(),
    limit: z.number().int().positive().max(100).optional(),
  },
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("search scripts");
    }
    const limit = args.limit ?? 20;
    const searchQuery = args.query.toLowerCase();

    // Get user's scripts
    const scripts = await context.db
      .query("scripts")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();

    // Include public scripts if requested
    if (args.includePublic !== false) {
      const publicScripts = await context.db
        .query("scripts")
        .withIndex("by_isPublic", (q) => q.eq("isPublic", true))
        .collect();

      const userScriptIds = new Set(scripts.map((s) => s._id));
      for (const publicScript of publicScripts) {
        if (!userScriptIds.has(publicScript._id)) {
          scripts.push(publicScript);
        }
      }
    }

    // Filter by search query
    const filtered = scripts.filter((script) => {
      const name = script.name.toLowerCase();
      const description = (script.description ?? "").toLowerCase();
      const category = (script.category ?? "").toLowerCase();

      return (
        name.includes(searchQuery) ||
        description.includes(searchQuery) ||
        category.includes(searchQuery)
      );
    });

    return filtered.slice(0, limit);
  },
});

// =============================================================================
// Mutations
// =============================================================================

/**
 * Create a new script
 */
export const create = zodMutation({
  args: CreateScriptArgsSchema.shape,
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("create script");
    }

    const now = Date.now();
    return await context.db.insert("scripts", {
      ...args,
      organizationId: args.organizationId ?? null,
      userId: identity.subject,
      isPublic: args.isPublic ?? false,
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update an existing script
 */
export const update = zodMutation({
  args: UpdateScriptArgsSchema.shape,
  handler: async (context, { id, ...updates }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("update script");
    }

    const existing = await context.db.get(id);
    if (!existing) {
      throw AppErrors.notFound("Script", id);
    }

    if (existing.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("update this script");
    }

    await context.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

/**
 * Toggle script public status
 */
export const togglePublic = zodMutation({
  args: { id: zid("scripts") },
  handler: async (context, { id }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("toggle script visibility");
    }

    const existing = await context.db.get(id);
    if (!existing) {
      throw AppErrors.notFound("Script", id);
    }

    if (existing.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("modify this script");
    }

    const newStatus = !existing.isPublic;
    await context.db.patch(id, {
      isPublic: newStatus,
      updatedAt: Date.now(),
    });

    return { id, isPublic: newStatus };
  },
});

/**
 * Increment usage count (called when script is used in a call)
 */
export const incrementUsage = zodMutation({
  args: { id: zid("scripts") },
  handler: async (context, { id }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("use script");
    }

    const existing = await context.db.get(id);
    if (!existing) {
      throw AppErrors.notFound("Script", id);
    }

    // Allow incrementing usage for own scripts or public scripts
    if (existing.userId !== identity.subject && !existing.isPublic) {
      throw AppErrors.insufficientPermissions("use this script");
    }

    await context.db.patch(id, {
      usageCount: existing.usageCount + 1,
      updatedAt: Date.now(),
    });

    return { id, usageCount: existing.usageCount + 1 };
  },
});

/**
 * Duplicate a script (clone for editing)
 */
export const duplicate = zodMutation({
  args: {
    id: zid("scripts"),
    name: z.string().optional(),
  },
  handler: async (context, { id, name }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("duplicate script");
    }

    const existing = await context.db.get(id);
    if (!existing) {
      throw AppErrors.notFound("Script", id);
    }

    // Allow duplicating own scripts or public scripts
    if (existing.userId !== identity.subject && !existing.isPublic) {
      throw AppErrors.insufficientPermissions("duplicate this script");
    }

    const now = Date.now();
    const newScript = {
      userId: identity.subject,
      organizationId: existing.organizationId,
      name: name ?? `${existing.name} (Copy)`,
      description: existing.description,
      category: existing.category,
      greetingPrompt: existing.greetingPrompt,
      mainPrompt: existing.mainPrompt,
      objectionHandling: existing.objectionHandling,
      closingPrompt: existing.closingPrompt,
      variables: existing.variables,
      exampleConversation: existing.exampleConversation,
      isPublic: false, // Copies are private by default
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    return await context.db.insert("scripts", newScript);
  },
});

/**
 * Delete a script
 */
export const remove = zodMutation({
  args: { id: zid("scripts") },
  handler: async (context, { id }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("delete script");
    }

    const existing = await context.db.get(id);
    if (!existing) {
      throw AppErrors.notFound("Script", id);
    }

    if (existing.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("delete this script");
    }

    await context.db.delete(id);
    return { success: true };
  },
});
