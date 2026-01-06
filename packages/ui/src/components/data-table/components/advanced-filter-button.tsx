"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { cn } from "../../../utils";
import { Button } from "../../button";
import { Popover, PopoverContent, PopoverPositioner, PopoverTrigger } from "../../popover";
import type { DataTableLabels } from "../labels";
import { defaultDataTableLabels } from "../labels";
import type { AdvancedFilterGroup, DataTableColumn } from "../types";
import { AdvancedFilterBuilder } from "./advanced-filter-builder";

export type AdvancedFilterButtonProps<TData> = {
  columns: DataTableColumn<TData>[];
  filterState: AdvancedFilterGroup;
  onFilterChange: (state: AdvancedFilterGroup) => void;
  className?: string;
  showLabel?: boolean;
  labels?: DataTableLabels;
};

/**
 * Count all rules in a filter group (including nested groups)
 */
function countRules(group: AdvancedFilterGroup): number {
  let count = 0;
  for (const child of group.children) {
    if (child.type === "rule") {
      count += 1;
    } else {
      count += countRules(child);
    }
  }
  return count;
}

/**
 * AdvancedFilterButton - Opens advanced filter builder dialog
 * Features:
 * - Nested filter groups with AND/OR logic
 * - Visual rule builder similar to fn-sphere
 * - Badge showing active rule count
 * - Container query responsive
 */
export function AdvancedFilterButton<TData>({
  columns,
  filterState,
  onFilterChange,
  className,
  showLabel = true,
  labels,
}: AdvancedFilterButtonProps<TData>) {
  const [open, setOpen] = useState(false);
  const mergedLabels = { ...defaultDataTableLabels, ...labels };

  // Count active rules
  const activeRuleCount = countRules(filterState);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        render={
          <Button
            aria-label={
              activeRuleCount > 0
                ? `${mergedLabels.advancedFilter} (${activeRuleCount} ${mergedLabels.filterRuleCount})`
                : mergedLabels.advancedFilter
            }
            className={cn("relative gap-2", "@md:gap-2", className)}
            size="sm"
            variant="outline"
          >
            <SlidersHorizontal aria-hidden="true" className="size-4" />
            {showLabel && (
              <span aria-hidden="true" className="@md:inline hidden">
                {mergedLabels.advancedFilter}
              </span>
            )}
            {activeRuleCount > 0 && (
              <span
                aria-hidden="true"
                className="flex size-5 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-xs"
              >
                {activeRuleCount}
              </span>
            )}
          </Button>
        }
      />
      <PopoverPositioner>
        <PopoverContent className="w-[600px] max-w-[95vw]">
          <div className="space-y-4">
            {/* Header */}
            <div className="space-y-1">
              <h3 className="font-semibold text-base">{mergedLabels.advancedFilters}</h3>
              <p className="text-muted-foreground text-sm">
                {mergedLabels.advancedFiltersDescription}
              </p>
            </div>

            {/* Filter Builder */}
            <AdvancedFilterBuilder
              columns={columns}
              filterState={filterState}
              labels={mergedLabels}
              onFilterChange={onFilterChange}
            />
          </div>
        </PopoverContent>
      </PopoverPositioner>
    </Popover>
  );
}
