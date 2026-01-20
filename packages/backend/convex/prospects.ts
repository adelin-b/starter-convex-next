// Server-only enforcement handled by package.json exports

import { z } from "zod";
import { zid } from "zodvex";
import { AppErrors } from "./lib/errors";
import { zodMutation, zodQuery } from "./lib/functions";
import { prospectStatuses } from "./schema";

// =============================================================================
// Args Schemas
// =============================================================================

const CreateProspectArgsSchema = z.object({
  organizationId: zid("organizations").optional(),
  campaignId: zid("campaigns").optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().min(1),
  email: z.string().email().optional(),
  company: z.string().optional(),
  title: z.string().optional(),
  customFields: z.any().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

const UpdateProspectArgsSchema = CreateProspectArgsSchema.partial().extend({
  id: zid("prospects"),
  status: z.enum(prospectStatuses).optional(),
  lastContactedAt: z.number().optional(),
  lastCallResult: z.string().optional(),
});

// =============================================================================
// Queries
// =============================================================================

/**
 * List all prospects for the current user
 */
export const list = zodQuery({
  args: {
    status: z.enum(prospectStatuses).optional(),
    campaignId: zid("campaigns").optional(),
    organizationId: zid("organizations").optional(),
  },
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("view prospects");
    }

    const status = args.status;

    const prospects = status
      ? await context.db
          .query("prospects")
          .withIndex("by_userId_and_status", (q) =>
            q.eq("userId", identity.subject).eq("status", status),
          )
          .collect()
      : await context.db
          .query("prospects")
          .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
          .collect();

    // Filter in memory for optional params
    return prospects.filter((prospect) => {
      if (args.campaignId && prospect.campaignId !== args.campaignId) {
        return false;
      }
      if (args.organizationId && prospect.organizationId !== args.organizationId) {
        return false;
      }
      return true;
    });
  },
});

/**
 * Get a single prospect by ID
 */
export const getById = zodQuery({
  args: { id: zid("prospects") },
  handler: async (context, { id }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("view prospect");
    }

    const prospect = await context.db.get(id);
    if (!prospect) {
      throw AppErrors.notFound("Prospect", id);
    }

    if (prospect.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("view this prospect");
    }

    return prospect;
  },
});

/**
 * Get prospects by phone number
 */
export const getByPhoneNumber = zodQuery({
  args: { phoneNumber: z.string().min(1) },
  handler: async (context, { phoneNumber }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("view prospects");
    }

    const prospects = await context.db
      .query("prospects")
      .withIndex("by_phoneNumber", (q) => q.eq("phoneNumber", phoneNumber))
      .collect();

    // Filter to only user's prospects
    return prospects.filter((prospect) => prospect.userId === identity.subject);
  },
});

/**
 * Search prospects by name or phone
 */
export const search = zodQuery({
  args: {
    query: z.string().min(1),
    limit: z.number().int().positive().max(100).optional(),
  },
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("search prospects");
    }
    const limit = args.limit ?? 20;
    const searchQuery = args.query.toLowerCase();

    const prospects = await context.db
      .query("prospects")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();

    // Filter by search query
    const filtered = prospects.filter((prospect) => {
      const fullName = `${prospect.firstName ?? ""} ${prospect.lastName ?? ""}`.toLowerCase();
      const phone = prospect.phoneNumber.toLowerCase();
      const email = (prospect.email ?? "").toLowerCase();
      const company = (prospect.company ?? "").toLowerCase();

      return (
        fullName.includes(searchQuery) ||
        phone.includes(searchQuery) ||
        email.includes(searchQuery) ||
        company.includes(searchQuery)
      );
    });

    return filtered.slice(0, limit);
  },
});

// =============================================================================
// Mutations
// =============================================================================

/**
 * Create a new prospect
 */
export const create = zodMutation({
  args: CreateProspectArgsSchema.shape,
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("create prospect");
    }

    const now = Date.now();
    return await context.db.insert("prospects", {
      ...args,
      organizationId: args.organizationId ?? null,
      userId: identity.subject,
      status: "new",
      totalCallAttempts: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Bulk create prospects
 */
export const bulkCreate = zodMutation({
  args: {
    prospects: z.array(CreateProspectArgsSchema),
  },
  handler: async (context, { prospects }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("create prospects");
    }

    const now = Date.now();
    const ids = [];

    for (const prospect of prospects) {
      const id = await context.db.insert("prospects", {
        ...prospect,
        organizationId: prospect.organizationId ?? null,
        userId: identity.subject,
        status: "new",
        totalCallAttempts: 0,
        createdAt: now,
        updatedAt: now,
      });
      ids.push(id);
    }

    return { created: ids.length, ids };
  },
});

/**
 * Update an existing prospect
 */
export const update = zodMutation({
  args: UpdateProspectArgsSchema.shape,
  handler: async (context, { id, ...updates }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("update prospect");
    }

    const existing = await context.db.get(id);
    if (!existing) {
      throw AppErrors.notFound("Prospect", id);
    }

    if (existing.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("update this prospect");
    }

    await context.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

/**
 * Update prospect status
 */
export const updateStatus = zodMutation({
  args: {
    id: zid("prospects"),
    status: z.enum(prospectStatuses),
  },
  handler: async (context, { id, status }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("update prospect status");
    }

    const existing = await context.db.get(id);
    if (!existing) {
      throw AppErrors.notFound("Prospect", id);
    }

    if (existing.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("update this prospect");
    }

    await context.db.patch(id, {
      status,
      updatedAt: Date.now(),
    });

    return { id, status };
  },
});

/**
 * Record a call attempt
 */
export const recordCallAttempt = zodMutation({
  args: {
    id: zid("prospects"),
    result: z.string().optional(),
    status: z.enum(prospectStatuses).optional(),
  },
  handler: async (context, { id, result, status }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("record call attempt");
    }

    const existing = await context.db.get(id);
    if (!existing) {
      throw AppErrors.notFound("Prospect", id);
    }

    if (existing.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("update this prospect");
    }

    const now = Date.now();
    await context.db.patch(id, {
      totalCallAttempts: existing.totalCallAttempts + 1,
      lastContactedAt: now,
      lastCallResult: result,
      ...(status && { status }),
      updatedAt: now,
    });

    return { id, totalCallAttempts: existing.totalCallAttempts + 1 };
  },
});

/**
 * Delete a prospect
 */
export const remove = zodMutation({
  args: { id: zid("prospects") },
  handler: async (context, { id }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("delete prospect");
    }

    const existing = await context.db.get(id);
    if (!existing) {
      throw AppErrors.notFound("Prospect", id);
    }

    if (existing.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("delete this prospect");
    }

    await context.db.delete(id);
    return { success: true };
  },
});

/**
 * Bulk delete prospects
 */
export const bulkRemove = zodMutation({
  args: {
    ids: z.array(zid("prospects")),
  },
  handler: async (context, { ids }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("delete prospects");
    }

    let deleted = 0;
    for (const id of ids) {
      const existing = await context.db.get(id);
      if (existing && existing.userId === identity.subject) {
        await context.db.delete(id);
        deleted++;
      }
    }

    return { deleted };
  },
});

/**
 * Assign prospects to campaign
 */
export const assignToCampaign = zodMutation({
  args: {
    prospectIds: z.array(zid("prospects")),
    campaignId: zid("campaigns"),
  },
  handler: async (context, { prospectIds, campaignId }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("assign prospects to campaign");
    }

    // Verify campaign belongs to user
    const campaign = await context.db.get(campaignId);
    if (!campaign || campaign.userId !== identity.subject) {
      throw AppErrors.notFound("Campaign", campaignId);
    }

    let assigned = 0;
    const now = Date.now();

    for (const id of prospectIds) {
      const prospect = await context.db.get(id);
      if (prospect && prospect.userId === identity.subject) {
        await context.db.patch(id, {
          campaignId,
          updatedAt: now,
        });
        assigned++;
      }
    }

    return { assigned, campaignId };
  },
});
