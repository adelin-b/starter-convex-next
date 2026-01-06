"use client";

import { Columns3, Eye, EyeOff, GripVertical, Pin, PinOff } from "lucide-react";
import { useState } from "react";
import { cn } from "../../../utils";
import { Button } from "../../button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuPositioner,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../dropdown-menu";
import { ScrollArea } from "../../scroll-area";
import { Switch } from "../../switch";
import type { DataTableLabels } from "../labels";
import { defaultDataTableLabels } from "../labels";
import type { DataTableColumn } from "../types";

export type ColumnManagerButtonProps<TData> = {
  columns: DataTableColumn<TData>[];
  onColumnVisibilityChange: (columnId: string, visible: boolean) => void;
  onColumnOrderChange: (columnId: string, newOrder: number) => void;
  onColumnPinChange: (columnId: string, pinned: "left" | "right" | false) => void;
  className?: string;
  labels?: DataTableLabels;
};

export function ColumnManagerButton<TData>({
  columns,
  onColumnVisibilityChange,
  onColumnOrderChange: _onColumnOrderChange,
  onColumnPinChange,
  className,
  labels,
}: ColumnManagerButtonProps<TData>) {
  const mergedLabels = { ...defaultDataTableLabels, ...labels };
  const [open, setOpen] = useState(false);

  // Sort columns by order
  const sortedColumns = [...columns].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const visibleCount = columns.filter((col) => col.visible !== false).length;
  const hiddenCount = columns.length - visibleCount;

  const toggleColumnVisibility = (columnId: string, currentVisible: boolean) => {
    onColumnVisibilityChange(columnId, !currentVisible);
  };

  const cycleColumnPin = (columnId: string, currentPin: "left" | "right" | false | undefined) => {
    if (currentPin === false || currentPin === undefined) {
      onColumnPinChange(columnId, "left");
    } else if (currentPin === "left") {
      onColumnPinChange(columnId, "right");
    } else {
      onColumnPinChange(columnId, false);
    }
  };

  const showAll = () => {
    for (const col of columns) {
      if (col.visible === false) {
        onColumnVisibilityChange(col.id, true);
      }
    }
  };

  const hideAll = () => {
    for (const col of columns) {
      if (col.visible !== false) {
        onColumnVisibilityChange(col.id, false);
      }
    }
  };

  return (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label={
              hiddenCount > 0
                ? `${mergedLabels.columns} (${hiddenCount} ${mergedLabels.columnsHidden})`
                : mergedLabels.columns
            }
            className={cn("gap-2", className)}
            size="sm"
            variant="outline"
          >
            <Columns3 className="size-4" />
            <span className="@md:inline hidden">{mergedLabels.columns}</span>
            {hiddenCount > 0 && (
              <span className="rounded-full bg-primary px-1.5 py-0.5 text-primary-foreground text-xs">
                {hiddenCount}
              </span>
            )}
          </Button>
        }
      />
      <DropdownMenuPositioner align="start">
        <DropdownMenuContent className="w-64">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>{mergedLabels.manageColumns}</span>
            <div className="flex gap-1">
              <Button
                className="h-6 px-2 text-xs"
                onClick={showAll}
                size="sm"
                type="button"
                variant="ghost"
              >
                {mergedLabels.showAll}
              </Button>
              <Button
                className="h-6 px-2 text-xs"
                onClick={hideAll}
                size="sm"
                type="button"
                variant="ghost"
              >
                {mergedLabels.hideAll}
              </Button>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {sortedColumns.length === 0 ? (
            <div className="px-2 py-8 text-center text-muted-foreground text-sm">
              {mergedLabels.noColumnsAvailable}
            </div>
          ) : (
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-1 p-1">
                {sortedColumns.map((column) => {
                  const isVisible = column.visible !== false;
                  const pinned = column.pinned;

                  return (
                    <div
                      className="flex items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-muted"
                      key={column.id}
                    >
                      {/* Drag handle */}
                      <button
                        aria-label={`${mergedLabels.reorderColumn} ${column.id}`}
                        className="cursor-grab text-muted-foreground hover:text-foreground"
                        type="button"
                      >
                        <GripVertical className="size-4" />
                      </button>

                      {/* Visibility toggle */}
                      <Switch
                        aria-label={`${mergedLabels.toggleColumnVisibility} ${column.id}`}
                        checked={isVisible}
                        onCheckedChange={(_checked) => toggleColumnVisibility(column.id, isVisible)}
                      />

                      {/* Column name */}
                      <span className="flex-1 text-sm">
                        {typeof column.header === "string" ? column.header : column.id}
                      </span>

                      {/* Pin toggle */}
                      <button
                        aria-label={`${mergedLabels.pinColumn} ${column.id}`}
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => cycleColumnPin(column.id, pinned)}
                        type="button"
                      >
                        {pinned === false && <PinOff className="size-4" />}
                        {pinned === "left" && <Pin className="size-4 rotate-[-45deg]" />}
                        {pinned === "right" && <Pin className="size-4 rotate-45" />}
                      </button>

                      {/* Visibility icon */}
                      {isVisible ? (
                        <Eye className="size-4 text-muted-foreground" />
                      ) : (
                        <EyeOff className="size-4 text-muted-foreground" />
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </DropdownMenuContent>
      </DropdownMenuPositioner>
    </DropdownMenu>
  );
}
