import { api } from "@starter-saas/backend/convex/_generated/api";
import type { Id } from "@starter-saas/backend/convex/_generated/dataModel";
import { useQuery } from "convex-helpers/react/cache/hooks";

/**
 * Hook for fetching multiple image URLs from storage IDs.
 * Utility for batch image URL fetching (kept for future use).
 * @public
 */
export function useImageUrls(storageIds: (Id<"_storage"> | string | null | undefined)[]) {
  // Filter out null/undefined values and convert to proper types
  const validStorageIds = storageIds.filter(
    (id): id is Id<"_storage"> => id !== null && id !== undefined && typeof id === "string",
  ) as Id<"_storage">[];

  const result = useQuery(
    api.images.getImageUrls,
    validStorageIds.length > 0 ? { storageIds: validStorageIds } : "skip",
  );

  return result;
}
