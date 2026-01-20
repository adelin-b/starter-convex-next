"use client";

import { Button } from "@starter-saas/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@starter-saas/ui/dialog";
import { Input } from "@starter-saas/ui/input";
import { Label } from "@starter-saas/ui/label";
import { Switch } from "@starter-saas/ui/switch";
import { Check, Copy, Download, Link2, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Bookmark, ShareOptions, TranscriptSegment } from "../types/recording";
import { formatTime } from "../utils/format-time";

type ShareModalProps = {
  callId: string;
  recordingUrl: string;
  transcript: TranscriptSegment[];
  bookmarks: Bookmark[];
  duration: number;
  agentName?: string;
  contactName?: string;
};

export function ShareModal({
  callId,
  recordingUrl,
  transcript,
  bookmarks,
  duration,
  agentName,
  contactName,
}: ShareModalProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareOptions, setShareOptions] = useState<ShareOptions>({
    includeTranscript: true,
    includeBookmarks: true,
  });

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/call-history/${callId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const generateTranscriptText = (): string => {
    const header = `Call Recording Transcript\n${agentName ? `Agent: ${agentName}\n` : ""}${contactName ? `Contact: ${contactName}\n` : ""}Duration: ${formatTime(duration)}\n${"=".repeat(50)}\n\n`;

    const transcriptText = transcript
      .map((segment) => {
        const speaker = segment.speaker === "agent" ? "AI Agent" : segment.speaker.toUpperCase();
        return `[${formatTime(segment.timestamp)}] ${speaker}:\n${segment.message}\n`;
      })
      .join("\n");

    let bookmarksText = "";
    if (shareOptions.includeBookmarks && bookmarks.length > 0) {
      bookmarksText = `\n${"=".repeat(50)}\nBookmarks:\n${bookmarks.map((b) => `- [${formatTime(b.time)}] ${b.note}`).join("\n")}\n`;
    }

    return header + transcriptText + bookmarksText;
  };

  const handleDownloadTranscript = () => {
    const text = generateTranscriptText();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `call-transcript-${callId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Transcript downloaded");
  };

  const handleDownloadRecording = () => {
    const a = document.createElement("a");
    a.href = recordingUrl;
    a.download = `call-recording-${callId}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Recording download started");
  };

  const handleCopyTranscript = async () => {
    try {
      const text = generateTranscriptText();
      await navigator.clipboard.writeText(text);
      toast.success("Transcript copied to clipboard");
    } catch {
      toast.error("Failed to copy transcript");
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button data-testid="share-button" size="sm" variant="outline">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" data-testid="share-modal">
        <DialogHeader>
          <DialogTitle>Share Recording</DialogTitle>
          <DialogDescription>
            Share this call recording with others or download it for offline use.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Share link */}
          <div className="space-y-2">
            <Label>Share Link</Label>
            <div className="flex gap-2">
              <Input className="flex-1" readOnly value={shareUrl} />
              <Button
                data-testid="copy-link-button"
                onClick={handleCopyLink}
                size="icon"
                variant="outline"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Share options */}
          <div className="space-y-4">
            <Label>Export Options</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-normal text-sm" htmlFor="include-transcript">
                    Include transcript
                  </Label>
                  <p className="text-muted-foreground text-xs">{transcript.length} segments</p>
                </div>
                <Switch
                  checked={shareOptions.includeTranscript}
                  id="include-transcript"
                  onCheckedChange={(checked) =>
                    setShareOptions((prev) => ({ ...prev, includeTranscript: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-normal text-sm" htmlFor="include-bookmarks">
                    Include bookmarks
                  </Label>
                  <p className="text-muted-foreground text-xs">{bookmarks.length} bookmarks</p>
                </div>
                <Switch
                  checked={shareOptions.includeBookmarks}
                  id="include-bookmarks"
                  onCheckedChange={(checked) =>
                    setShareOptions((prev) => ({ ...prev, includeBookmarks: checked }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Download options */}
          <div className="space-y-2">
            <Label>Download</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                className="justify-start"
                data-testid="download-recording-button"
                onClick={handleDownloadRecording}
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" />
                Recording
              </Button>
              <Button
                className="justify-start"
                data-testid="download-transcript-button"
                disabled={transcript.length === 0}
                onClick={handleDownloadTranscript}
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" />
                Transcript
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            className="w-full sm:w-auto"
            disabled={transcript.length === 0}
            onClick={handleCopyTranscript}
            variant="outline"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Transcript
          </Button>
          <Button className="w-full sm:w-auto" onClick={handleCopyLink}>
            <Link2 className="mr-2 h-4 w-4" />
            Copy Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
