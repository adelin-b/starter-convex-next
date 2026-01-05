"use client";
// Disable React Compiler memoization for this file - required for TanStack Table v8 reactivity
// See: https://github.com/TanStack/table/issues/5567
"use no memo";

import type { Table as TanStackTable } from "@tanstack/react-table";
import type { DataTableLabels } from "../labels";
import type { GroupConfig, ViewType } from "../types";
import { BoardView } from "../views/board-view";
import { CalendarView } from "../views/calendar-view";
import { FeedView } from "../views/feed-view";
import { GalleryView } from "../views/gallery-view";
import { ListView } from "../views/list-view";
import { TableView } from "../views/table-view";

export type DataTableViewRendererProps<TData> = {
  activeViewType: ViewType;
  table: TanStackTable<TData>;
  onRowClick?: (row: TData) => void;
  enableSelection?: boolean;
  enableSorting?: boolean;

  // Board view
  boardGroupByColumn?: string;
  firstColumnId?: string;

  // Gallery view
  galleryGridCols?: 1 | 2 | 3 | 4 | 5 | 6;
  galleryCompactCards?: boolean;

  // Feed view
  feedTimestampColumn?: string;
  feedShowTimestamps?: boolean;

  // List view
  listShowDividers?: boolean;
  listCompactSpacing?: boolean;

  // Calendar view
  calendarDateColumn?: string;
  calendarTitleColumn?: string;
  calendarShowEventCount?: boolean;
  calendarMaxEventsPerDate?: number;

  // Grouping (for Table and List views)
  groupConfig?: GroupConfig | null;
  onGroupConfigChange?: (config: GroupConfig | null) => void;
  labels?: DataTableLabels;
};

/**
 * DataTableViewRenderer - Renders the appropriate view based on active view type
 * Extracted from DataTable to reduce component complexity
 */
export function DataTableViewRenderer<TData>({
  activeViewType,
  table,
  onRowClick,
  enableSelection,
  enableSorting,
  boardGroupByColumn,
  firstColumnId = "",
  galleryGridCols = 3,
  galleryCompactCards = false,
  feedTimestampColumn,
  feedShowTimestamps = true,
  listShowDividers = true,
  listCompactSpacing = false,
  calendarDateColumn,
  calendarTitleColumn,
  calendarShowEventCount = true,
  calendarMaxEventsPerDate = 5,
  groupConfig,
  onGroupConfigChange,
  labels,
}: DataTableViewRendererProps<TData>) {
  if (activeViewType === "table") {
    return (
      <TableView
        enableRowHover
        enableSelection={enableSelection}
        enableSorting={enableSorting}
        groupConfig={groupConfig}
        labels={labels}
        onGroupConfigChange={onGroupConfigChange}
        onRowClick={onRowClick}
        table={table}
      />
    );
  }

  if (activeViewType === "board") {
    return (
      <BoardView
        groupByColumn={boardGroupByColumn || firstColumnId}
        onRowClick={onRowClick}
        table={table}
      />
    );
  }

  if (activeViewType === "gallery") {
    return (
      <GalleryView
        compactCards={galleryCompactCards}
        gridCols={galleryGridCols}
        onRowClick={onRowClick}
        table={table}
      />
    );
  }

  if (activeViewType === "list") {
    return (
      <ListView
        compactSpacing={listCompactSpacing}
        groupConfig={groupConfig}
        labels={labels}
        onGroupConfigChange={onGroupConfigChange}
        onRowClick={onRowClick}
        showDividers={listShowDividers}
        table={table}
      />
    );
  }

  if (activeViewType === "feed") {
    return (
      <FeedView
        onRowClick={onRowClick}
        showTimestamps={feedShowTimestamps}
        table={table}
        timestampColumn={feedTimestampColumn}
      />
    );
  }

  if (activeViewType === "calendar") {
    return (
      <CalendarView
        dateColumn={calendarDateColumn || firstColumnId}
        maxEventsPerDate={calendarMaxEventsPerDate}
        onRowClick={onRowClick}
        rows={table.getRowModel().rows}
        showEventCount={calendarShowEventCount}
        titleColumn={calendarTitleColumn}
      />
    );
  }

  return null;
}
