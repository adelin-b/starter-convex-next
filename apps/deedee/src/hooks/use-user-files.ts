import { api } from "@starter-saas/backend/convex/_generated/api";
import type { Id } from "@starter-saas/backend/convex/_generated/dataModel";
import { useQuery } from "convex-helpers/react/cache/hooks";

export function useUserFiles() {
  return useQuery(api.files.getUserFiles);
}

function _useUserFilesByCategory(
  category:
    | "profile_image"
    | "kyc_document"
    | "proof_of_address"
    | "proof_of_identity"
    | "general"
    | "other",
) {
  return useQuery(api.files.getUserFilesByCategory, { category });
}

function _useFileByStorageId(storageId: string | undefined) {
  return useQuery(
    api.files.getFileByStorageId,
    storageId ? { storageId: storageId as Id<"_storage"> } : "skip",
  );
}
