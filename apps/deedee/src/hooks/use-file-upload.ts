import { api } from "@starter-saas/backend/convex/_generated/api";
import type { Id } from "@starter-saas/backend/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { getFileTypeCategory } from "@/utils/file-utils";

// Constants for file upload configuration
const BYTES_PER_KB = 1024;
const BYTES_PER_MB = BYTES_PER_KB * BYTES_PER_KB;
const DEFAULT_MAX_FILE_SIZE_MB = 10;
const DEFAULT_MAX_FILE_SIZE = DEFAULT_MAX_FILE_SIZE_MB * BYTES_PER_MB;
const PERCENTAGE_MULTIPLIER = 100;
const HTTP_OK = 200;
const COMPLETE_PROGRESS = 100;

export type FileUploadOptions = {
  maxSize?: number; // in bytes
  allowedTypes?: string[]; // MIME types
  onProgress?: (progress: number) => void;
  onSuccess?: (storageId: Id<"_storage">, file: File) => void;
  onError?: (error: Error) => void;
};

export type FileUploadResult = {
  storageId: Id<"_storage"> | null;
  error: string | null;
  isUploading: boolean;
  progress: number;
};

export function useFileUpload(options: FileUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveFileMetadata = useMutation(api.files.saveFileMetadata);
  const deleteFile = useMutation(api.files.deleteFile);

  const {
    maxSize = DEFAULT_MAX_FILE_SIZE,
    allowedTypes = [], // No restrictions by default
    onProgress,
    onSuccess,
    onError,
  } = options;

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file size
      if (file.size > maxSize) {
        return `File size must be less than ${Math.round(maxSize / BYTES_PER_MB)}MB`;
      }

      // Check file type if restrictions are set
      if (allowedTypes.length > 0) {
        const isAllowed = allowedTypes.some((allowedType) => {
          if (allowedType.endsWith("/*")) {
            // Handle wildcard patterns like "image/*", "video/*", etc.
            const baseType = allowedType.slice(0, -2);
            return file.type.startsWith(`${baseType}/`);
          }
          // Handle exact matches
          return file.type === allowedType;
        });

        if (!isAllowed) {
          return `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(", ")}`;
        }
      }

      return null;
    },
    [maxSize, allowedTypes],
  );

  // Helper function to save file metadata after successful upload
  const saveMetadata = useCallback(
    async (file: File, storageId: Id<"_storage">) => {
      try {
        await saveFileMetadata({
          name: file.name,
          size: file.size,
          type: file.type,
          storageId,
          category: getFileTypeCategory(file.type),
          description: undefined,
        });
      } catch (metadataError) {
        console.error("Failed to save file metadata:", metadataError);
        // Don't fail the upload if metadata saving fails
      }
    },
    [saveFileMetadata],
  );

  // Helper function to handle successful upload response
  const handleUploadSuccess = useCallback(
    async (file: File, storageId: Id<"_storage">): Promise<FileUploadResult> => {
      const result: FileUploadResult = {
        storageId,
        error: null,
        isUploading: false,
        progress: COMPLETE_PROGRESS,
      };

      setProgress(COMPLETE_PROGRESS);
      await saveMetadata(file, storageId);
      onSuccess?.(storageId, file);
      toast.success(`${file.name} uploaded successfully!`);

      return result;
    },
    [saveMetadata, onSuccess],
  );

  // Helper function to handle upload errors
  const handleUploadError = useCallback(
    (uploadError: unknown): FileUploadResult => {
      const errorMessage = uploadError instanceof Error ? uploadError.message : "Upload failed";
      setError(errorMessage);
      onError?.(uploadError instanceof Error ? uploadError : new Error(errorMessage));
      return {
        storageId: null,
        error: errorMessage,
        isUploading: false,
        progress: 0,
      };
    },
    [onError],
  );

  const uploadFile = useCallback(
    async (file: File): Promise<FileUploadResult> => {
      try {
        setError(null);
        setProgress(0);
        setIsUploading(true);

        // Validate file
        const validationError = validateFile(file);
        if (validationError) {
          const validationErrorObj = new Error(validationError);
          setError(validationError);
          onError?.(validationErrorObj);
          return {
            storageId: null,
            error: validationError,
            isUploading: false,
            progress: 0,
          };
        }

        // Generate upload URL
        const uploadUrl = await generateUploadUrl();

        // Create XMLHttpRequest for progress tracking
        return new Promise((resolve) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const progressPercent = Math.round(
                (event.loaded / event.total) * PERCENTAGE_MULTIPLIER,
              );
              setProgress(progressPercent);
              onProgress?.(progressPercent);
            }
          });

          xhr.addEventListener("load", async () => {
            try {
              if (xhr.status === HTTP_OK) {
                const { storageId } = JSON.parse(xhr.responseText);
                const result = await handleUploadSuccess(file, storageId as Id<"_storage">);
                resolve(result);
              } else {
                throw new Error(`Upload failed with status ${xhr.status}`);
              }
            } catch (loadError) {
              resolve(handleUploadError(loadError));
            } finally {
              setIsUploading(false);
            }
          });

          xhr.addEventListener("error", () => {
            const errorMessage = "Network error during upload";
            setError(errorMessage);
            onError?.(new Error(errorMessage));
            resolve({
              storageId: null,
              error: errorMessage,
              isUploading: false,
              progress: 0,
            });
            setIsUploading(false);
          });

          xhr.open("POST", uploadUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });
      } catch (uploadError) {
        setIsUploading(false);
        return handleUploadError(uploadError);
      }
    },
    [generateUploadUrl, validateFile, onProgress, handleUploadSuccess, handleUploadError, onError],
  );

  const uploadMultipleFiles = useCallback(
    async (files: File[]): Promise<FileUploadResult[]> => {
      const results: FileUploadResult[] = [];

      for (const file of files) {
        const result = await uploadFile(file);
        results.push(result);
      }

      return results;
    },
    [uploadFile],
  );

  const removeFile = useCallback(
    async (storageId: Id<"_storage">) => {
      try {
        await deleteFile({ storageId });
        toast.success("File deleted successfully!");
      } catch (deleteError) {
        const errorMessage =
          deleteError instanceof Error ? deleteError.message : "Failed to delete file";
        toast.error(errorMessage);
        throw deleteError;
      }
    },
    [deleteFile],
  );

  const reset = useCallback(() => {
    setError(null);
    setProgress(0);
    setIsUploading(false);
  }, []);

  return {
    uploadFile,
    uploadMultipleFiles,
    removeFile,
    reset,
    isUploading,
    progress,
    error,
  };
}

// Hook to get file URL from storage ID
export function useFileUrl(storageId: Id<"_storage"> | undefined) {
  return useQuery(api.files.getFileUrl, storageId ? { storageId } : "skip");
}

// Hook to get multiple file URLs
function _useFileUrls(storageIds: Id<"_storage">[]) {
  return useQuery(api.files.getFileUrls, storageIds.length > 0 ? { storageIds } : "skip");
}
