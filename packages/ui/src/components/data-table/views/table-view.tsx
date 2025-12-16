"use client";
// Disable React Compiler memoization for this file - required for TanStack Table v8 reactivity
// When data changes, cells must re-render to show updated values
// See: https://github.com/TanStack/table/issues/5567
"use no memo";

import type { Table as TanStackTable } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useCallback } from "react";
import { cn } from "../../../utils";
import { GroupHeader, groupRows, toggleGroupCollapsed } from "../components/grouped-rows";
import { IndeterminateCheckbox } from "../components/indeterminate-checkbox";
import { useRowSelection } from "../hooks/use-row-selection";
import type { DataTableLabels } from "../labels";
import { defaultDataTableLabels } from "../labels";
import type { GroupConfig } from "../types";

export type TableViewProps<TData> = {
  table: TanStackTable<TData>;
  onRowClick?: (row: TData) => void;
  enableSorting?: boolean;
  enableRowHover?: boolean;
  enableSelection?: boolean;
  denseMode?: boolean;
  className?: string;
  // Grouping
  groupConfig?: GroupConfig | null;
  onGroupConfigChange?: (config: GroupConfig | null) => void;
  labels?: DataTableLabels;
};

/**
 * TableView - Traditional table layout with TanStack Table
 * Features:
 * - Column sorting with visual indicators
 * - Row selection with checkboxes
 * - Row hover states
 * - Dense mode for compact display
 * - Clickable rows
 * - Responsive overflow handling
 *
 * @example
 * <TableView
 *   table={table}
 *   onRowClick={(row) => navigate(`/items/${row.id}`)}
 *   enableSorting
 *   enableRowHover
 *   enableSelection
 * />
 */
export function TableView<TData>({
  table,
  onRowClick,
  enableSorting = true,
  enableRowHover = true,
  enableSelection = false,
  denseMode = false,
  className,
  groupConfig,
  onGroupConfigChange,
  labels,
}: TableViewProps<TData>) {
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

  // Handle select all checkbox
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      table.toggleAllRowsSelected(checked);
    },
    [table],
  );
  const isAllSelected = rows.length > 0 && rows.every((row) => row.getIsSelected());
  const isIndeterminate = rows.some((row) => row.getIsSelected()) && !isAllSelected;

  // Helper: Get checkbox state for select-all
  const getSelectAllState = (): boolean | "indeterminate" => {
    if (isAllSelected) {
      return true;
    }
    if (isIndeterminate) {
      return "indeterminate";
    }
    return false;
  };

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr className="border-b" key={headerGroup.id}>
              {/* Selection checkbox column */}
              {enableSelection && (
                <th
                  className={cn(
                    "text-left align-middle font-medium text-muted-foreground",
                    denseMode ? "h-10 w-10 px-3" : "h-12 w-12 px-4",
                  )}
                >
                  <div className="flex items-center justify-center">
                    <IndeterminateCheckbox
                      aria-label="Select all rows"
                      checked={getSelectAllState()}
                      onCheckedChange={handleSelectAll}
                    />
                  </div>
                </th>
              )}

              {/* Regular column headers */}
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const isSorted = header.column.getIsSorted();

                return (
                  <th
                    className={cn(
                      "text-left align-middle font-medium text-muted-foreground",
                      denseMode ? "h-10 px-3 text-xs" : "h-12 px-4 text-sm",
                      canSort && enableSorting && "cursor-pointer select-none",
                    )}
                    key={header.id}
                    onClick={
                      canSort && enableSorting ? header.column.getToggleSortingHandler() : undefined
                    }
                  >
                    {header.isPlaceholder ? null : (
                      <div className="flex items-center gap-2">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && enableSorting && (
                          <div className="flex flex-col">
                            {isSorted === "asc" && <ChevronUp className="size-4" />}
                            {isSorted === "desc" && <ChevronDown className="size-4" />}
                            {!isSorted && (
                              <div className="size-4 opacity-0 group-hover:opacity-50">
                                <ChevronUp className="size-4" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {groupedRows
            ? // Grouped rendering with collapsible sections
              groupedRows.map((group) => {
                const isCollapsed = groupConfig?.collapsedGroups.includes(group.value) ?? false;
                const colSpan = table.getAllColumns().length + (enableSelection ? 1 : 0);

                return (
                  <tr key={`group-${group.value}`}>
                    <td className="p-0" colSpan={colSpan}>
                      <GroupHeader
                        count={group.count}
                        isCollapsed={isCollapsed}
                        labels={mergedLabels}
                        onToggle={() => handleGroupToggle(group.value)}
                        value={group.value}
                      />
                      {!isCollapsed && (
                        <table className="w-full">
                          <tbody>
                            {group.rows.map((row, rowIndex) => (
                              <tr
                                className={cn(
                                  "border-b transition-colors",
                                  enableRowHover && "hover:bg-muted/50",
                                  row.getIsSelected() && "bg-muted/30",
                                  onRowClick && !enableSelection && "cursor-pointer",
                                )}
                                data-state={row.getIsSelected() ? "selected" : undefined}
                                key={row.id}
                                onClick={(e) => {
                                  const target = e.target as HTMLElement;
                                  const isCheckboxClick = target.closest('[data-slot="checkbox"]');
                                  const isInteractiveElement = target.closest(
                                    'button, a, input, select, textarea, [role="button"], [role="link"], [data-interactive]',
                                  );
                                  if (
                                    !(isCheckboxClick || isInteractiveElement) &&
                                    onRowClick &&
                                    !enableSelection
                                  ) {
                                    onRowClick(row.original);
                                  }
                                }}
                              >
                                {enableSelection && (
                                  <td
                                    className={cn(
                                      "align-middle",
                                      denseMode ? "w-10 p-3" : "w-12 p-4",
                                    )}
                                  >
                                    <div className="flex items-center justify-center">
                                      <IndeterminateCheckbox
                                        aria-label={`Select row ${rowIndex + 1}`}
                                        checked={row.getIsSelected()}
                                        onCheckedChange={() => handleRowSelection(rowIndex)}
                                      />
                                    </div>
                                  </td>
                                )}
                                {row.getVisibleCells().map((cell) => (
                                  <td
                                    className={cn(
                                      "align-middle",
                                      denseMode ? "p-3 text-xs" : "p-4 text-sm",
                                    )}
                                    key={cell.id}
                                  >
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </td>
                  </tr>
                );
              })
            : // Ungrouped rendering
              rows.map((row, rowIndex) => (
                <tr
                  className={cn(
                    "border-b transition-colors",
                    enableRowHover && "hover:bg-muted/50",
                    row.getIsSelected() && "bg-muted/30",
                    onRowClick && !enableSelection && "cursor-pointer",
                  )}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  key={row.id}
                  onClick={(e) => {
                    // Don't trigger row click if clicking interactive elements or if selection is enabled
                    const target = e.target as HTMLElement;
                    const isCheckboxClick = target.closest('[data-slot="checkbox"]');
                    // Check for interactive elements: buttons, links, inputs, selects, textareas
                    const isInteractiveElement = target.closest(
                      'button, a, input, select, textarea, [role="button"], [role="link"], [data-interactive]',
                    );

                    if (
                      !(isCheckboxClick || isInteractiveElement) &&
                      onRowClick &&
                      !enableSelection
                    ) {
                      onRowClick(row.original);
                    }
                  }}
                >
                  {/* Selection checkbox column */}
                  {enableSelection && (
                    <td className={cn("align-middle", denseMode ? "w-10 p-3" : "w-12 p-4")}>
                      <div className="flex items-center justify-center">
                        <IndeterminateCheckbox
                          aria-label={`Select row ${rowIndex + 1}`}
                          checked={row.getIsSelected()}
                          onCheckedChange={() => {
                            handleRowSelection(rowIndex);
                          }}
                        />
                      </div>
                    </td>
                  )}

                  {/* Regular data cells */}
                  {row.getVisibleCells().map((cell) => (
                    <td
                      className={cn("align-middle", denseMode ? "p-3 text-xs" : "p-4 text-sm")}
                      key={cell.id}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
