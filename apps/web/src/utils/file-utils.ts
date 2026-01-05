import type { Id } from "@starter-saas/backend/convex/_generated/dataModel";

/**
 * Utility functions for file operations
 */

export type FileMetadata = {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  storageId: Id<"_storage">;
};

/**
 * Get file extension from filename
 */
function _getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf(".");
  return lastDotIndex === -1 ? "" : filename.slice(lastDotIndex + 1);
}

/**
 * Get file type category based on MIME type
 */
export function getFileTypeCategory(
  mimeType: string,
):
  | "profile_image"
  | "kyc_document"
  | "proof_of_address"
  | "proof_of_identity"
  | "general"
  | "other" {
  if (mimeType.startsWith("image/")) {
    return "profile_image";
  }
  if (mimeType.includes("pdf") || mimeType.includes("document")) {
    return "kyc_document";
  }
  return "other";
}

const BYTES_PER_KB = 1024;
const SIZE_UNITS = ["Bytes", "KB", "MB", "GB", "TB"] as const;

/**
 * Format file size in human readable format
 */
const FILE_SIZE_PRECISION = 2;

export function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return "0 Bytes";
  }
  const i = Math.floor(Math.log(bytes) / Math.log(BYTES_PER_KB));
  return `${Number.parseFloat((bytes / BYTES_PER_KB ** i).toFixed(FILE_SIZE_PRECISION))} ${SIZE_UNITS[i]}`;
}

/**
 * Validate file type against allowed types
 */
function _validateFileType(file: File, allowedTypes: string[]): boolean {
  if (allowedTypes.length === 0) {
    return true;
  }
  return allowedTypes.includes(file.type);
}

/**
 * Validate file size against maximum size
 */
function _validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize;
}

/**
 * Get file icon based on MIME type
 */
function _getFileIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) {
    return "🖼️";
  }
  if (mimeType.startsWith("video/")) {
    return "🎥";
  }
  if (mimeType.startsWith("audio/")) {
    return "🎵";
  }
  if (mimeType.includes("pdf")) {
    return "📄";
  }
  if (mimeType.includes("word") || mimeType.includes("document")) {
    return "📝";
  }
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) {
    return "📊";
  }
  if (mimeType.includes("powerpoint") || mimeType.includes("presentation")) {
    return "📽️";
  }
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("7z")) {
    return "📦";
  }
  if (mimeType.includes("text")) {
    return "📄";
  }
  return "📁";
}

const RANDOM_ID_START_INDEX = 2;
const RANDOM_ID_END_INDEX = 11;
const BASE_36_RADIX = 36;

/**
 * Generate a unique file ID
 */
function _generateFileId(): string {
  return (
    Math.random().toString(BASE_36_RADIX).slice(RANDOM_ID_START_INDEX, RANDOM_ID_END_INDEX) +
    Date.now().toString(BASE_36_RADIX)
  );
}

/**
 * Create file metadata object
 */
function _createFileMetadata(file: File, storageId: Id<"_storage">): FileMetadata {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    storageId,
  };
}

/**
 * Check if file is an image
 */
function _isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

/**
 * Check if file is a video
 */
function _isVideoFile(file: File): boolean {
  return file.type.startsWith("video/");
}

/**
 * Get file type display name
 */
export function getFileTypeDisplayName(mimeType: string): string {
  const typeMap: Record<string, string> = {
    "image/jpeg": "JPEG Image",
    "image/png": "PNG Image",
    "image/gif": "GIF Image",
    "image/webp": "WebP Image",
    "image/svg+xml": "SVG Image",
    "video/mp4": "MP4 Video",
    "video/webm": "WebM Video",
    "video/quicktime": "QuickTime Video",
    "audio/mp3": "MP3 Audio",
    "audio/wav": "WAV Audio",
    "audio/ogg": "OGG Audio",
    "application/pdf": "PDF Document",
    "application/msword": "Word Document",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word Document",
    "application/vnd.ms-excel": "Excel Spreadsheet",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel Spreadsheet",
    "application/vnd.ms-powerpoint": "PowerPoint Presentation",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      "PowerPoint Presentation",
    "text/plain": "Text File",
    "text/csv": "CSV File",
    "application/zip": "ZIP Archive",
    "application/x-rar-compressed": "RAR Archive",
    "application/x-7z-compressed": "7Z Archive",
  };

  return typeMap[mimeType] || mimeType;
}
