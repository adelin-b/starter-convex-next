import { api } from "@starter-saas/backend/convex/_generated/api";
import type { Id } from "@starter-saas/backend/convex/_generated/dataModel";
import { useQuery } from "convex-helpers/react/cache/hooks";

/**
 * Hook for fetching a single image URL from a storage ID.
 * Uses the files API to get the URL.
 * @public
 */
export function useImageUrl(storageId: Id<"_storage"> | string | null | undefined) {
  const result = useQuery(
    api.files.getFileUrl,
    storageId ? { storageId: storageId as Id<"_storage"> } : "skip",
  );

  return result;
}
