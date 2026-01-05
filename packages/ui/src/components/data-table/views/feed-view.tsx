"use client";

import type { Table as TanStackTable } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { Clock } from "lucide-react";
import { cn } from "../../../utils";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from "../../item";
import { DataTableViewEmptyState } from "./empty-state";

export type FeedViewProps<TData> = {
  table: TanStackTable<TData>;
  onRowClick?: (row: TData) => void;
  timestampColumn?: string;
  showTimestamps?: boolean;
  className?: string;
};

/**
 * FeedView - Chronological feed layout with timestamps
 * Features:
 * - Vertical timeline-style layout
 * - Optional timestamps for each entry
 * - Card-based display with spacing
 * - Optimized for reading and scanning
 * - Responsive with container queries
 *
 * @example
 * <FeedView
 *   table={table}
 *   timestampColumn="createdAt"
 *   showTimestamps
 *   onRowClick={(row) => navigate(`/items/${row.id}`)}
 * />
 */
export function FeedView<TData>({
  table,
  onRowClick,
  timestampColumn,
  showTimestamps = true,
  className,
}: FeedViewProps<TData>) {
  const rows = table.getRowModel().rows;

  // Get visible columns excluding timestamp column if specified
  const displayColumns = table
    .getAllColumns()
    .filter((col) => col.getIsVisible() && col.id !== timestampColumn);

  if (rows.length === 0) {
    return <DataTableViewEmptyState />;
  }

  return (
    <div className={cn("@container p-4", className)}>
      <ItemGroup className="space-y-4">
        {rows.map((row) => {
          // Get timestamp value if column specified
          const timestampCell =
            timestampColumn && showTimestamps
              ? row.getVisibleCells().find((c) => c.column.id === timestampColumn)
              : null;

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
              )}
              key={row.id}
              onClick={() => {
                if (onRowClick) {
                  onRowClick(row.original);
                }
              }}
              variant="outline"
            >
              {/* Timestamp header */}
              {timestampCell && (
                <ItemHeader className="mb-4 border-b pb-2">
                  <ItemMedia variant="icon">
                    <Clock aria-hidden="true" className="size-4 text-muted-foreground" />
                  </ItemMedia>
                  <ItemContent>
                    <div className="text-muted-foreground text-xs">
                      {flexRender(timestampCell.column.columnDef.cell, timestampCell.getContext())}
                    </div>
                  </ItemContent>
                </ItemHeader>
              )}

              {/* Feed entry content */}
              <ItemContent className={cn("flex-col gap-3", timestampCell && "pt-0")}>
                {/* First column as title */}
                {firstCell && firstColumn && (
                  <ItemTitle>
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
                    <div className="space-y-1" key={column.id}>
                      <ItemDescription className="font-medium text-xs">
                        {typeof column.columnDef.header === "string"
                          ? column.columnDef.header
                          : column.id}
                      </ItemDescription>
                      <div className="text-muted-foreground text-sm leading-relaxed">
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
  );
}
