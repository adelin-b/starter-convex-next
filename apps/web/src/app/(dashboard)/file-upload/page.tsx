"use client";

import { api } from "@starter-saas/backend/convex/_generated/api";
import type { Id } from "@starter-saas/backend/convex/_generated/dataModel";
import { Badge } from "@starter-saas/ui/badge";
import { Button } from "@starter-saas/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@starter-saas/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@starter-saas/ui/tabs";
import { useMutation } from "convex/react";
import { Download, Eye, Trash2 } from "lucide-react";
import { useState } from "react";
import { AdvancedFileUpload } from "@/components/ui/advanced-file-upload";
import { FileUpload } from "@/components/ui/file-upload";
import { PDFPreview } from "@/components/ui/pdf-preview";
import { useFileUrl } from "@/hooks/use-file-upload";
import { useUserFiles } from "@/hooks/use-user-files";
import { formatFileSize, getFileTypeDisplayName } from "@/utils/file-utils";

// File size constants (in bytes)
const BYTES_PER_KB = 1024;
const BYTES_PER_MB = BYTES_PER_KB * BYTES_PER_KB;

// Size multipliers
const SIZE_MULTIPLIER_5MB = 5;
const SIZE_MULTIPLIER_10MB = 10;
const SIZE_MULTIPLIER_50MB = 50;
const SIZE_MULTIPLIER_100MB = 100;

const MAX_FILE_SIZE_5MB = SIZE_MULTIPLIER_5MB * BYTES_PER_MB;
const MAX_FILE_SIZE_10MB = SIZE_MULTIPLIER_10MB * BYTES_PER_MB;
const MAX_FILE_SIZE_50MB = SIZE_MULTIPLIER_50MB * BYTES_PER_MB;
const MAX_FILE_SIZE_100MB = SIZE_MULTIPLIER_100MB * BYTES_PER_MB;

// Max file count constants
const MAX_FILES_BASIC = 5;
const MAX_FILES_MEDIUM = 10;
const MAX_FILES_ADVANCED = 20;

type ConvexFile = {
  _id: Id<"files">;
  userId: string;
  name: string;
  size: number;
  type: string;
  storageId: Id<"_storage">;
  uploadedAt: number;
  category?: string;
  description?: string;
};

export default function FileUploadPage() {
  const [selectedFile, setSelectedFile] = useState<ConvexFile | null>(null);
  const deleteFile = useMutation(api.files.deleteFile);

  // Get files from database instead of local state
  const userFiles = useUserFiles();

  const handleFileUpload = (storageId: Id<"_storage">, file: File) => {
    // File metadata is automatically saved by the upload hook
    console.log("File uploaded:", file.name, storageId);
  };

  const handleFilesUpload = (results: Array<{ storageId: Id<"_storage">; file: File }>) => {
    // File metadata is automatically saved by the upload hook
    console.log("Files uploaded:", results);
  };

  const handleFileRemove = async (storageId: Id<"_storage">) => {
    try {
      await deleteFile({ storageId });
      if (selectedFile?.storageId === storageId) {
        setSelectedFile(null);
      }
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="font-bold text-3xl">File Upload Demo</h1>
        <p className="text-muted-foreground">
          Test the robust file upload functionality with Convex and shadcn/ui
        </p>
      </div>

      <Tabs className="w-full" defaultValue="basic">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Upload</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Upload</TabsTrigger>
          <TabsTrigger value="files">Uploaded Files ({userFiles?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-6" value="basic">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Single File Upload</CardTitle>
                <CardDescription>Upload a single file with basic validation</CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  allowedTypes={["image/*", "application/pdf"]}
                  maxSize={MAX_FILE_SIZE_5MB}
                  multiple={false}
                  onFileUpload={handleFileUpload}
                  placeholder="Upload an image or PDF (max 5MB)"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Multiple Files Upload</CardTitle>
                <CardDescription>Upload multiple files with drag & drop</CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  allowedTypes={["image/*", "application/pdf", "text/*"]}
                  maxFiles={MAX_FILES_BASIC}
                  maxSize={MAX_FILE_SIZE_10MB}
                  multiple={true}
                  onFilesUpload={handleFilesUpload}
                  placeholder="Upload multiple files (max 10MB each)"
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All File Types</CardTitle>
              <CardDescription>Upload any type of file without restrictions</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                maxFiles={MAX_FILES_MEDIUM}
                maxSize={MAX_FILE_SIZE_50MB}
                multiple={true}
                onFilesUpload={handleFilesUpload}
                placeholder="Upload any type of file (max 50MB each)"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-6" value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced File Upload</CardTitle>
              <CardDescription>
                Full-featured upload component with preview, progress, and file management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdvancedFileUpload
                allowedTypes={[
                  "image/*",
                  "video/*",
                  "audio/*",
                  "application/pdf",
                  "application/msword",
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                  "application/vnd.ms-excel",
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                  "text/*",
                  "application/zip",
                  "application/x-rar-compressed",
                ]}
                dropText="Drag and drop files here, or click to select"
                enableDragDrop={true}
                enableFileActions={true}
                enableProgress={true}
                maxFiles={MAX_FILES_ADVANCED}
                maxSize={MAX_FILE_SIZE_100MB}
                multiple={true}
                onFilesUpload={handleFilesUpload}
                showFileList={true}
                showPreview={true}
                uploadText="Upload Files"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-6" value="files">
          {userFiles && userFiles.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {userFiles.map((file: ConvexFile) => (
                <FileCard
                  file={file}
                  isSelected={selectedFile?._id === file._id}
                  key={file._id}
                  onRemove={handleFileRemove}
                  onSelect={setSelectedFile}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <div className="mb-4 text-muted-foreground">
                  <svg
                    className="mx-auto h-12 w-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
                <h3 className="mb-2 font-medium text-lg">No files uploaded yet</h3>
                <p className="text-muted-foreground text-sm">
                  Upload some files using the upload components above to see them here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* File Details Modal */}
      {selectedFile && (
        <FileDetailsModal file={selectedFile} onClose={() => setSelectedFile(null)} />
      )}
    </div>
  );
}

function FileCard({
  file,
  onSelect,
  onRemove,
  isSelected,
}: {
  file: ConvexFile;
  onSelect: (file: ConvexFile) => void;
  onRemove: (storageId: Id<"_storage">) => void;
  isSelected: boolean;
}) {
  const fileUrl = useFileUrl(file.storageId);

  return (
    <Card
      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={() => onSelect(file)}
    >
      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h4 className="truncate font-medium text-sm" title={file.name}>
              {file.name}
            </h4>
            <p className="text-muted-foreground text-xs">{getFileTypeDisplayName(file.type)}</p>
          </div>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(file.storageId);
            }}
            size="sm"
            variant="ghost"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Size</span>
            <span>{formatFileSize(file.size)}</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Uploaded</span>
            <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Status</span>
            <Badge variant={fileUrl ? "default" : "secondary"}>
              {fileUrl ? "Available" : "Loading..."}
            </Badge>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <Button
            className="flex-1"
            disabled={!fileUrl}
            onClick={(e) => {
              e.stopPropagation();
              if (fileUrl) {
                window.open(fileUrl, "_blank");
              }
            }}
            size="sm"
            variant="outline"
          >
            <Eye className="mr-1 h-4 w-4" />
            View
          </Button>
          <Button
            className="flex-1"
            disabled={!fileUrl}
            onClick={(e) => {
              e.stopPropagation();
              if (fileUrl) {
                const link = document.createElement("a");
                link.href = fileUrl;
                link.download = file.name;
                link.click();
              }
            }}
            size="sm"
            variant="outline"
          >
            <Download className="mr-1 h-4 w-4" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function renderFilePreview(file: ConvexFile, fileUrl: string) {
  if (file.type.startsWith("image/")) {
    return (
      <img
        alt={file.name}
        className="mx-auto max-h-64 max-w-full object-contain"
        height={256}
        src={fileUrl}
        width={256}
      />
    );
  }

  if (file.type === "application/pdf") {
    return <PDFPreview className="max-h-64" fileName={file.name} storageId={file.storageId} />;
  }

  return (
    <div className="text-center text-muted-foreground">
      <p>Preview not available for this file type</p>
      <Button
        className="mt-2"
        onClick={() => window.open(fileUrl, "_blank")}
        size="sm"
        variant="outline"
      >
        <Eye className="mr-1 h-4 w-4" />
        Open in New Tab
      </Button>
    </div>
  );
}

function FileDetailsModal({ file, onClose }: { file: ConvexFile; onClose: () => void }) {
  const fileUrl = useFileUrl(file.storageId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="max-h-[80vh] w-full max-w-2xl overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="truncate">{file.name}</CardTitle>
            <Button onClick={onClose} size="sm" variant="ghost">
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Type:</span>
              <p className="text-muted-foreground">{getFileTypeDisplayName(file.type)}</p>
            </div>
            <div>
              <span className="font-medium">Size:</span>
              <p className="text-muted-foreground">{formatFileSize(file.size)}</p>
            </div>
            <div>
              <span className="font-medium">Uploaded:</span>
              <p className="text-muted-foreground">{new Date(file.uploadedAt).toLocaleString()}</p>
            </div>
            <div>
              <span className="font-medium">Storage ID:</span>
              <p className="font-mono text-muted-foreground text-xs">{file.storageId}</p>
            </div>
          </div>

          {fileUrl && (
            <div className="space-y-2">
              <span className="font-medium text-sm">Preview:</span>
              <div className="rounded border bg-muted/50 p-4">
                {renderFilePreview(file, fileUrl)}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              className="flex-1"
              disabled={!fileUrl}
              onClick={() => {
                if (fileUrl) {
                  window.open(fileUrl, "_blank");
                }
              }}
              variant="outline"
            >
              <Eye className="mr-1 h-4 w-4" />
              View File
            </Button>
            <Button
              className="flex-1"
              disabled={!fileUrl}
              onClick={() => {
                if (fileUrl) {
                  const link = document.createElement("a");
                  link.href = fileUrl;
                  link.download = file.name;
                  link.click();
                }
              }}
              variant="outline"
            >
              <Download className="mr-1 h-4 w-4" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
