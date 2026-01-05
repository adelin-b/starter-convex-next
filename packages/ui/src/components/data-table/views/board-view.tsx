"use client";

import type { Table as TanStackTable } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { MoreVertical } from "lucide-react";
import { cn } from "../../../utils";
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "../../item";

export type BoardViewProps<TData> = {
  table: TanStackTable<TData>;
  groupByColumn: string;
  onRowClick?: (row: TData) => void;
  className?: string;
  cardClassName?: string;
};

/**
 * BoardView - Kanban board layout grouped by column
 * Features:
 * - Groups data by specified column value
 * - Card-based display
 * - Drag-and-drop ready structure (DnD implementation needed)
 * - Responsive columns
 *
 * @example
 * <BoardView
 *   table={table}
 *   groupByColumn="status"
 *   onRowClick={(row) => navigate(`/items/${row.id}`)}
 * />
 */
export function BoardView<TData>({
  table,
  groupByColumn,
  onRowClick,
  className,
  cardClassName,
}: BoardViewProps<TData>) {
  // Group rows by column value
  const rows = table.getRowModel().rows;
  const groupedRows = rows.reduce(
    (acc, row) => {
      const column = table.getColumn(groupByColumn);
      const value = column ? String(row.getValue(groupByColumn)) : "Uncategorized";
      if (!acc[value]) {
        acc[value] = [];
      }
      acc[value]?.push(row);
      return acc;
    },
    {} as Record<string, typeof rows>,
  );

  const groups = Object.entries(groupedRows);

  // Get columns to display in cards (exclude groupBy column)
  const displayColumns = table
    .getAllColumns()
    .filter((col) => col.id !== groupByColumn && col.getIsVisible());

  return (
    <div
      className={cn("flex gap-4 overflow-x-auto pb-4", "min-h-[500px]", "@container", className)}
    >
      {groups.map(([groupValue, groupRows]) => (
        <div className="flex @md:min-w-[320px] min-w-[280px] flex-col gap-3" key={groupValue}>
          {/* Column header */}
          <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">{groupValue}</h3>
              <span className="rounded-full bg-background px-2 py-0.5 text-muted-foreground text-xs">
                {groupRows.length}
              </span>
            </div>
            <button
              aria-label={`${groupValue} column options`}
              className="rounded-md p-1 hover:bg-background"
              type="button"
            >
              <MoreVertical className="size-4" />
            </button>
          </div>

          {/* Cards */}
          <ItemGroup className="flex flex-col gap-2">
            {groupRows.map((row) => {
              const firstColumn = displayColumns[0];
              const firstCell = firstColumn
                ? row.getVisibleCells().find((c) => c.column.id === firstColumn.id)
                : null;
              const remainingColumns = displayColumns.slice(1);

              return (
                <Item
                  className={cn(
                    "w-full flex-col transition-all",
                    "hover:shadow-md",
                    onRowClick && "cursor-pointer",
                    cardClassName,
                  )}
                  key={row.id}
                  onClick={() => {
                    if (onRowClick) {
                      onRowClick(row.original);
                    }
                  }}
                  size="sm"
                  variant="outline"
                >
                  {/* Item content - display all visible columns except groupBy */}
                  <ItemContent className="flex-col gap-2">
                    {/* First column as title */}
                    {firstCell && firstColumn && (
                      <ItemTitle className="text-sm">
                        {flexRender(firstColumn.columnDef.cell, firstCell.getContext())}
                      </ItemTitle>
                    )}

                    {/* Remaining columns as descriptions */}
                    {remainingColumns.map((column) => {
                      const cell = row.getVisibleCells().find((c) => c.column.id === column.id);
                      if (!cell) {
                        return null;
                      }

                      return (
                        <div className="mb-2 last:mb-0" key={column.id}>
                          <ItemDescription className="font-medium text-xs">
                            {typeof column.columnDef.header === "string"
                              ? column.columnDef.header
                              : column.id}
                          </ItemDescription>
                          <div className="mt-0.5 text-muted-foreground text-sm">
                            {flexRender(column.columnDef.cell, cell.getContext())}
                          </div>
                        </div>
                      );
                    })}
                  </ItemContent>
                </Item>
              );
            })}
          </ItemGroup>
        </div>
      ))}
    </div>
  );
}
