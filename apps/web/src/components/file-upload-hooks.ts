import type { Id } from "@starter-saas/backend/convex/_generated/dataModel";
import type { DragEvent } from "react";
import { useCallback, useRef, useState } from "react";

/**
 * Shared hooks for file upload components
 */

export type UseFileUploadHandlersOptions = {
  disabled: boolean;
  enableDragDrop?: boolean;
  onFilesSelected: (files: FileList) => void;
};

/**
 * Hook for drag and drop handlers
 */
export function useDragDropHandlers({
  disabled,
  enableDragDrop = true,
  onFilesSelected,
}: UseFileUploadHandlersOptions) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && enableDragDrop) {
        setIsDragOver(true);
      }
    },
    [disabled, enableDragDrop],
  );

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (disabled || !enableDragDrop) {
        return;
      }

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        onFilesSelected(files);
      }
    },
    [disabled, enableDragDrop, onFilesSelected],
  );

  return {
    isDragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}

/**
 * Hook for file input handlers
 */
export function useFileInputHandler({
  disabled,
  onFilesSelected,
}: {
  disabled: boolean;
  onFilesSelected: (files: FileList) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFilesSelected(files);
      }
      // Reset input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [onFilesSelected],
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  return {
    fileInputRef,
    handleFileInput,
    handleClick,
  };
}

/**
 * Helper to get accepted file types string
 */
export function getAcceptedFileTypes(
  acceptedFileTypes?: string,
  allowedTypes: string[] = [],
): string | undefined {
  if (acceptedFileTypes) {
    return acceptedFileTypes;
  }
  if (allowedTypes.length > 0) {
    return allowedTypes.join(",");
  }
  return;
}

/**
 * Hook for file removal handler
 */
export function useFileRemoval<
  _T extends { id: string; storageId?: Id<"_storage">; preview?: string },
>({
  onRemove,
  onFileRemove,
}: {
  onRemove?: (storageId: Id<"_storage">) => Promise<void>;
  onFileRemove?: (storageId: Id<"_storage">) => void;
}) {
  return useCallback(
    async (_fileId: string, storageId?: Id<"_storage">, preview?: string) => {
      if (storageId && onRemove) {
        try {
          await onRemove(storageId);
          onFileRemove?.(storageId);
        } catch (deleteError) {
          console.error("Error removing file:", deleteError);
        }
      }

      // Clean up preview URL if exists
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    },
    [onRemove, onFileRemove],
  );
}
