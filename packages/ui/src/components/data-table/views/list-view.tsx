"use client";

import type { Table as TanStackTable } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { cn } from "../../../utils";
import { Item, ItemContent, ItemGroup, ItemMedia, ItemSeparator, ItemTitle } from "../../item";
import { GroupHeader, groupRows, toggleGroupCollapsed } from "../components/grouped-rows";
import { IndeterminateCheckbox } from "../components/indeterminate-checkbox";
import { useRowSelection } from "../hooks/use-row-selection";
import type { DataTableLabels } from "../labels";
import { defaultDataTableLabels } from "../labels";
import type { GroupConfig } from "../types";
import { findCellForColumn, getDisplayColumns } from "./column-renderer";
import { DataTableViewEmptyState } from "./empty-state";

export type ListViewProps<TData> = {
  table: TanStackTable<TData>;
  onRowClick?: (row: TData) => void;
  showDividers?: boolean;
  compactSpacing?: boolean;
  enableSelection?: boolean;
  className?: string;
  labels?: DataTableLabels;
  // Grouping
  groupConfig?: GroupConfig | null;
  onGroupConfigChange?: (config: GroupConfig | null) => void;
};

/**
 * ListView - Compact list layout for quick scanning
 * Features:
 * - Minimal vertical spacing
 * - Optional dividers between items
 * - Compact mode for dense display
 * - Hover states for interaction
 * - Row selection with checkboxes
 * - Shift+Click for range selection
 * - Responsive with container queries
 *
 * @example
 * <ListView
 *   table={table}
 *   onRowClick={(row) => navigate(`/items/${row.id}`)}
 *   showDividers
 *   compactSpacing
 *   enableSelection
 * />
 */
export function ListView<TData>({
  table,
  onRowClick,
  showDividers = true,
  compactSpacing = false,
  enableSelection = false,
  className,
  labels,
  groupConfig,
  onGroupConfigChange,
}: ListViewProps<TData>) {
  const mergedLabels = { ...defaultDataTableLabels, ...labels };
  const { handleRowSelection } = useRowSelection(table, enableSelection);

  const rows = table.getRowModel().rows;

  // Get grouped rows if groupConfig is set
  const groupedRows = groupConfig
    ? groupRows(rows, table, groupConfig, mergedLabels.uncategorized ?? "Uncategorized")
    : null;

  // Handle group collapse toggle
  const handleGroupToggle = (groupValue: string) => {
    if (!(groupConfig && onGroupConfigChange)) {
      return;
    }
    onGroupConfigChange(toggleGroupCollapsed(groupConfig, groupValue));
  };

  // Get visible columns for list content
  const displayColumns = getDisplayColumns(table);

  if (rows.length === 0) {
    return <DataTableViewEmptyState />;
  }

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: List item rendering requires conditional logic for selection, responsive layout, and column display
  const renderListItem = (row: (typeof rows)[number], rowIndex: number, isLastInGroup: boolean) => {
    const firstColumn = displayColumns[0];
    const firstCell = firstColumn ? findCellForColumn(row, firstColumn.id) : null;
    const remainingColumns = displayColumns.slice(1);

    return (
      <div key={row.id}>
        <Item
          className={cn(
            row.getIsSelected() && "bg-muted/30",
            compactSpacing && "!py-2",
            onRowClick && !enableSelection && "cursor-pointer",
          )}
          data-state={row.getIsSelected() ? "selected" : undefined}
          onClick={() => {
            if (onRowClick && !enableSelection) {
              onRowClick(row.original);
            }
          }}
          size={compactSpacing ? "sm" : "default"}
          variant={showDividers ? "outline" : "default"}
        >
          {/* Selection checkbox */}
          {enableSelection && (
            <ItemMedia>
              <IndeterminateCheckbox
                aria-label={`Select row ${rowIndex + 1}`}
                checked={row.getIsSelected()}
                onCheckedChange={() => handleRowSelection(rowIndex)}
              />
            </ItemMedia>
          )}

          {/* List item content */}
          <ItemContent className={cn("@md:flex-row @md:items-center @md:gap-4")}>
            {/* First column as title */}
            {firstCell && firstColumn && (
              <div className="@md:flex-1">
                <ItemTitle className={cn(compactSpacing && "text-xs")}>
                  {flexRender(firstColumn.columnDef.cell, firstCell.getContext())}
                </ItemTitle>
                {/* Show remaining columns as description on mobile */}
                {remainingColumns.length > 0 && (
                  <div className="mt-1 @md:hidden space-y-1">
                    {remainingColumns.map((column) => {
                      const cell = findCellForColumn(row, column.id);
                      if (!cell) {
                        return null;
                      }
                      return (
                        <div className="text-xs" key={column.id}>
                          <span className="font-medium text-muted-foreground">
                            {typeof column.columnDef.header === "string"
                              ? column.columnDef.header
                              : column.id}
                            {mergedLabels.columnSeparator}
                          </span>
                          {flexRender(column.columnDef.cell, cell.getContext())}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Remaining columns on desktop */}
            <div className="@md:flex hidden @md:items-center @md:gap-4">
              {remainingColumns.map((column) => {
                const cell = findCellForColumn(row, column.id);
                if (!cell) {
                  return null;
                }
                return (
                  <div className="@md:min-w-[150px]" key={column.id}>
                    <div className="text-muted-foreground text-xs">
                      {flexRender(column.columnDef.cell, cell.getContext())}
                    </div>
                  </div>
                );
              })}
            </div>
          </ItemContent>
        </Item>
        {showDividers && !isLastInGroup && <ItemSeparator />}
      </div>
    );
  };

  return (
    <div className={cn("@container", className)}>
      {groupedRows ? (
        // Grouped rendering with collapsible sections
        <div className="divide-y">
          {groupedRows.map((group) => {
            const isCollapsed = groupConfig?.collapsedGroups.includes(group.value) ?? false;

            return (
              <div key={`group-${group.value}`}>
                <GroupHeader
                  count={group.count}
                  isCollapsed={isCollapsed}
                  labels={mergedLabels}
                  onToggle={() => handleGroupToggle(group.value)}
                  value={group.value}
                />
                {!isCollapsed && (
                  <ItemGroup className={showDividers ? "" : "divide-y-0"}>
                    {group.rows.map((row, rowIndex) =>
                      renderListItem(row, rowIndex, rowIndex === group.rows.length - 1),
                    )}
                  </ItemGroup>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        // Ungrouped rendering
        <ItemGroup className={showDividers ? "" : "divide-y-0"}>
          {rows.map((row, rowIndex) => renderListItem(row, rowIndex, rowIndex === rows.length - 1))}
        </ItemGroup>
      )}
    </div>
  );
}
