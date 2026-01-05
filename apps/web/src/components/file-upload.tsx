"use client";

import type { Id } from "@starter-saas/backend/convex/_generated/dataModel";
import { Alert, AlertDescription } from "@starter-saas/ui/alert";
import { Badge } from "@starter-saas/ui/badge";
import { Button } from "@starter-saas/ui/button";
import { Card, CardContent } from "@starter-saas/ui/card";
import { Progress } from "@starter-saas/ui/progress";
import { AlertCircle, CheckCircle, Download, Loader2, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { type FileUploadOptions, useFileUpload } from "@/hooks/use-file-upload";
import { cn } from "@/lib/utils";
import {
  getAcceptedFileTypes,
  useDragDropHandlers,
  useFileInputHandler,
  useFileRemoval,
} from "./file-upload-hooks";
import {
  COMPLETE_PROGRESS,
  createFileId,
  DEFAULT_MAX_FILE_SIZE,
  formatFileSize,
  getFileIcon,
  type UploadedFile,
} from "./file-upload-utils";

export type FileUploadProps = {
  onFileUpload?: (storageId: Id<"_storage">, file: File) => void;
  onFilesUpload?: (results: Array<{ storageId: Id<"_storage">; file: File }>) => void;
  onFileRemove?: (storageId: Id<"_storage">) => void;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in bytes
  allowedTypes?: string[]; // MIME types
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  acceptedFileTypes?: string; // for input accept attribute
};

export function FileUpload({
  onFileUpload,
  onFilesUpload,
  onFileRemove,
  multiple = false,
  maxFiles = 5,
  maxSize = DEFAULT_MAX_FILE_SIZE,
  allowedTypes = [],
  disabled = false,
  className,
  placeholder = "Drag and drop files here, or click to select",
  acceptedFileTypes,
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const uploadOptions: FileUploadOptions = {
    maxSize,
    allowedTypes,
    onProgress: (progress) => {
      setUploadedFiles((prev) =>
        prev.map((file) => (file.status === "uploading" ? { ...file, progress } : file)),
      );
    },
    onSuccess: (storageId, file) => {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.file === file
            ? { ...f, storageId, status: "completed" as const, progress: COMPLETE_PROGRESS }
            : f,
        ),
      );
      onFileUpload?.(storageId, file);
    },
    onError: (uploadError) => {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.status === "uploading"
            ? { ...f, status: "error" as const, error: uploadError.message }
            : f,
        ),
      );
    },
  };

  const { uploadFile, uploadMultipleFiles, removeFile, error } = useFileUpload(uploadOptions);

  // Helper function to create initial file entry
  const createFileEntry = useCallback(
    (file: File): UploadedFile => ({
      id: createFileId(),
      file,
      storageId: "" as Id<"_storage">,
      progress: 0,
      status: "uploading" as const,
    }),
    [],
  );

  // Helper function to validate file count
  const validateFileCount = useCallback(
    (fileArray: File[]): boolean => {
      if (fileArray.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        return false;
      }

      if (!multiple && fileArray.length > 1) {
        toast.error("Only one file allowed");
        return false;
      }

      return true;
    },
    [maxFiles, multiple],
  );

  // Helper function to handle multiple file uploads
  const handleMultipleUploads = useCallback(
    async (fileArray: File[]) => {
      const results = await uploadMultipleFiles(fileArray);
      const successfulUploads = results
        .filter((result) => result.storageId)
        .map((result, index) => ({
          storageId: result.storageId!,
          file: fileArray[index]!,
        }));

      if (successfulUploads.length > 0) {
        onFilesUpload?.(successfulUploads);
      }
    },
    [uploadMultipleFiles, onFilesUpload],
  );

  // Helper function to handle single file upload
  const handleSingleUpload = useCallback(
    async (file: File) => {
      const result = await uploadFile(file);
      if (result.storageId) {
        onFileUpload?.(result.storageId, file);
      }
    },
    [uploadFile, onFileUpload],
  );

  const handleFiles = useCallback(
    async (files: FileList) => {
      const fileArray = Array.from(files);

      if (!validateFileCount(fileArray)) {
        return;
      }

      // Create initial file entries
      const initialFiles: UploadedFile[] = fileArray.map(createFileEntry);
      setUploadedFiles((prev) => [...prev, ...initialFiles]);

      try {
        if (multiple) {
          await handleMultipleUploads(fileArray);
        } else {
          const file = fileArray[0];
          if (file) {
            await handleSingleUpload(file);
          }
        }
      } catch (uploadError) {
        console.error("Upload error:", uploadError);
      }
    },
    [validateFileCount, createFileEntry, multiple, handleMultipleUploads, handleSingleUpload],
  );

  // Drag and drop handlers
  const { isDragOver, handleDragOver, handleDragLeave, handleDrop } = useDragDropHandlers({
    disabled,
    enableDragDrop: true,
    onFilesSelected: handleFiles,
  });

  // File input handlers
  const { fileInputRef, handleFileInput, handleClick } = useFileInputHandler({
    disabled,
    onFilesSelected: handleFiles,
  });

  // File removal handler
  const handleRemoveFile = useFileRemoval({
    onRemove: removeFile,
    onFileRemove,
  });

  const handleRemoveFileWrapper = useCallback(
    async (fileId: string, storageId?: Id<"_storage">) => {
      const file = uploadedFiles.find((f) => f.id === fileId);
      await handleRemoveFile(fileId, storageId, file?.preview);
      setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
    },
    [handleRemoveFile, uploadedFiles],
  );

  const acceptedTypes = getAcceptedFileTypes(acceptedFileTypes, allowedTypes);

  return (
    <div className={cn("w-full", className)}>
      {/* Upload Area */}
      <Card
        className={cn(
          "cursor-pointer border-2 border-dashed transition-colors",
          isDragOver && !disabled && "border-primary bg-primary/5",
          disabled && "cursor-not-allowed opacity-50",
          "hover:border-primary/50",
        )}
        onClick={handleClick}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-muted p-4">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="font-medium text-sm">{placeholder}</p>
              <p className="text-muted-foreground text-xs">
                {allowedTypes.length > 0 && `Accepted types: ${allowedTypes.join(", ")}`}
                {maxSize && ` • Max size: ${formatFileSize(maxSize)}`}
                {maxFiles > 1 && ` • Max files: ${maxFiles}`}
              </p>
            </div>
            <Button className="mt-2" disabled={disabled} type="button" variant="outline">
              Select Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        accept={acceptedTypes}
        className="hidden"
        disabled={disabled}
        multiple={multiple}
        onChange={handleFileInput}
        ref={fileInputRef}
        type="file"
      />

      {/* Error Display */}
      {error && (
        <Alert className="mt-4" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="font-medium text-sm">Uploaded Files</h4>
          {uploadedFiles.map((file) => {
            const FileIcon = getFileIcon(file.file.type);
            return (
              <Card className="p-3" key={file.id}>
                <div className="flex items-center justify-between">
                  <div className="flex min-w-0 flex-1 items-center space-x-3">
                    <FileIcon className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-sm">{file.file.name}</p>
                      <div className="flex items-center space-x-2 text-muted-foreground text-xs">
                        <span>{formatFileSize(file.file.size)}</span>
                        <Badge
                          className="text-xs"
                          variant={(() => {
                            if (file.status === "completed") {
                              return "default";
                            }
                            if (file.status === "error") {
                              return "destructive";
                            }
                            return "secondary";
                          })()}
                        >
                          {file.status === "uploading" && (
                            <>
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              Uploading...
                            </>
                          )}
                          {file.status === "completed" && (
                            <>
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Completed
                            </>
                          )}
                          {file.status === "error" && (
                            <>
                              <AlertCircle className="mr-1 h-3 w-3" />
                              Error
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {file.status === "completed" && file.storageId && (
                      <Button
                        onClick={() => {
                          // You can implement download functionality here
                          console.log("Download file:", file.storageId);
                        }}
                        size="sm"
                        variant="ghost"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      onClick={() => handleRemoveFileWrapper(file.id, file.storageId)}
                      size="sm"
                      variant="ghost"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Progress Bar */}
                {file.status === "uploading" && (
                  <div className="mt-2">
                    <Progress className="h-2" value={file.progress} />
                  </div>
                )}

                {/* Error Message */}
                {file.status === "error" && file.error && (
                  <p className="mt-1 text-destructive text-xs">{file.error}</p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
