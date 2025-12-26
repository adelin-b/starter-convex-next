"use client";

import type { Id } from "@starter-saas/backend/convex/_generated/dataModel";
import { Button } from "@starter-saas/ui/button";
import { Eye, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { useFileUrl } from "@/hooks/use-file-upload";

type PDFPreviewProps = {
  storageId: Id<"_storage">;
  fileName: string;
  className?: string;
};

export function PDFPreview({ storageId, fileName, className = "" }: PDFPreviewProps) {
  const [showPreview, setShowPreview] = useState(false);
  const fileUrl = useFileUrl(storageId);

  if (!fileUrl) {
    return (
      <div
        className={`flex aspect-square items-center justify-center rounded bg-muted ${className}`}
      >
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={`aspect-square overflow-hidden rounded bg-muted ${className}`}>
      {showPreview ? (
        <div className="relative h-full w-full">
          {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: iframe onError is legitimate for error handling */}
          <iframe
            className="h-full w-full border-0"
            onError={() => setShowPreview(false)}
            src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            title={`Preview of ${fileName}`}
          />
          <Button
            className="absolute top-2 right-2"
            onClick={() => setShowPreview(false)}
            size="sm"
            variant="secondary"
          >
            <FileText className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center space-y-2 p-2">
          <FileText className="h-8 w-8 text-muted-foreground" />
          <Button
            className="text-xs"
            onClick={() => setShowPreview(true)}
            size="sm"
            variant="outline"
          >
            <Eye className="mr-1 h-3 w-3" />
            Preview PDF
          </Button>
        </div>
      )}
    </div>
  );
}
