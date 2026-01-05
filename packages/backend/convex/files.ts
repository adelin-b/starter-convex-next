// Server-only enforcement handled by package.json exports

import { z } from "zod";
import { zid } from "zodvex";
import { AppErrors } from "./lib/errors";
import { zodMutation, zodQuery } from "./lib/functions";
import { fileCategories } from "./schema";

// =============================================================================
// Files Mutations
// =============================================================================

/**
 * Generate an upload URL for file storage
 */
export const generateUploadUrl = zodMutation({
  args: {},
  handler: async (context) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("upload files");
    }

    return await context.storage.generateUploadUrl();
  },
});

/**
 * Save file metadata after upload
 */
export const saveFileMetadata = zodMutation({
  args: {
    storageId: zid("_storage"),
    name: z.string(),
    size: z.number(),
    type: z.string(),
    category: z.enum(fileCategories).optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    organizationId: zid("organizations").optional(),
  },
  handler: async (context, args) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("save file");
    }

    return await context.db.insert("files", {
      ...args,
      userId: identity.subject,
      organizationId: args.organizationId ?? null,
      uploadedAt: Date.now(),
    });
  },
});

/**
 * Delete a file
 */
export const deleteFile = zodMutation({
  args: {
    storageId: zid("_storage"),
  },
  handler: async (context, { storageId }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("delete file");
    }

    // Find the file record
    const file = await context.db
      .query("files")
      .withIndex("by_storageId", (q) => q.eq("storageId", storageId))
      .first();

    if (!file) {
      throw AppErrors.notFound("File", storageId);
    }

    if (file.userId !== identity.subject) {
      throw AppErrors.insufficientPermissions("delete this file");
    }

    // Delete the file from storage
    await context.storage.delete(storageId);

    // Delete the file record
    await context.db.delete(file._id);

    return { success: true };
  },
});

// =============================================================================
// Files Queries
// =============================================================================

/**
 * Get file URL by storage ID
 */
export const getFileUrl = zodQuery({
  args: {
    storageId: zid("_storage"),
  },
  handler: async (context, { storageId }) => await context.storage.getUrl(storageId),
});

/**
 * Get multiple file URLs
 */
export const getFileUrls = zodQuery({
  args: {
    storageIds: z.array(zid("_storage")),
  },
  handler: async (context, { storageIds }) => {
    const urls = await Promise.all(
      storageIds.map(async (id) => ({
        storageId: id,
        url: await context.storage.getUrl(id),
      })),
    );
    return urls;
  },
});

/**
 * Get all files for the current user
 */
export const getUserFiles = zodQuery({
  args: {},
  handler: async (context) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("view files");
    }

    return await context.db
      .query("files")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});

/**
 * Get files by category for the current user
 */
export const getUserFilesByCategory = zodQuery({
  args: {
    category: z.enum(fileCategories),
  },
  handler: async (context, { category }) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) {
      throw AppErrors.notAuthenticated("view files");
    }

    return await context.db
      .query("files")
      .withIndex("by_userId_and_category", (q) =>
        q.eq("userId", identity.subject).eq("category", category),
      )
      .collect();
  },
});

/**
 * Get file by storage ID
 */
export const getFileByStorageId = zodQuery({
  args: {
    storageId: zid("_storage"),
  },
  handler: async (context, { storageId }) => {
    const file = await context.db
      .query("files")
      .withIndex("by_storageId", (q) => q.eq("storageId", storageId))
      .first();

    if (!file) {
      return null;
    }

    // Get URL
    const url = await context.storage.getUrl(storageId);

    return {
      ...file,
      url,
    };
  },
});
