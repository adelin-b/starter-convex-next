"use client";

import { cn } from "@starter-saas/ui/utils";
import type { UploadFileResponse } from "@xixixao/uploadstuff/react";
import { FileIcon, Loader2, Upload, X } from "lucide-react";
import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "./button";
import { Label } from "./label";
import { UploadInput } from "./upload-input";

type FileUploadFieldProps = {
  /**
   * Field name for react-hook-form integration
   */
  name: string;
  /**
   * Field label
   */
  label?: string;
  /**
   * Help text displayed below the field
   */
  description?: string;
  /**
   * Function to generate upload URL (from Convex)
   */
  generateUploadUrl: () => Promise<string>;
  /**
   * Callback when upload completes
   */
  onUploadComplete?: (uploaded: UploadFileResponse[]) => Promise<void>;
  /**
   * Accepted file types
   */
  accept?: string;
  /**
   * Maximum file size in MB
   */
  maxSizeMB?: number;
  /**
   * Show file preview
   */
  showPreview?: boolean;
  /**
   * Allow multiple files
   */
  multiple?: boolean;
  /**
   * Required field
   */
  required?: boolean;
  /**
   * Disabled state
   */
  disabled?: boolean;
  /**
   * Custom className
   */
  className?: string;
};

type UploadState = {
  isUploading: boolean;
  progress: number;
  preview: string | null;
  fileName: string | null;
  error: string | null;
};

// Constants for file size conversion
const KB_TO_BYTES_MULTIPLIER = 1024;
const BYTES_PER_KB = KB_TO_BYTES_MULTIPLIER;
const BYTES_PER_MB = BYTES_PER_KB * KB_TO_BYTES_MULTIPLIER;

// Preview image dimensions
const PREVIEW_IMAGE_SIZE = 64;

// File validation helper
function validateFileSize(file: File, maxSizeMB: number): string | null {
  const fileSizeMB = file.size / BYTES_PER_MB;
  if (fileSizeMB > maxSizeMB) {
    return `File size exceeds ${maxSizeMB}MB limit`;
  }
  return null;
}

function validateFileType(file: File, accept: string): string | null {
  const acceptedTypes = accept.split(",").map((t) => t.trim());
  const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
  const mimeType = file.type;

  const isAccepted = acceptedTypes.some(
    (type) =>
      type === mimeType ||
      type === fileExtension ||
      (type.endsWith("/*") && mimeType.startsWith(type.replace("/*", ""))),
  );

  if (!isAccepted) {
    return `File type not accepted. Accepted types: ${accept}`;
  }
  return null;
}

/**
 * FileUploadField component with react-hook-form integration, drag-and-drop, and preview.
 *
 * @example
 * // Basic usage with react-hook-form
 * <FileUploadField
 *   name="logo"
 *   label="Company Logo"
 *   description="Upload your company logo (PNG, JPG, max 2MB)"
 *   generateUploadUrl={generateUploadUrl}
 *   accept="image/*"
 *   maxSizeMB={2}
 *   showPreview
 *   required
 * />
 *
 * @example
 * // With multiple files
 * <FileUploadField
 *   name="documents"
 *   label="Supporting Documents"
 *   generateUploadUrl={generateUploadUrl}
 *   accept=".pdf,.doc,.docx"
 *   multiple
 * />
 */
export function FileUploadField({
  name,
  label,
  description,
  generateUploadUrl,
  onUploadComplete,
  accept,
  maxSizeMB = 10,
  showPreview = false,
  multiple = false,
  required = false,
  disabled = false,
  className,
}: FileUploadFieldProps) {
  const form = useFormContext();
  const [uploadState, setUploadState] = React.useState<UploadState>({
    isUploading: false,
    progress: 0,
    preview: null,
    fileName: null,
    error: null,
  });
  const [isDragging, setIsDragging] = React.useState(false);
  const dropZoneRef = React.useRef<HTMLDivElement>(null);

  const fieldState = form?.getFieldState(name);
  const error = fieldState?.error?.message;

  // Helper to generate image preview
  const generateImagePreview = React.useCallback((file: File, fileName: string) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadState((prev) => ({
        ...prev,
        preview: e.target?.result as string,
        fileName,
        isUploading: false,
        error: null,
      }));
    };
    reader.readAsDataURL(file);
  }, []);

  // Helper to process uploaded file
  const processUploadedFile = React.useCallback(
    (uploadedFile: UploadFileResponse) => {
      const response = uploadedFile.response as { storageId: string };
      form?.setValue(name, response.storageId);

      const input = dropZoneRef.current?.querySelector('input[type="file"]') as HTMLInputElement;
      const uploadedFileName = input?.files?.[0]?.name;
      const file = input.files?.[0];

      if (!uploadedFileName) {
        setUploadState((prev) => ({ ...prev, isUploading: false, error: null }));
        return;
      }

      if (file && showPreview && file.type.startsWith("image/")) {
        generateImagePreview(file, uploadedFileName);
      } else {
        setUploadState((prev) => ({
          ...prev,
          fileName: uploadedFileName,
          isUploading: false,
          error: null,
        }));
      }
    },
    [form, name, showPreview, generateImagePreview],
  );

  const handleUploadComplete = React.useCallback(
    async (uploaded: UploadFileResponse[]) => {
      const uploadedFile = uploaded[0];
      if (uploadedFile) {
        processUploadedFile(uploadedFile);
      }
      await onUploadComplete?.(uploaded);
    },
    [processUploadedFile, onUploadComplete],
  );

  const validateFile = React.useCallback(
    (file: File): string | null => {
      const sizeError = validateFileSize(file, maxSizeMB);
      if (sizeError) {
        return sizeError;
      }

      if (accept) {
        const typeError = validateFileType(file, accept);
        if (typeError) {
          return typeError;
        }
      }

      return null;
    },
    [maxSizeMB, accept],
  );

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // Helper to trigger file input with dropped file
  const triggerFileInput = React.useCallback((file: File) => {
    const input = dropZoneRef.current?.querySelector('input[type="file"]') as HTMLInputElement;
    if (input) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }, []);

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) {
        return;
      }

      const files = Array.from(e.dataTransfer.files);
      const file = files[0];
      if (!file) {
        return;
      }

      const validationError = validateFile(file);
      if (validationError) {
        setUploadState((prev) => ({ ...prev, error: validationError }));
        return;
      }

      setUploadState((prev) => ({ ...prev, isUploading: true, progress: 0, error: null }));
      triggerFileInput(file);
    },
    [disabled, validateFile, triggerFileInput],
  );

  const handleClear = React.useCallback(() => {
    form?.setValue(name, null);
    setUploadState({
      isUploading: false,
      progress: 0,
      preview: null,
      fileName: null,
      error: null,
    });
  }, [form, name]);

  const renderContent = () => {
    if (uploadState.isUploading) {
      return <FileUploadProgress progress={uploadState.progress} />;
    }

    if (uploadState.preview || uploadState.fileName) {
      return (
        <FileUploadPreview
          disabled={disabled}
          fileName={uploadState.fileName}
          onClear={handleClear}
          preview={uploadState.preview}
        />
      );
    }

    return (
      <FileUploadDropZone
        accept={accept}
        disabled={disabled}
        generateUploadUrl={generateUploadUrl}
        multiple={multiple}
        name={name}
        onUploadComplete={handleUploadComplete}
        required={required}
      />
    );
  };

  return (
    <div className={cn("space-y-2", className)} data-slot="file-upload-field">
      {label && (
        <Label htmlFor={name}>
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </Label>
      )}

      <div
        aria-label="File upload drop zone"
        className={cn(
          "relative rounded-lg border-2 border-dashed transition-colors",
          isDragging && "border-primary bg-primary/5",
          error && "border-destructive",
          !(error || isDragging) && "border-muted-foreground/25",
          disabled && "cursor-not-allowed opacity-50",
        )}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        ref={dropZoneRef}
        role="button"
        tabIndex={disabled ? -1 : 0}
      >
        {renderContent()}
      </div>

      {description && !error && !uploadState.error && (
        <p className="text-muted-foreground text-xs">{description}</p>
      )}

      {(error || uploadState.error) && (
        <p className="text-destructive text-xs">{error || uploadState.error}</p>
      )}
    </div>
  );
}

/**
 * Drop zone area when no file is uploaded
 */
type FileUploadDropZoneProps = {
  name: string;
  accept?: string;
  multiple?: boolean;
  required?: boolean;
  disabled?: boolean;
  generateUploadUrl: () => Promise<string>;
  onUploadComplete: (uploaded: UploadFileResponse[]) => Promise<void>;
};

function FileUploadDropZone({
  name,
  accept,
  multiple: _multiple,
  required,
  disabled: _disabled,
  generateUploadUrl,
  onUploadComplete,
}: FileUploadDropZoneProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 p-8 text-center"
      data-slot="file-upload-dropzone"
    >
      <div className="rounded-full bg-muted p-3">
        <Upload className="size-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="font-medium text-sm">
          <label className="cursor-pointer text-primary hover:underline" htmlFor={name}>
            Click to upload
          </label>{" "}
          or drag and drop
        </p>
        <p className="text-muted-foreground text-xs">
          {accept ? `Accepted types: ${accept}` : "Any file type accepted"}
        </p>
      </div>
      <UploadInput
        accept={accept}
        className="sr-only"
        generateUploadUrl={generateUploadUrl}
        id={name}
        onUploadComplete={onUploadComplete}
        required={required}
      />
    </div>
  );
}

/**
 * Upload progress indicator
 */
type FileUploadProgressProps = {
  progress: number;
};

function FileUploadProgress({ progress }: FileUploadProgressProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 p-8"
      data-slot="file-upload-progress"
    >
      <Loader2 className="size-8 animate-spin text-primary" />
      <div className="w-full max-w-xs space-y-2">
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center text-muted-foreground text-sm">Uploading... {progress}%</p>
      </div>
    </div>
  );
}

/**
 * File preview after upload
 */
type FileUploadPreviewProps = {
  preview: string | null;
  fileName: string | null;
  onClear: () => void;
  disabled?: boolean;
};

function FileUploadPreview({ preview, fileName, onClear, disabled }: FileUploadPreviewProps) {
  return (
    <div className="relative p-4" data-slot="file-upload-preview">
      {preview ? (
        <div className="flex items-center gap-4">
          <img
            alt="Preview"
            className="size-16 rounded-lg object-cover"
            height={PREVIEW_IMAGE_SIZE}
            src={preview}
            width={PREVIEW_IMAGE_SIZE}
          />
          <div className="flex-1">
            <p className="font-medium text-sm">{fileName}</p>
            <p className="text-muted-foreground text-xs">Upload complete</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-lg bg-muted">
            <FileIcon className="size-6 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{fileName}</p>
            <p className="text-muted-foreground text-xs">Upload complete</p>
          </div>
        </div>
      )}
      <Button
        className="absolute top-2 right-2"
        disabled={disabled}
        onClick={onClear}
        size="icon"
        type="button"
        variant="ghost"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
