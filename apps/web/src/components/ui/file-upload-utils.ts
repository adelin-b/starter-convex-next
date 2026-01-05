import type { Id } from "@starter-saas/backend/convex/_generated/dataModel";
import { Archive, File, FileText, Image, Music, Video } from "lucide-react";

// Constants for file upload configuration
export const BYTES_PER_KB = 1024;
export const BYTES_PER_MB = BYTES_PER_KB * BYTES_PER_KB;
export const DEFAULT_MAX_FILE_SIZE_MB = 10;
export const DEFAULT_MAX_FILE_SIZE = DEFAULT_MAX_FILE_SIZE_MB * BYTES_PER_MB;
export const RANDOM_ID_BASE = 36;
export const RANDOM_ID_START = 2;
export const RANDOM_ID_LENGTH = 9;
export const COMPLETE_PROGRESS = 100;

export type UploadedFile = {
  id: string;
  file: File;
  storageId: Id<"_storage">;
  url?: string;
  progress: number;
  status: "uploading" | "completed" | "error";
  error?: string;
  preview?: string;
};

export function getFileIcon(fileType: string) {
  if (fileType.startsWith("image/")) {
    return Image;
  }
  if (fileType.startsWith("video/")) {
    return Video;
  }
  if (fileType.startsWith("audio/")) {
    return Music;
  }
  if (fileType.includes("zip") || fileType.includes("rar") || fileType.includes("7z")) {
    return Archive;
  }
  if (fileType.includes("pdf") || fileType.includes("document") || fileType.includes("text")) {
    return FileText;
  }
  return File;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return "0 Bytes";
  }
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

export function getFileTypeCategory(fileType: string): string {
  if (fileType.startsWith("image/")) {
    return "Images";
  }
  if (fileType.startsWith("video/")) {
    return "Videos";
  }
  if (fileType.startsWith("audio/")) {
    return "Audio";
  }
  if (fileType.includes("pdf") || fileType.includes("document") || fileType.includes("text")) {
    return "Documents";
  }
  if (fileType.includes("zip") || fileType.includes("rar") || fileType.includes("7z")) {
    return "Archives";
  }
  return "Other";
}

export function createFileId(): string {
  return Math.random().toString(RANDOM_ID_BASE).substr(RANDOM_ID_START, RANDOM_ID_LENGTH);
}
