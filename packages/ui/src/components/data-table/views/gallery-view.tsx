"use client";

import type { Table as TanStackTable } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { cn } from "../../../utils";
import { Item, ItemContent, ItemGroup, ItemTitle } from "../../item";
import { IndeterminateCheckbox } from "../components/indeterminate-checkbox";
import { useRowSelection } from "../hooks/use-row-selection";
import type { DataTableLabels } from "../labels";
import { defaultDataTableLabels } from "../labels";
import { findCellForColumn, getDisplayColumns } from "./column-renderer";
import { DataTableViewEmptyState } from "./empty-state";

export type GalleryViewProps<TData> = {
  table: TanStackTable<TData>;
  onRowClick?: (row: TData) => void;
  cardClassName?: string;
  gridCols?: 1 | 2 | 3 | 4 | 5 | 6;
  compactCards?: boolean;
  enableSelection?: boolean;
  className?: string;
  labels?: DataTableLabels;
};

/**
 * GalleryView - Responsive grid layout with card-based display
 * Features:
 * - Responsive grid (1-6 columns)
 * - Card-based data display
 * - Row selection with checkboxes
 * - Shift+Click for range selection
 * - Compact mode for denser layouts
 * - Container query responsive
 * - Clickable cards
 *
 * @example
 * <GalleryView
 *   table={table}
 *   gridCols={3}
 *   onRowClick={(row) => navigate(`/items/${row.id}`)}
 *   compactCards
 *   enableSelection
 * />
 */
export function GalleryView<TData>({
  table,
  onRowClick,
  cardClassName,
  gridCols = 3,
  compactCards = false,
  enableSelection = false,
  className,
  labels,
}: GalleryViewProps<TData>) {
  const mergedLabels = { ...defaultDataTableLabels, ...labels };
  const { handleRowSelection } = useRowSelection(table, enableSelection);

  const rows = table.getRowModel().rows;

  // Get visible columns for card content
  const displayColumns = getDisplayColumns(table);

  // Grid column classes based on gridCols prop
  const gridColsClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 @md:grid-cols-2",
    3: "grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3",
    4: "grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3 @xl:grid-cols-4",
    5: "grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3 @xl:grid-cols-5",
    6: "grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3 @xl:grid-cols-4 @2xl:grid-cols-6",
  }[gridCols];

  if (rows.length === 0) {
    return <DataTableViewEmptyState />;
  }

  return (
    <div className={cn("@container", "p-4", className)}>
      <ItemGroup className={cn("grid gap-4", gridColsClass)}>
        {rows.map((row, rowIndex) => {
          const firstColumn = displayColumns[0];
          const firstCell = firstColumn ? findCellForColumn(row, firstColumn.id) : null;
          const remainingColumns = displayColumns.slice(1);

          return (
            <Item
              className={cn(
                "relative flex-col transition-all",
                "hover:shadow-md",
                row.getIsSelected() && "ring-2 ring-primary ring-offset-2",
                onRowClick && !enableSelection && "cursor-pointer",
                cardClassName,
              )}
              data-state={row.getIsSelected() ? "selected" : undefined}
              key={row.id}
              onClick={() => {
                if (onRowClick && !enableSelection) {
                  onRowClick(row.original);
                }
              }}
              size={compactCards ? "sm" : "default"}
              variant="outline"
            >
              {/* Selection checkbox */}
              {enableSelection && (
                <div className="absolute top-3 right-3 z-10">
                  <IndeterminateCheckbox
                    aria-label={`Select row ${rowIndex + 1}`}
                    checked={row.getIsSelected()}
                    onCheckedChange={() => handleRowSelection(rowIndex)}
                  />
                </div>
              )}

              {/* Item content */}
              <ItemContent className={cn("flex-col gap-2", compactCards && "gap-1")}>
                {/* First column as title */}
                {firstCell && firstColumn && (
                  <ItemTitle className={cn(compactCards && "text-xs")}>
                    {flexRender(firstColumn.columnDef.cell, firstCell.getContext())}
                  </ItemTitle>
                )}

                {/* Remaining columns as descriptions */}
                {remainingColumns.map((column) => {
                  const cell = findCellForColumn(row, column.id);
                  if (!cell) {
                    return null;
                  }

                  return (
                    <div
                      className={cn("text-muted-foreground", compactCards && "text-xs")}
                      key={column.id}
                    >
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
              </ItemContent>
            </Item>
          );
        })}
      </ItemGroup>
    </div>
  );
}
