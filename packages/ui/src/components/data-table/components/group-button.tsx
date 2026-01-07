"use client";

import { assertNever } from "@starter-saas/shared/assert-never";
import type { Row, Table as TanStackTable } from "@tanstack/react-table";
import { Eye, EyeOff, Layers, X } from "lucide-react";
import { useState } from "react";
import { cn } from "../../../utils";
import { Button } from "../../button";
import { Label } from "../../label";
import {
  MorphingPopover,
  MorphingPopoverContent,
  MorphingPopoverTrigger,
} from "../../morphing-popover";
import { ScrollArea } from "../../scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../select";
import { Switch } from "../../switch";
import type { DataTableLabels } from "../labels";
import { defaultDataTableLabels } from "../labels";
import type { DataTableColumn, GroupConfig, GroupSortOrder } from "../types";
import { groupSortOrders } from "../types";
import { createDefaultGroupConfig, getUniqueGroupValues, toggleGroupHidden } from "./grouped-rows";

export type GroupButtonProps<TData> = {
  columns: DataTableColumn<TData>[];
  rows: Row<TData>[];
  table: TanStackTable<TData>;
  groupConfig: GroupConfig | null;
  onGroupConfigChange: (config: GroupConfig | null) => void;
  className?: string;
  showLabel?: boolean;
  labels?: DataTableLabels;
};

/**
 * GroupButton - Notion-style group popover for DataTable
 * Features:
 * - Column selector for grouping
 * - Sort order options (A-Z, Z-A, Count ↑, Count ↓)
 * - Hide empty groups toggle
 * - Individual group visibility toggles
 * - Remove grouping action
 *
 * @example
 * <GroupButton
 *   columns={columns}
 *   rows={rows}
 *   table={table}
 *   groupConfig={groupConfig}
 *   onGroupConfigChange={setGroupConfig}
 * />
 */
export function GroupButton<TData>({
  columns,
  rows,
  table,
  groupConfig,
  onGroupConfigChange,
  className,
  showLabel = true,
  labels,
}: GroupButtonProps<TData>) {
  const [open, setOpen] = useState(false);
  const mergedLabels = { ...defaultDataTableLabels, ...labels };

  // Get groupable columns (all columns with ids)
  const groupableColumns = columns.filter((col) => col.id);

  // Get unique values for the grouped column
  const uniqueValues = groupConfig
    ? getUniqueGroupValues(
        rows,
        table,
        groupConfig.columnId,
        mergedLabels.uncategorized ?? "Uncategorized",
      )
    : [];

  // Handle selecting a column to group by
  const handleColumnChange = (columnId: string | null) => {
    if (columnId === null) {
      return;
    }
    if (columnId === "__none__") {
      onGroupConfigChange(null);
    } else {
      onGroupConfigChange(createDefaultGroupConfig(columnId));
    }
  };

  // Handle sort order change
  const handleSortOrderChange = (sortOrder: GroupSortOrder) => {
    if (!groupConfig) {
      return;
    }
    onGroupConfigChange({ ...groupConfig, sortOrder });
  };

  // Handle hide empty toggle
  const handleHideEmptyChange = (hideEmpty: boolean) => {
    if (!groupConfig) {
      return;
    }
    onGroupConfigChange({ ...groupConfig, hideEmpty });
  };

  // Handle individual group visibility toggle
  const handleGroupVisibilityToggle = (value: string) => {
    if (!groupConfig) {
      return;
    }
    onGroupConfigChange(toggleGroupHidden(groupConfig, value));
  };

  // Handle hide all / show all
  const handleHideAllGroups = () => {
    if (!groupConfig) {
      return;
    }
    onGroupConfigChange({ ...groupConfig, hiddenGroups: [...uniqueValues] });
  };

  const handleShowAllGroups = () => {
    if (!groupConfig) {
      return;
    }
    onGroupConfigChange({ ...groupConfig, hiddenGroups: [] });
  };

  // Handle removing grouping
  const handleRemoveGrouping = () => {
    onGroupConfigChange(null);
    setOpen(false);
  };

  // Get column name for display
  const getColumnName = (columnId: string) => {
    const column = columns.find((c) => c.id === columnId);
    if (!column) {
      return columnId;
    }
    return typeof column.header === "string" ? column.header : column.id;
  };

  // Get sort order label
  const getSortOrderLabel = (order: GroupSortOrder) => {
    switch (order) {
      case "asc": {
        return mergedLabels.groupSortAsc;
      }
      case "desc": {
        return mergedLabels.groupSortDesc;
      }
      case "count-asc": {
        return mergedLabels.groupSortCountAsc;
      }
      case "count-desc": {
        return mergedLabels.groupSortCountDesc;
      }
      default: {
        assertNever(order);
      }
    }
  };

  const isGrouped = groupConfig !== null;
  const hiddenCount = groupConfig?.hiddenGroups.length ?? 0;

  return (
    <MorphingPopover onOpenChange={setOpen} open={open}>
      <MorphingPopoverTrigger asChild>
        <Button
          aria-label={
            isGrouped
              ? (mergedLabels.formatGroupedBy?.(getColumnName(groupConfig.columnId)) ??
                `Grouped by ${getColumnName(groupConfig.columnId)}`)
              : mergedLabels.group
          }
          className={cn("relative gap-2", "@md:gap-2", className)}
          size="sm"
          variant="outline"
        >
          <Layers aria-hidden="true" className="size-4" />
          {showLabel && (
            <span aria-hidden="true" className="@md:inline hidden">
              {mergedLabels.group}
            </span>
          )}
          {isGrouped && (
            <span
              aria-hidden="true"
              className="flex size-5 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-xs"
            >
              1
            </span>
          )}
        </Button>
      </MorphingPopoverTrigger>

      <MorphingPopoverContent
        align="start"
        className={cn("w-72", "max-h-[min(calc(100vh-100px),450px)]")}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-2">
            <span className="font-semibold text-sm">{mergedLabels.group}</span>
            {isGrouped && (
              <Button
                aria-label="Close"
                className="size-6 p-0"
                onClick={() => setOpen(false)}
                size="sm"
                variant="ghost"
              >
                <X aria-hidden="true" className="size-4" />
              </Button>
            )}
          </div>

          {/* Group by selector */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">{mergedLabels.groupBy}</Label>
            <Select onValueChange={handleColumnChange} value={groupConfig?.columnId ?? "__none__"}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={mergedLabels.selectColumn} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">—</SelectItem>
                {groupableColumns.map((column) => (
                  <SelectItem key={column.id} value={column.id}>
                    {typeof column.header === "string" ? column.header : column.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort order selector (only when grouped) */}
          {isGrouped && (
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">{mergedLabels.groupSort}</Label>
              <Select
                onValueChange={(value) => handleSortOrderChange(value as GroupSortOrder)}
                value={groupConfig.sortOrder}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {groupSortOrders.map((order) => (
                    <SelectItem key={order} value={order}>
                      {getSortOrderLabel(order)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Hide empty toggle (only when grouped) */}
          {isGrouped && (
            <div className="flex items-center justify-between">
              <Label className="text-sm" htmlFor="hide-empty">
                {mergedLabels.hideEmptyGroups}
              </Label>
              <Switch
                checked={groupConfig.hideEmpty}
                id="hide-empty"
                onCheckedChange={handleHideEmptyChange}
              />
            </div>
          )}

          {/* Groups list (only when grouped) */}
          {isGrouped && uniqueValues.length > 0 && (
            <div className="space-y-2 border-t pt-3">
              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground text-xs">{mergedLabels.groups}</Label>
                <Button
                  className="h-auto p-0 text-xs"
                  onClick={
                    hiddenCount === uniqueValues.length ? handleShowAllGroups : handleHideAllGroups
                  }
                  variant="ghost"
                >
                  {hiddenCount === uniqueValues.length
                    ? mergedLabels.showAllGroups
                    : mergedLabels.hideAllGroups}
                </Button>
              </div>

              <ScrollArea className="max-h-[150px]">
                <div className="space-y-1">
                  {uniqueValues.map((value) => {
                    const isHidden = groupConfig.hiddenGroups.includes(value);
                    return (
                      <button
                        className={cn(
                          "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors",
                          "hover:bg-accent hover:text-accent-foreground",
                          isHidden && "text-muted-foreground line-through",
                        )}
                        key={value}
                        onClick={() => handleGroupVisibilityToggle(value)}
                        type="button"
                      >
                        {isHidden ? (
                          <EyeOff className="size-4 shrink-0" />
                        ) : (
                          <Eye className="size-4 shrink-0" />
                        )}
                        <span className="flex-1 truncate">{value}</span>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Remove grouping button (only when grouped) */}
          {isGrouped && (
            <div className="border-t pt-3">
              <Button
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={handleRemoveGrouping}
                variant="ghost"
              >
                {mergedLabels.removeGrouping}
              </Button>
            </div>
          )}
        </div>
      </MorphingPopoverContent>
    </MorphingPopover>
  );
}
