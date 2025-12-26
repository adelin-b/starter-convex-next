"use client";

import { api } from "@starter-saas/backend/convex/_generated/api";
import type { Id } from "@starter-saas/backend/convex/_generated/dataModel";
import { Alert, AlertDescription } from "@starter-saas/ui/alert";
import { Badge } from "@starter-saas/ui/badge";
import { Button } from "@starter-saas/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@starter-saas/ui/card";
import { Progress } from "@starter-saas/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@starter-saas/ui/tabs";
import { useMutation } from "convex/react";
import {
  AlertCircle,
  CloudUpload,
  Download,
  Eye,
  FolderOpen,
  Loader2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { type FileUploadOptions, useFileUpload, useFileUrl } from "@/hooks/use-file-upload";
import { useUserFiles } from "@/hooks/use-user-files";
import { cn } from "@/lib/utils";
import {
  getAcceptedFileTypes,
  useDragDropHandlers,
  useFileInputHandler,
  useFileRemoval,
} from "./file-upload-hooks";
import {
  BYTES_PER_MB,
  COMPLETE_PROGRESS,
  createFileId,
  formatFileSize,
  getFileIcon,
  getFileTypeCategory,
  type UploadedFile,
} from "./file-upload-utils";
import { PDFPreview } from "./pdf-preview";

// Advanced component uses larger default max size
const ADVANCED_DEFAULT_MAX_FILE_SIZE_MB = 50;
const ADVANCED_DEFAULT_MAX_FILE_SIZE = ADVANCED_DEFAULT_MAX_FILE_SIZE_MB * BYTES_PER_MB;

export type AdvancedFileUploadProps = {
  onFileUpload?: (storageId: Id<"_storage">, file: File) => void;
  onFilesUpload?: (results: Array<{ storageId: Id<"_storage">; file: File }>) => void;
  onFileRemove?: (storageId: Id<"_storage">) => void;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in bytes
  allowedTypes?: string[]; // MIME types
  disabled?: boolean;
  className?: string;
  showPreview?: boolean;
  showFileList?: boolean;
  enableDragDrop?: boolean;
  enableProgress?: boolean;
  enableFileActions?: boolean;
  uploadText?: string;
  dropText?: string;
  acceptedFileTypes?: string; // for input accept attribute
};

export function AdvancedFileUpload({
  onFileUpload,
  onFilesUpload,
  onFileRemove,
  multiple = true,
  maxFiles = 10,
  maxSize = ADVANCED_DEFAULT_MAX_FILE_SIZE,
  allowedTypes = [],
  disabled = false,
  className,
  showPreview = true,
  showFileList = true,
  enableDragDrop = true,
  enableProgress = true,
  enableFileActions = true,
  uploadText = "Upload Files",
  dropText = "Drag and drop files here, or click to select",
  acceptedFileTypes,
}: AdvancedFileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadedFile[]>([]);
  const [activeTab, setActiveTab] = useState("upload");

  // Get persistent files from database
  const userFiles = useUserFiles();
  const deleteFile = useMutation(api.files.deleteFile);

  const uploadOptions: FileUploadOptions = {
    maxSize,
    allowedTypes,
    onProgress: (progress) => {
      setUploadingFiles((prev) =>
        prev.map((file) => (file.status === "uploading" ? { ...file, progress } : file)),
      );
    },
    onSuccess: (storageId, file) => {
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.file === file
            ? { ...f, storageId, status: "completed" as const, progress: COMPLETE_PROGRESS }
            : f,
        ),
      );
      onFileUpload?.(storageId, file);
    },
    onError: (uploadError) => {
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.status === "uploading"
            ? { ...f, status: "error" as const, error: uploadError.message }
            : f,
        ),
      );
    },
  };

  const { uploadFile, uploadMultipleFiles, error } = useFileUpload(uploadOptions);

  // Helper function to create initial file entry
  const createFileEntry = useCallback((file: File): UploadedFile => {
    const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
    return {
      id: createFileId(),
      file,
      storageId: "" as Id<"_storage">,
      progress: 0,
      status: "uploading" as const,
      preview,
    };
  }, []);

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
        }))
        .filter((upload) => upload.file);

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

      // Create initial file entries with previews
      const initialFiles: UploadedFile[] = fileArray.map(createFileEntry);
      setUploadingFiles((prev) => [...prev, ...initialFiles]);

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
    enableDragDrop,
    onFilesSelected: handleFiles,
  });

  // File input handlers
  const { fileInputRef, handleFileInput, handleClick } = useFileInputHandler({
    disabled,
    onFilesSelected: handleFiles,
  });

  // File removal handler
  const handleRemoveFileBase = useFileRemoval({
    onRemove: async (storageId) => {
      await deleteFile({ storageId });
    },
    onFileRemove,
  });

  const handleRemoveFile = useCallback(
    async (fileId: string, storageId?: Id<"_storage">) => {
      const fileToRemove = uploadingFiles.find((f) => f.id === fileId);
      await handleRemoveFileBase(fileId, storageId, fileToRemove?.preview);
      setUploadingFiles((prev) => prev.filter((f) => f.id !== fileId));
    },
    [handleRemoveFileBase, uploadingFiles],
  );

  const acceptedTypes = getAcceptedFileTypes(acceptedFileTypes, allowedTypes);

  const uploadingFilesList = uploadingFiles.filter((f) => f.status === "uploading");
  const errorFiles = uploadingFiles.filter((f) => f.status === "error");

  const filesByCategory =
    userFiles?.reduce(
      (acc, file) => {
        const category = file.category || getFileTypeCategory(file.type);
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(file);
        return acc;
      },
      {} as Record<string, any[]>,
    ) || {};

  return (
    <div className={cn("w-full", className)}>
      <Tabs className="w-full" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger className="flex items-center gap-2" value="upload">
            <CloudUpload className="h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-2" value="files">
            <FolderOpen className="h-4 w-4" />
            Files ({userFiles?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-4" value="upload">
          {/* Upload Area */}
          <Card
            className={cn(
              "border-2 border-dashed transition-colors",
              enableDragDrop && "cursor-pointer",
              isDragOver && !disabled && "border-primary bg-primary/5",
              disabled && "cursor-not-allowed opacity-50",
              enableDragDrop && "hover:border-primary/50",
            )}
            onClick={enableDragDrop ? handleClick : undefined}
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
                  <p className="font-medium text-sm">{dropText}</p>
                  <p className="text-muted-foreground text-xs">
                    {allowedTypes.length > 0 && `Accepted types: ${allowedTypes.join(", ")}`}
                    {maxSize && ` • Max size: ${formatFileSize(maxSize)}`}
                    {maxFiles > 1 && ` • Max files: ${maxFiles}`}
                  </p>
                </div>
                <Button
                  className="mt-2"
                  disabled={disabled}
                  onClick={handleClick}
                  type="button"
                  variant="outline"
                >
                  {uploadText}
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
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Upload Progress */}
          {enableProgress && uploadingFilesList.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Uploading Files</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {uploadingFilesList.map((file) => {
                  const FileIcon = getFileIcon(file.file.type);
                  return (
                    <div className="space-y-2" key={file.id}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{file.file.name}</span>
                          <Badge className="text-xs" variant="secondary">
                            {formatFileSize(file.file.size)}
                          </Badge>
                        </div>
                        <span className="text-muted-foreground text-xs">{file.progress}%</span>
                      </div>
                      <Progress className="h-2" value={file.progress} />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Error Files */}
          {errorFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive text-sm">Upload Errors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {errorFiles.map((file) => {
                  const FileIcon = getFileIcon(file.file.type);
                  return (
                    <div
                      className="flex items-center justify-between rounded border p-2"
                      key={file.id}
                    >
                      <div className="flex items-center space-x-2">
                        <FileIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{file.file.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-destructive text-xs">{file.error}</span>
                        <Button onClick={() => handleRemoveFile(file.id)} size="sm" variant="ghost">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent className="space-y-4" value="files">
          {showFileList && userFiles && userFiles.length > 0 ? (
            <div className="space-y-4">
              {Object.entries(filesByCategory).map(([category, files]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      {category} ({files.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {files.map((file) => {
                        const FileIcon = getFileIcon(file.type);
                        const renderPreview = () => {
                          if (!showPreview) {
                            return (
                              <div className="flex aspect-square items-center justify-center rounded bg-muted">
                                <FileIcon className="h-8 w-8 text-muted-foreground" />
                              </div>
                            );
                          }

                          if (file.type.startsWith("image/")) {
                            return <ImagePreview alt={file.name} storageId={file.storageId} />;
                          }

                          if (file.type === "application/pdf") {
                            return <PDFPreview fileName={file.name} storageId={file.storageId} />;
                          }

                          return (
                            <div className="flex aspect-square items-center justify-center rounded bg-muted">
                              <FileIcon className="h-8 w-8 text-muted-foreground" />
                            </div>
                          );
                        };

                        return (
                          <div className="space-y-2 rounded-lg border p-3" key={file._id}>
                            {renderPreview()}

                            <div className="space-y-1">
                              <p className="truncate font-medium text-sm" title={file.name}>
                                {file.name}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {formatFileSize(file.size)}
                              </p>
                            </div>

                            {enableFileActions && (
                              <FileActions
                                file={file}
                                onRemove={() => handleRemoveFile(file._id, file.storageId)}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <FolderOpen className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground text-sm">No files uploaded yet</p>
                <p className="mt-1 text-muted-foreground text-xs">
                  Upload some files to see them here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ImagePreview component for displaying images with proper URL handling
function ImagePreview({ storageId, alt }: { storageId: Id<"_storage">; alt: string }) {
  const imageUrl = useFileUrl(storageId);

  return (
    <div className="aspect-square overflow-hidden rounded bg-muted">
      {imageUrl ? (
        <img
          alt={alt}
          className="h-full w-full object-cover"
          height={400}
          src={imageUrl}
          width={400}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

// FileActions component for view, download, and delete actions
function FileActions({ file, onRemove }: { file: any; onRemove: () => void }) {
  const fileUrl = useFileUrl(file.storageId);

  const handleView = () => {
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    }
  };

  const handleDownload = () => {
    if (fileUrl) {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = file.name;
      link.click();
    }
  };

  return (
    <div className="flex items-center justify-between">
      <Button disabled={!fileUrl} onClick={handleView} size="sm" title="View file" variant="ghost">
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        disabled={!fileUrl}
        onClick={handleDownload}
        size="sm"
        title="Download file"
        variant="ghost"
      >
        <Download className="h-4 w-4" />
      </Button>
      <Button onClick={onRemove} size="sm" title="Delete file" variant="ghost">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
