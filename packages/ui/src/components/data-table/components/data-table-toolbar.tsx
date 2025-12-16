"use client";

import type { Row, SortingState, Table as TanStackTable } from "@tanstack/react-table";
import { cn } from "../../../utils";
import type { DataTableLabels } from "../labels";
import { defaultDataTableLabels } from "../labels";
import type {
  AdvancedFilterGroup,
  DataTableColumn,
  FilterGroup,
  GroupConfig,
  ViewConfig,
} from "../types";
import { AdvancedFilterButton } from "./advanced-filter-button";
import { ColumnManagerButton } from "./column-manager-button";
import { FilterButton } from "./filter-button";
import { GroupButton } from "./group-button";
import { SearchInput } from "./search-input";
import { SortButton } from "./sort-button";
import { ViewSwitcher } from "./view-switcher";

export type DataTableToolbarProps<TData> = {
  // View switching
  activeView: ViewConfig;
  availableViews: ViewConfig[];
  onViewChange: (view: ViewConfig) => void;

  // Search
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  searchPlaceholder?: string;

  // Filtering
  columns: DataTableColumn<TData>[];
  filterGroups: FilterGroup[];
  onFiltersChange: (filters: FilterGroup[]) => void;

  // Advanced filtering
  advancedFilterState?: AdvancedFilterGroup;
  onAdvancedFilterChange?: (state: AdvancedFilterGroup) => void;

  // Sorting
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;

  // Grouping
  rows?: Row<TData>[];
  table?: TanStackTable<TData>;
  groupConfig?: GroupConfig | null;
  onGroupConfigChange?: (config: GroupConfig | null) => void;

  // Column management
  onColumnVisibilityChange?: (columnId: string, visible: boolean) => void;
  onColumnOrderChange?: (columnId: string, newOrder: number) => void;
  onColumnPinChange?: (columnId: string, pinned: "left" | "right" | false) => void;

  // Layout
  className?: string;
  showSearch?: boolean;
  showViewSwitcher?: boolean;
  showFilterButton?: boolean;
  showAdvancedFilterButton?: boolean;
  showSortButton?: boolean;
  showGroupButton?: boolean;
  showColumnManager?: boolean;
  labels?: DataTableLabels;
};

/**
 * DataTableToolbar - Responsive toolbar combining all data table controls
 * Features:
 * - ViewSwitcher for switching between table/board/gallery/list/feed views
 * - SearchInput for global search with debouncing
 * - FilterButton for advanced filtering
 * - SortButton for multi-column sorting
 * - Container query responsive layout
 * - Automatic overflow handling with ellipsis menu on mobile
 *
 * Layout:
 * - Large screens (>=768px): All controls in a single row
 * - Medium screens (>=640px): ViewSwitcher on top, other controls below
 * - Small screens (<640px): Stacked layout with compact buttons
 *
 * @example
 * <DataTableToolbar
 *   activeView={activeView}
 *   availableViews={availableViews}
 *   onViewChange={setActiveView}
 *   globalFilter={globalFilter}
 *   onGlobalFilterChange={setGlobalFilter}
 *   columns={columns}
 *   filterGroups={filterGroups}
 *   onFiltersChange={setFilterGroups}
 *   sorting={sorting}
 *   onSortingChange={setSorting}
 * />
 */
export function DataTableToolbar<TData>({
  activeView,
  availableViews,
  onViewChange,
  globalFilter,
  onGlobalFilterChange,
  searchPlaceholder,
  columns,
  filterGroups,
  onFiltersChange,
  advancedFilterState,
  onAdvancedFilterChange,
  sorting,
  onSortingChange,
  rows,
  table,
  groupConfig,
  onGroupConfigChange,
  onColumnVisibilityChange,
  onColumnOrderChange,
  onColumnPinChange,
  className,
  showSearch = true,
  showViewSwitcher = true,
  showFilterButton = true,
  showAdvancedFilterButton = false,
  showSortButton = true,
  showGroupButton = false,
  showColumnManager = true,
  labels,
}: DataTableToolbarProps<TData>) {
  const mergedLabels = { ...defaultDataTableLabels, ...labels };
  return (
    <div
      className={cn("@container flex flex-col gap-3", "rounded-lg border bg-card p-3", className)}
    >
      {/* Top row: View switcher (large screens: left aligned) */}
      {showViewSwitcher && (
        <div className="flex items-center @md:justify-start justify-between gap-3">
          <ViewSwitcher
            activeView={activeView}
            availableViews={availableViews}
            onViewChange={onViewChange}
          />
        </div>
      )}

      {/* Bottom row: Search and action buttons */}
      <div className="flex @md:flex-row flex-col @md:items-center gap-3">
        {/* Search input - takes available space */}
        {showSearch && (
          <div className="@md:flex-1">
            <SearchInput
              className="w-full"
              labels={mergedLabels}
              onChange={onGlobalFilterChange}
              placeholder={searchPlaceholder || mergedLabels.searchPlaceholder}
              value={globalFilter}
            />
          </div>
        )}

        {/* Action buttons - right aligned on large screens */}
        <div className="flex items-center gap-2">
          {showFilterButton && (
            <FilterButton
              columns={columns}
              filterGroups={filterGroups}
              labels={mergedLabels}
              onFiltersChange={onFiltersChange}
            />
          )}

          {showAdvancedFilterButton && advancedFilterState && onAdvancedFilterChange && (
            <AdvancedFilterButton
              columns={columns}
              filterState={advancedFilterState}
              labels={mergedLabels}
              onFilterChange={onAdvancedFilterChange}
            />
          )}

          {showSortButton && (
            <SortButton
              columns={columns}
              labels={mergedLabels}
              onSortingChange={onSortingChange}
              sorting={sorting}
            />
          )}

          {showGroupButton && rows && table && onGroupConfigChange && (
            <GroupButton
              columns={columns}
              groupConfig={groupConfig ?? null}
              labels={mergedLabels}
              onGroupConfigChange={onGroupConfigChange}
              rows={rows}
              table={table}
            />
          )}

          {showColumnManager &&
            onColumnVisibilityChange &&
            onColumnOrderChange &&
            onColumnPinChange && (
              <ColumnManagerButton
                columns={columns}
                labels={mergedLabels}
                onColumnOrderChange={onColumnOrderChange}
                onColumnPinChange={onColumnPinChange}
                onColumnVisibilityChange={onColumnVisibilityChange}
              />
            )}
        </div>
      </div>
    </div>
  );
}
