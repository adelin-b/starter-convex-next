import type { Column, Row, Table as TanStackTable } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { cn } from "../../../utils";

/**
 * Shared column rendering utilities for data table views
 */

export type ColumnRenderOptions = {
  compact?: boolean;
  showLabel?: boolean;
  labelClassName?: string;
  valueClassName?: string;
};

/**
 * Render a column cell with optional label
 * Used in gallery and list views
 */
export function renderColumnCell<TData>({
  column,
  cell,
  options = {},
}: {
  column: Column<TData>;
  cell: ReturnType<Row<TData>["getVisibleCells"]>[number];
  options?: ColumnRenderOptions;
}) {
  const { compact = false, showLabel = true, labelClassName, valueClassName } = options;

  const columnLabel =
    typeof column.columnDef.header === "string" ? column.columnDef.header : column.id;

  if (showLabel) {
    return (
      <div className={cn("space-y-0.5", compact && "space-y-0")}>
        <div className={cn("font-medium text-muted-foreground text-xs", labelClassName)}>
          {columnLabel}
        </div>
        <div className={cn("text-sm", compact && "text-xs", valueClassName)}>
          {flexRender(column.columnDef.cell, cell.getContext())}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("text-sm", compact && "text-xs", valueClassName)}>
      {flexRender(column.columnDef.cell, cell.getContext())}
    </div>
  );
}

/**
 * Get display columns from table, optionally excluding specific column IDs
 */
export function getDisplayColumns<TData>(
  table: TanStackTable<TData>,
  excludeIds: string[] = [],
): Column<TData>[] {
  return table.getAllColumns().filter((col) => col.getIsVisible() && !excludeIds.includes(col.id));
}

/**
 * Find cell for a column in a row
 */
export function findCellForColumn<TData>(
  row: Row<TData>,
  columnId: string,
): ReturnType<Row<TData>["getVisibleCells"]>[number] | undefined {
  return row.getVisibleCells().find((c) => c.column.id === columnId);
}
