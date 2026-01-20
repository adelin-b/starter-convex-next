"use client";

import { Badge } from "@starter-saas/ui/badge";
import { ScrollArea } from "@starter-saas/ui/scroll-area";
import { cn } from "@starter-saas/ui/utils";
import { Bot, User } from "lucide-react";
import { useEffect, useRef } from "react";
import type { TranscriptSegment } from "../types/recording";
import { formatTime } from "../utils/format-time";

type TranscriptPanelProps = {
  transcript: TranscriptSegment[];
  currentIndex: number;
  onSeek?: (segment: TranscriptSegment) => void;
  className?: string;
};

export function TranscriptPanel({
  transcript,
  currentIndex,
  onSeek,
  className,
}: TranscriptPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll to keep current segment visible
  useEffect(() => {
    if (activeItemRef.current && containerRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, []);

  if (transcript.length === 0) {
    return (
      <div
        className={cn(
          "flex h-64 items-center justify-center rounded-lg border bg-muted/30",
          className,
        )}
      >
        <p className="text-muted-foreground text-sm">No transcript available</p>
      </div>
    );
  }

  return (
    <ScrollArea className={cn("h-64 rounded-lg border", className)}>
      <div className="space-y-3 p-4" data-testid="transcript-panel" ref={containerRef}>
        {transcript.map((segment, index) => {
          const isActive = index === currentIndex;
          const isPast = index < currentIndex;

          return (
            <button
              className={cn(
                "group flex w-full cursor-pointer gap-3 rounded-lg p-3 text-left transition-colors",
                isActive && "bg-primary/10 ring-1 ring-primary/20",
                isPast && !isActive && "opacity-60",
                !isActive && "hover:bg-muted/50",
              )}
              data-testid={`transcript-segment-${index}`}
              key={segment.id}
              onClick={() => onSeek?.(segment)}
              ref={isActive ? activeItemRef : undefined}
              type="button"
            >
              {/* Speaker icon */}
              <div className="flex-shrink-0 pt-0.5">
                {segment.speaker === "agent" && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                {segment.speaker === "user" && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary">
                    <User className="h-4 w-4 text-secondary-foreground" />
                  </div>
                )}
                {segment.speaker !== "agent" && segment.speaker !== "user" && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                    <span className="text-muted-foreground text-xs">SYS</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-medium text-sm capitalize">
                    {segment.speaker === "agent" ? "AI Agent" : segment.speaker}
                  </span>
                  <Badge className="font-normal text-xs" variant="outline">
                    {formatTime(segment.timestamp)}
                  </Badge>
                  {segment.confidence !== undefined && segment.confidence < 0.8 && (
                    <Badge className="font-normal text-xs" variant="secondary">
                      Low confidence
                    </Badge>
                  )}
                </div>
                <p
                  className={cn(
                    "text-sm leading-relaxed",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {segment.message}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
