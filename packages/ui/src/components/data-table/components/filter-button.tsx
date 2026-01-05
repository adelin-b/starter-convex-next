"use client";

import { Filter, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "../../../utils";
import { Button } from "../../button";
import { Popover, PopoverContent, PopoverTrigger } from "../../popover";
import type { DataTableLabels } from "../labels";
import { defaultDataTableLabels } from "../labels";
import type { DataTableColumn, FilterGroup } from "../types";
import { FilterEditor } from "./filter-editor";

export type FilterButtonProps<TData> = {
  columns: DataTableColumn<TData>[];
  filterGroups: FilterGroup[];
  onFiltersChange: (filters: FilterGroup[]) => void;
  className?: string;
  showLabel?: boolean;
  labels?: DataTableLabels;
};

/**
 * FilterButton - Opens filter management dialog
 * Features:
 * - Responsive: Shows icon + label on large screens, icon only on small screens
 * - Badge showing active filter count
 * - Opens dialog with FilterEditor components for managing all filters
 * - Container query responsive
 * - Proper accessibility
 *
 * @example
 * <FilterButton
 *   columns={columns}
 *   filterGroups={filterGroups}
 *   onFiltersChange={setFilterGroups}
 * />
 */
export function FilterButton<TData>({
  columns,
  filterGroups,
  onFiltersChange,
  className,
  showLabel = true,
  labels,
}: FilterButtonProps<TData>) {
  const [open, setOpen] = useState(false);
  const mergedLabels = { ...defaultDataTableLabels, ...labels };

  // Count active filters
  const activeFilterCount = filterGroups.reduce((count, group) => count + group.filters.length, 0);

  // Get filterable columns
  const filterableColumns = columns.filter((col) => col.enableFiltering !== false && col.id);

  // Handle adding a filter
  const handleAddFilter = () => {
    // Use first filterable column if available
    const firstColumn = filterableColumns[0];
    if (!firstColumn) {
      return;
    }

    const newFilter = {
      id: `filter-${Date.now()}`,
      column: firstColumn.id,
      operator: "equals" as const,
      value: "",
    };

    const updatedGroups = [...filterGroups];
    if (updatedGroups.length === 0) {
      updatedGroups.push({ logic: "AND", filters: [newFilter] });
    } else {
      const firstGroup = updatedGroups[0];
      if (firstGroup) {
        updatedGroups[0] = {
          logic: firstGroup.logic,
          filters: [...firstGroup.filters, newFilter],
        };
      }
    }

    onFiltersChange(updatedGroups);
  };

  // Handle updating a specific filter
  const handleFilterChange = (
    filterId: string,
    updatedFilter: (typeof filterGroups)[0]["filters"][0],
  ) => {
    const updatedGroups = filterGroups.map((group) => ({
      ...group,
      filters: group.filters.map((f) => (f.id === filterId ? updatedFilter : f)),
    }));
    onFiltersChange(updatedGroups);
  };

  // Handle removing a filter
  const handleFilterRemove = (filterId: string) => {
    const updatedGroups = filterGroups.map((g) => ({
      ...g,
      filters: g.filters.filter((f) => f.id !== filterId),
    }));
    onFiltersChange(updatedGroups);
  };

  // Handle clearing all filters
  const handleClearAll = () => {
    onFiltersChange([{ logic: "AND", filters: [] }]);
  };

  // Get all filters from all groups
  const allFilters = filterGroups.flatMap((group) => group.filters);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-label={
            activeFilterCount > 0
              ? `${mergedLabels.filter} (${activeFilterCount} ${mergedLabels.filterActive})`
              : mergedLabels.filter
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
          <Filter aria-hidden="true" className="size-4" />
          {/* Label - hidden on small screens via container query */}
          {showLabel && (
            <span aria-hidden="true" className="@md:inline hidden">
              {mergedLabels.filter}
            </span>
          )}
          {/* Active filter count badge */}
          {activeFilterCount > 0 && (
            <span
              aria-hidden="true"
              className="flex size-5 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-xs"
            >
              {activeFilterCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="max-w-3xl">
        <div className="space-y-4">
          {/* Header */}
          <div className="space-y-1">
            <h3 className="font-semibold text-base">{mergedLabels.filters}</h3>
            <p className="text-muted-foreground text-sm">{mergedLabels.filtersDescription}</p>
          </div>

          {/* Filter list */}
          {allFilters.length > 0 ? (
            <div className="space-y-3">
              {allFilters.map((filter) => (
                <FilterEditor
                  columns={columns}
                  filter={filter}
                  key={filter.id}
                  labels={labels}
                  onChange={(updatedFilter) => handleFilterChange(filter.id, updatedFilter)}
                  onRemove={() => handleFilterRemove(filter.id)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground text-sm">{mergedLabels.noFiltersApplied}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-2 border-t pt-4">
            <Button
              disabled={filterableColumns.length === 0}
              onClick={handleAddFilter}
              size="sm"
              type="button"
              variant="outline"
            >
              <Plus className="mr-2 size-4" />
              {mergedLabels.addFilter}
            </Button>

            {allFilters.length > 0 && (
              <Button onClick={handleClearAll} size="sm" type="button" variant="ghost">
                {mergedLabels.clearAll}
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
