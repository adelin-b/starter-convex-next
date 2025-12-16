"use client";
// Disable React Compiler memoization for this file - required for TanStack Table v8 reactivity
// See: https://github.com/TanStack/table/issues/5567
"use no memo";

import {
  type ColumnDef,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { cn } from "../../utils";
import { BatchActionsToolbar } from "./components/batch-actions-toolbar";
import { DataTableToolbar } from "./components/data-table-toolbar";
import { DataTableViewRenderer } from "./components/data-table-view-renderer";
import { useTableState } from "./hooks/use-table-state";
import type { DataTableLabels } from "./labels";
import { defaultDataTableLabels } from "./labels";
import type {
  AdvancedFilterGroup,
  BatchAction,
  DataTableColumn,
  FilterGroup,
  GroupConfig,
  ViewType,
} from "./types";

export type { DataTableLabels } from "./labels";
// Re-export types for convenience
export type { AdvancedFilterGroup, DataTableColumn, FilterGroup } from "./types";

export type DataTableProps<TData, TValue = unknown> = {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];

  // View configuration
  defaultView?: ViewType;
  enabledViews?: readonly ViewType[];

  // Feature toggles
  enableSearch?: boolean;
  enableFiltering?: boolean;
  enableAdvancedFiltering?: boolean;
  enableSorting?: boolean;
  enablePagination?: boolean;
  enableViewSwitcher?: boolean;
  enableSelection?: boolean;
  enableGrouping?: boolean;

  // Grouping
  defaultGroupConfig?: GroupConfig;
  onGroupConfigChange?: (config: GroupConfig | null) => void;

  // Pagination
  pageSize?: number;
  pageSizeOptions?: number[];

  // Search
  searchPlaceholder?: string;

  // Styling
  className?: string;
  toolbarClassName?: string;
  tableClassName?: string;

  // Callbacks
  onRowClick?: (row: TData) => void;
  onSelectionChange?: (selectedRows: TData[]) => void;
  onFiltersChange?: (filters: FilterGroup[]) => void;
  onAdvancedFiltersChange?: (filters: AdvancedFilterGroup) => void;

  // Batch actions
  batchActions?: BatchAction<TData>[];
  showDefaultBatchActions?: boolean;
  onBatchDelete?: (selectedRows: TData[]) => void | Promise<void>;
  onBatchExport?: (selectedRows: TData[]) => void | Promise<void>;
  onBatchEdit?: (selectedRows: TData[]) => void | Promise<void>;

  // Loading state
  isLoading?: boolean;

  // Empty state
  emptyStateMessage?: string;

  // Board view specific
  boardGroupByColumn?: string;

  // Gallery view specific
  galleryGridCols?: 1 | 2 | 3 | 4 | 5 | 6;
  galleryCompactCards?: boolean;

  // Feed view specific
  feedTimestampColumn?: string;
  feedShowTimestamps?: boolean;

  // List view specific
  listShowDividers?: boolean;
  listCompactSpacing?: boolean;

  // Calendar view specific
  calendarDateColumn?: string;
  calendarTitleColumn?: string;
  calendarShowEventCount?: boolean;
  calendarMaxEventsPerDate?: number;

  // Labels
  labels?: DataTableLabels;
};

/**
 * DataTable - Multi-view data table with advanced features
 * Features:
 * - Multiple view types (table, board, gallery, list, feed)
 * - Global search with debouncing
 * - Advanced filtering with multiple operators
 * - Multi-column sorting
 * - Pagination
 * - Responsive design with container queries
 * - Proper accessibility
 *
 * Based on:
 * - TanStack Table v8
 * - Notion database views
 * - shadcn/ui data-table patterns
 *
 * @example
 * <DataTable
 *   data={users}
 *   columns={userColumns}
 *   defaultView="table"
 *   enabledViews={["table", "board", "list"]}
 *   enableSearch
 *   enableFiltering
 *   enableSorting
 *   enablePagination
 * />
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: DataTable is a complex component with many configurable features
export function DataTable<TData, TValue = unknown>({
  data,
  columns,
  defaultView = "table",
  enabledViews = ["table", "board", "gallery", "list", "feed", "calendar"],
  enableSearch = true,
  enableFiltering = true,
  enableAdvancedFiltering = false,
  enableSorting = true,
  enablePagination = true,
  enableViewSwitcher = true,
  enableSelection = false,
  enableGrouping = false,
  defaultGroupConfig,
  onGroupConfigChange,
  pageSize = 10,
  searchPlaceholder,
  className,
  toolbarClassName,
  tableClassName,
  onRowClick,
  onSelectionChange,
  onFiltersChange,
  onAdvancedFiltersChange,
  batchActions = [],
  showDefaultBatchActions = true,
  onBatchDelete,
  onBatchExport,
  onBatchEdit,
  isLoading = false,
  emptyStateMessage = "No results found.",
  boardGroupByColumn,
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
  labels,
}: DataTableProps<TData, TValue>) {
  const mergedLabels = { ...defaultDataTableLabels, ...labels };
  // Convert ColumnDef to DataTableColumn
  const dataTableColumns = useMemo(
    () =>
      columns.map((col, index) => ({
        ...col,
        id: col.id || `column-${index}`,
        enableSorting: enableSorting && (col as DataTableColumn<TData>).enableSorting !== false,
        enableFiltering:
          enableFiltering && (col as DataTableColumn<TData>).enableFiltering !== false,
      })) as DataTableColumn<TData>[],
    [columns, enableSorting, enableFiltering],
  );

  // Use table state hook for view management
  const {
    activeView,
    availableViews,
    filterGroups,
    sorting,
    globalFilter,
    rowSelection,
    setActiveView,
    setFilterGroups,
    setSorting,
    setGlobalFilter,
    setRowSelection,
    getSelectedRows,
    getSelectedCount,
    selectNone,
    selectAll,
  } = useTableState({
    columns: dataTableColumns,
    defaultView,
    enabledViews,
  });

  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  // Grouping state
  const [groupConfig, setGroupConfig] = useState<GroupConfig | null>(defaultGroupConfig ?? null);

  // Handle group config change with external callback
  const handleGroupConfigChange = (config: GroupConfig | null) => {
    setGroupConfig(config);
    onGroupConfigChange?.(config);
  };

  // Advanced filter state
  const [advancedFilterState, setAdvancedFilterState] = useState<AdvancedFilterGroup>({
    type: "group",
    id: "root",
    logic: "AND",
    children: [],
  });

  // Handle advanced filter changes
  const handleAdvancedFilterChange = (state: AdvancedFilterGroup) => {
    setAdvancedFilterState(state);
    onAdvancedFiltersChange?.(state);
  };

  // TanStack Table instance
  const table = useReactTable({
    data,
    columns: dataTableColumns,
    // Add getRowId to ensure proper row identity tracking for reactive updates
    getRowId: (row) => {
      const record = row as Record<string, unknown>;
      return String(record._id ?? record.id ?? "");
    },
    state: {
      sorting,
      globalFilter,
      pagination: enablePagination ? pagination : undefined,
      rowSelection: enableSelection ? rowSelection : {},
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onRowSelectionChange: enableSelection ? setRowSelection : undefined,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    enableRowSelection: enableSelection,
    // Enable sorting and filtering
    enableSorting,
    enableGlobalFilter: enableSearch,
    manualPagination: false,
    manualSorting: false,
    manualFiltering: false,
  });

  // Notify parent of selection changes
  useEffect(() => {
    if (enableSelection && onSelectionChange) {
      const selectedRows = getSelectedRows(table.getFilteredRowModel().rows);
      onSelectionChange(selectedRows);
    }
  }, [enableSelection, onSelectionChange, getSelectedRows, table]);

  // Notify parent of filter changes (for server-side filtering)
  useEffect(() => {
    onFiltersChange?.(filterGroups);
  }, [filterGroups, onFiltersChange]);

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        {/* Skeleton toolbar */}
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
        {/* Skeleton content */}
        <div className="h-96 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  // Empty state
  const isEmpty = table.getRowModel().rows.length === 0;

  // Calculate selected rows and count for batch actions
  const selectedRowsData = enableSelection ? getSelectedRows(table.getFilteredRowModel().rows) : [];
  const selectedCount = enableSelection ? getSelectedCount() : 0;

  const pageText = enablePagination
    ? `${mergedLabels.page} ${table.getState().pagination.pageIndex + 1} ${mergedLabels.of} ${table.getPageCount()}`
    : "";

  return (
    <div className={cn("@container space-y-3", className)} data-slot="data-table">
      {/* Batch Actions Toolbar (appears when rows selected) */}
      {enableSelection && selectedCount > 0 && (
        <BatchActionsToolbar
          batchActions={batchActions}
          labels={mergedLabels}
          onBulkEdit={onBatchEdit}
          onClearSelection={() => {
            selectNone();
          }}
          onDelete={onBatchDelete}
          onExport={onBatchExport}
          onSelectAll={
            selectedCount < table.getFilteredRowModel().rows.length
              ? () => {
                  selectAll(table.getFilteredRowModel().rows);
                }
              : undefined
          }
          selectedCount={selectedCount}
          selectedRows={selectedRowsData}
          showDefaultActions={showDefaultBatchActions}
          totalCount={table.getFilteredRowModel().rows.length}
        />
      )}

      {/* Toolbar */}
      <DataTableToolbar
        activeView={activeView}
        advancedFilterState={advancedFilterState}
        availableViews={availableViews}
        className={toolbarClassName}
        columns={dataTableColumns}
        filterGroups={filterGroups}
        globalFilter={globalFilter}
        groupConfig={groupConfig}
        labels={mergedLabels}
        onAdvancedFilterChange={handleAdvancedFilterChange}
        onFiltersChange={setFilterGroups}
        onGlobalFilterChange={setGlobalFilter}
        onGroupConfigChange={handleGroupConfigChange}
        onSortingChange={setSorting}
        onViewChange={setActiveView}
        rows={table.getRowModel().rows}
        searchPlaceholder={searchPlaceholder}
        showAdvancedFilterButton={enableAdvancedFiltering}
        showFilterButton={enableFiltering}
        showGroupButton={enableGrouping}
        showSearch={enableSearch}
        showSortButton={enableSorting}
        showViewSwitcher={enableViewSwitcher && availableViews.length > 1}
        sorting={sorting}
        table={table}
      />

      {/* View content */}
      <div className={cn("rounded-lg border bg-card", tableClassName)}>
        {isEmpty ? (
          // Empty state
          <div className="flex min-h-[400px] items-center justify-center p-8 text-center">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">{emptyStateMessage}</p>
              {globalFilter && (
                <button
                  className="text-primary text-sm underline-offset-4 hover:underline"
                  onClick={() => {
                    setGlobalFilter("");
                  }}
                  type="button"
                >
                  {mergedLabels.clearSearch}
                </button>
              )}
            </div>
          </div>
        ) : (
          // Render view based on activeView.type
          <DataTableViewRenderer
            activeViewType={activeView.type}
            boardGroupByColumn={boardGroupByColumn}
            calendarDateColumn={calendarDateColumn}
            calendarMaxEventsPerDate={calendarMaxEventsPerDate}
            calendarShowEventCount={calendarShowEventCount}
            calendarTitleColumn={calendarTitleColumn}
            enableSelection={enableSelection}
            enableSorting={enableSorting}
            feedShowTimestamps={feedShowTimestamps}
            feedTimestampColumn={feedTimestampColumn}
            firstColumnId={dataTableColumns[0]?.id || ""}
            galleryCompactCards={galleryCompactCards}
            galleryGridCols={galleryGridCols}
            groupConfig={groupConfig}
            labels={mergedLabels}
            listCompactSpacing={listCompactSpacing}
            listShowDividers={listShowDividers}
            onGroupConfigChange={handleGroupConfigChange}
            onRowClick={onRowClick}
            table={table}
          />
        )}

        {/* Pagination */}
        {enablePagination && !isEmpty && (
          <div className="flex items-center justify-between border-t px-4 py-4">
            <div className="text-muted-foreground text-sm">
              {table.getFilteredRowModel().rows.length} {mergedLabels.totalRows}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!table.getCanPreviousPage()}
                onClick={() => {
                  table.previousPage();
                }}
                type="button"
              >
                {mergedLabels.previous}
              </button>
              <div className="text-sm">{pageText}</div>
              <button
                className="rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!table.getCanNextPage()}
                onClick={() => {
                  table.nextPage();
                }}
                type="button"
              >
                {mergedLabels.next}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
