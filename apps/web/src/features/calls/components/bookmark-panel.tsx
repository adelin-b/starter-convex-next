"use client";

import { Button } from "@starter-saas/ui/button";
import { Input } from "@starter-saas/ui/input";
import { ScrollArea } from "@starter-saas/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@starter-saas/ui/tooltip";
import { cn } from "@starter-saas/ui/utils";
import { Bookmark, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Bookmark as BookmarkType } from "../types/recording";
import { formatTime } from "../utils/format-time";

type BookmarkPanelProps = {
  bookmarks: BookmarkType[];
  currentTime: number;
  onAddBookmark: (note: string) => void;
  onRemoveBookmark: (id: string) => void;
  onSeekToBookmark: (bookmark: BookmarkType) => void;
  className?: string;
};

export function BookmarkPanel({
  bookmarks,
  currentTime,
  onAddBookmark,
  onRemoveBookmark,
  onSeekToBookmark,
  className,
}: BookmarkPanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState("");

  const handleAddBookmark = () => {
    if (newNote.trim()) {
      onAddBookmark(newNote.trim());
      setNewNote("");
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddBookmark();
    } else if (e.key === "Escape") {
      setIsAdding(false);
      setNewNote("");
    }
  };

  return (
    <div className={cn("space-y-3", className)} data-testid="bookmark-panel">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">Bookmarks</span>
          {bookmarks.length > 0 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground text-xs">
              {bookmarks.length}
            </span>
          )}
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              data-testid="add-bookmark-button"
              onClick={() => setIsAdding(true)}
              size="icon-sm"
              variant="ghost"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add bookmark at current time</TooltipContent>
        </Tooltip>
      </div>

      {/* Add bookmark input */}
      {isAdding && (
        <div className="flex gap-2" data-testid="add-bookmark-form">
          <Input
            autoFocus
            className="text-sm"
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Bookmark at ${formatTime(currentTime)}...`}
            value={newNote}
          />
          <Button disabled={!newNote.trim()} onClick={handleAddBookmark} size="sm">
            Add
          </Button>
          <Button
            onClick={() => {
              setIsAdding(false);
              setNewNote("");
            }}
            size="sm"
            variant="ghost"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Bookmarks list */}
      {bookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-6 text-center">
          <Bookmark className="mb-2 h-8 w-8 text-muted-foreground/50" />
          <p className="text-muted-foreground text-sm">No bookmarks yet</p>
          <p className="mt-1 text-muted-foreground text-xs">
            Click the + button to add a bookmark at the current time
          </p>
        </div>
      ) : (
        <ScrollArea className="max-h-48">
          <div className="space-y-2">
            {bookmarks.map((bookmark) => (
              <button
                className="group flex w-full cursor-pointer items-center gap-2 rounded-lg border p-2 text-left transition-colors hover:bg-muted/50"
                data-testid={`bookmark-${bookmark.id}`}
                key={bookmark.id}
                onClick={() => onSeekToBookmark(bookmark)}
                type="button"
              >
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-12 items-center justify-center rounded bg-primary/10 font-medium text-primary text-xs">
                    {formatTime(bookmark.time)}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{bookmark.note}</p>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                      data-testid={`remove-bookmark-${bookmark.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveBookmark(bookmark.id);
                      }}
                      size="icon-sm"
                      variant="ghost"
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Remove bookmark</TooltipContent>
                </Tooltip>
              </button>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
