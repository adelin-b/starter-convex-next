"use client";

import type { SortingState } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Plus, X } from "lucide-react";
import { useState } from "react";
import { cn } from "../../../utils";
import { Button } from "../../button";
import { Popover, PopoverContent, PopoverTrigger } from "../../popover";
import { ScrollArea } from "../../scroll-area";
import type { DataTableLabels } from "../labels";
import { defaultDataTableLabels } from "../labels";
import type { DataTableColumn } from "../types";

export type SortButtonProps<TData> = {
  columns: DataTableColumn<TData>[];
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  className?: string;
  showLabel?: boolean;
  labels?: DataTableLabels;
};

/**
 * SortButton - Responsive sort dropdown with multi-column sorting
 * Features:
 * - Responsive: Shows icon + label on large screens, icon only on small screens
 * - Scrollable dropdown with scroll shadows for long column lists
 * - Container query responsive
 * - Badge showing active sort count
 * - Multi-column sorting support
 * - Toggle sort direction (asc/desc)
 * - Proper accessibility
 *
 * @example
 * <SortButton
 *   columns={columns}
 *   sorting={sorting}
 *   onSortingChange={setSorting}
 * />
 */
export function SortButton<TData>({
  columns,
  sorting,
  onSortingChange,
  className,
  showLabel = true,
  labels,
}: SortButtonProps<TData>) {
  const [open, setOpen] = useState(false);
  const mergedLabels = { ...defaultDataTableLabels, ...labels };

  // Count active sorts
  const activeSortCount = sorting.length;

  // Get sortable columns
  const sortableColumns = columns.filter((col) => col.enableSorting !== false && col.id);

  // Handle adding a sort
  const handleAddSort = (columnId: string) => {
    // Check if column is already sorted
    const existingSort = sorting.find((s) => s.id === columnId);

    if (existingSort) {
      // Toggle sort direction
      const newSorting = sorting.map((s) => (s.id === columnId ? { ...s, desc: !s.desc } : s));
      onSortingChange(newSorting);
    } else {
      // Add new sort (ascending by default)
      onSortingChange([...sorting, { id: columnId, desc: false }]);
    }

    // Keep popover open so user can configure the sort or add more sorts
  };

  // Handle clearing all sorts
  const handleClearAll = () => {
    onSortingChange([]);
    setOpen(false);
  };

  // Handle removing a specific sort
  const handleRemoveSort = (columnId: string) => {
    const newSorting = sorting.filter((s) => s.id !== columnId);
    onSortingChange(newSorting);
  };

  // Get sort direction icon
  const getSortIcon = (columnId: string) => {
    const sort = sorting.find((s) => s.id === columnId);
    if (!sort) {
      return null;
    }
    return sort.desc ? <ArrowDown className="size-4" /> : <ArrowUp className="size-4" />;
  };

  // Get column name
  const getColumnName = (columnId: string) => {
    const column = columns.find((c) => c.id === columnId);
    if (!column) {
      return columnId;
    }
    return typeof column.header === "string" ? column.header : column.id;
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-label={
            activeSortCount > 0
              ? `${mergedLabels.sort} (${activeSortCount} ${mergedLabels.sortActive})`
              : mergedLabels.sort
          }
          className={cn(
            "relative gap-2",
            // Show label on larger containers, hide on small
            "@md:gap-2",
            className,
          )}
          size="sm"
          variant="outline"
        >
          <ArrowUpDown aria-hidden="true" className="size-4" />
          {/* Label - hidden on small screens via container query */}
          {showLabel && (
            <span aria-hidden="true" className="@md:inline hidden">
              {mergedLabels.sort}
            </span>
          )}
          {/* Active sort count badge */}
          {activeSortCount > 0 && (
            <span
              aria-hidden="true"
              className="flex size-5 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-xs"
            >
              {activeSortCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className={cn(
          "w-64",
          // Limit height and enable scrolling for long lists
          "max-h-[min(calc(100vh-100px),400px)]",
        )}
      >
        <div className="flex items-center justify-between border-b pb-2">
          <span className="font-semibold text-sm">{mergedLabels.addSort}</span>
          {activeSortCount > 0 && (
            <Button className="h-auto p-0 text-xs" onClick={handleClearAll} variant="ghost">
              {mergedLabels.clearAll}
            </Button>
          )}
        </div>

        {/* Scrollable area with automatic scroll shadows */}
        <ScrollArea className="max-h-[300px]">
          {sortableColumns.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              {mergedLabels.noSortableColumns}
            </div>
          ) : (
            <div className="p-1">
              {sortableColumns.map((column) => {
                const isActive = sorting.some((s) => s.id === column.id);
                return (
                  <button
                    className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                    key={column.id}
                    onClick={() => handleAddSort(column.id)}
                    type="button"
                  >
                    {isActive ? getSortIcon(column.id) : <Plus className="size-4" />}
                    <span className="flex-1 truncate">
                      {typeof column.header === "string" ? column.header : column.id}
                    </span>
                    {isActive && (
                      <span className="text-muted-foreground text-xs">
                        {sorting.find((s) => s.id === column.id)?.desc
                          ? mergedLabels.desc
                          : mergedLabels.asc}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Show active sorts if any */}
        {activeSortCount > 0 && (
          <div className="border-t pt-2">
            <div className="p-2">
              <div className="font-medium text-muted-foreground text-xs">
                {mergedLabels.activeSorts}
              </div>
              <div className="mt-1 space-y-1">
                {sorting.map((sort, index) => (
                  <div
                    className="flex items-center gap-2 rounded-md bg-muted px-2 py-1 text-xs"
                    key={sort.id}
                  >
                    <span aria-hidden="true" className="text-muted-foreground">
                      {index + 1}.
                    </span>
                    {sort.desc ? <ArrowDown className="size-3" /> : <ArrowUp className="size-3" />}
                    <span className="flex-1 truncate font-medium">{getColumnName(sort.id)}</span>
                    <Button
                      aria-label={`${mergedLabels.removeSort} ${getColumnName(sort.id)}`}
                      className="size-4 p-0"
                      onClick={() => handleRemoveSort(sort.id)}
                      size="sm"
                      variant="ghost"
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
