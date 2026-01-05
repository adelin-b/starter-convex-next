"use client";

import { assertNever } from "@starter-saas/shared/assert-never";
import type { Row, Table as TanStackTable } from "@tanstack/react-table";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "../../../utils";
import type { DataTableLabels } from "../labels";
import { defaultDataTableLabels } from "../labels";
import type { GroupConfig, GroupSortOrder } from "../types";

/**
 * Grouped row structure after processing
 */
export type GroupedRow<TData> = {
  value: string;
  rows: Row<TData>[];
  count: number;
};

/**
 * Groups rows by column value with sorting and filtering options
 * Extracted from BoardView pattern with additional GroupConfig support
 */
export function groupRows<TData>(
  rows: Row<TData>[],
  table: TanStackTable<TData>,
  groupConfig: GroupConfig,
  uncategorizedLabel: string,
): GroupedRow<TData>[] {
  const { columnId, sortOrder, hideEmpty, hiddenGroups } = groupConfig;

  // Group rows by column value
  const grouped = rows.reduce(
    (acc, row) => {
      const column = table.getColumn(columnId);
      const rawValue = column ? row.getValue(columnId) : null;
      const value = rawValue == null ? uncategorizedLabel : String(rawValue);

      if (!acc[value]) {
        acc[value] = [];
      }
      acc[value]?.push(row);
      return acc;
    },
    {} as Record<string, Row<TData>[]>,
  );

  // Convert to array and apply filters
  let groups: GroupedRow<TData>[] = Object.entries(grouped).map(([value, rowsInGroup]) => ({
    value,
    rows: rowsInGroup,
    count: rowsInGroup.length,
  }));

  // Filter out hidden groups
  if (hiddenGroups.length > 0) {
    groups = groups.filter((g) => !hiddenGroups.includes(g.value));
  }

  // Filter out empty groups if requested
  if (hideEmpty) {
    groups = groups.filter((g) => g.count > 0);
  }

  // Sort groups
  groups = sortGroups(groups, sortOrder);

  return groups;
}

/**
 * Sorts groups based on the sort order
 */
function sortGroups<TData>(
  groups: GroupedRow<TData>[],
  sortOrder: GroupSortOrder,
): GroupedRow<TData>[] {
  const sorted = [...groups];

  switch (sortOrder) {
    case "asc": {
      sorted.sort((a, b) => a.value.localeCompare(b.value));
      break;
    }
    case "desc": {
      sorted.sort((a, b) => b.value.localeCompare(a.value));
      break;
    }
    case "count-asc": {
      sorted.sort((a, b) => a.count - b.count);
      break;
    }
    case "count-desc": {
      sorted.sort((a, b) => b.count - a.count);
      break;
    }
    default: {
      assertNever(sortOrder);
    }
  }

  return sorted;
}

/**
 * Extracts unique group values from rows for a specific column
 */
export function getUniqueGroupValues<TData>(
  rows: Row<TData>[],
  table: TanStackTable<TData>,
  columnId: string,
  uncategorizedLabel: string,
): string[] {
  const values = new Set<string>();

  for (const row of rows) {
    const column = table.getColumn(columnId);
    const rawValue = column ? row.getValue(columnId) : null;
    const value = rawValue == null ? uncategorizedLabel : String(rawValue);
    values.add(value);
  }

  return [...values].sort((a, b) => a.localeCompare(b));
}

/**
 * Props for the GroupHeader component
 */
export type GroupHeaderProps = {
  value: string;
  count: number;
  isCollapsed: boolean;
  onToggle: () => void;
  labels?: DataTableLabels;
  className?: string;
};

/**
 * Collapsible group header component
 * Shows group value, count, and collapse indicator
 */
export function GroupHeader({
  value,
  count,
  isCollapsed,
  onToggle,
  labels,
  className,
}: GroupHeaderProps) {
  const mergedLabels = { ...defaultDataTableLabels, ...labels };
  const countText = mergedLabels.formatGroupCount?.(count) ?? `${count} items`;

  return (
    <button
      aria-expanded={!isCollapsed}
      aria-label={`${isCollapsed ? mergedLabels.expandGroup : mergedLabels.collapseGroup} ${value}`}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-left transition-colors",
        "cursor-pointer border-b bg-muted/30 hover:bg-muted/50",
        "font-medium text-sm",
        className,
      )}
      onClick={onToggle}
      type="button"
    >
      {isCollapsed ? (
        <ChevronRight aria-hidden="true" className="size-4 shrink-0" />
      ) : (
        <ChevronDown aria-hidden="true" className="size-4 shrink-0" />
      )}
      <span className="flex-1 truncate">{value}</span>
      <span className="text-muted-foreground text-xs">{countText}</span>
    </button>
  );
}

/**
 * Helper to toggle a group's collapsed state in GroupConfig
 */
export function toggleGroupCollapsed(groupConfig: GroupConfig, groupValue: string): GroupConfig {
  const isCollapsed = groupConfig.collapsedGroups.includes(groupValue);

  return {
    ...groupConfig,
    collapsedGroups: isCollapsed
      ? groupConfig.collapsedGroups.filter((v) => v !== groupValue)
      : [...groupConfig.collapsedGroups, groupValue],
  };
}

/**
 * Helper to toggle a group's hidden state in GroupConfig
 */
export function toggleGroupHidden(groupConfig: GroupConfig, groupValue: string): GroupConfig {
  const isHidden = groupConfig.hiddenGroups.includes(groupValue);

  return {
    ...groupConfig,
    hiddenGroups: isHidden
      ? groupConfig.hiddenGroups.filter((v) => v !== groupValue)
      : [...groupConfig.hiddenGroups, groupValue],
  };
}

/**
 * Creates a default GroupConfig for a column
 */
export function createDefaultGroupConfig(columnId: string): GroupConfig {
  return {
    columnId,
    sortOrder: "asc",
    hideEmpty: false,
    hiddenGroups: [],
    collapsedGroups: [],
  };
}
