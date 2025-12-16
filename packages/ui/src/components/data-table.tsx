"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { cn } from "@starter-saas/ui/utils";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import * as React from "react";
import { Button } from "./button";
import type { DataTableLabels } from "./data-table/labels";
import { defaultDataTableLabels } from "./data-table/labels";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

export type { DataTableLabels } from "./data-table/labels";
// Re-export types for convenience
export type { DataTableColumn } from "./data-table/types";

// Available page size options for data table pagination
const PAGE_SIZE_10 = 10;
const PAGE_SIZE_20 = 20;
const PAGE_SIZE_30 = 30;
const PAGE_SIZE_40 = 40;
const PAGE_SIZE_50 = 50;
const PAGE_SIZE_OPTIONS = [
  PAGE_SIZE_10,
  PAGE_SIZE_20,
  PAGE_SIZE_30,
  PAGE_SIZE_40,
  PAGE_SIZE_50,
] as const;

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  onRowClick?: (row: TData) => void;
  /** When true, disables client-side filtering (use for server-side filtering) */
  manualFiltering?: boolean;
  /** Callback when column filters change (for server-side filtering) */
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
  /** When true, disables client-side sorting (use for server-side sorting) */
  manualSorting?: boolean;
  /** Callback when sorting changes (for server-side sorting) */
  onSortingChange?: (sorting: SortingState) => void;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Custom toolbar component rendered above the table */
  toolbar?: React.ReactNode;
  /** Translatable labels */
  labels?: DataTableLabels;
};

/**
 * DataTable component with sorting, filtering, and pagination using @tanstack/react-table.
 *
 * @example
 * const columns: ColumnDef<Agent>[] = [
 *   {
 *     accessorKey: "name",
 *     header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
 *   },
 *   {
 *     accessorKey: "status",
 *     header: "Status",
 *   },
 * ];
 *
 * <DataTable
 *   columns={columns}
 *   data={agents}
 *   searchKey="name"
 *   searchPlaceholder="Search agents..."
 * />
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  manualFiltering = false,
  onColumnFiltersChange: onColumnFiltersChangeExternal,
  manualSorting = false,
  onSortingChange: onSortingChangeExternal,
  isLoading = false,
  toolbar,
  labels,
}: DataTableProps<TData, TValue>) {
  const mergedLabels = { ...defaultDataTableLabels, ...labels };
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Handle sorting changes - notify parent if server-side
  const handleSortingChange: typeof setSorting = (updater) => {
    const newSorting = typeof updater === "function" ? updater(sorting) : updater;
    setSorting(newSorting);
    onSortingChangeExternal?.(newSorting);
  };

  // Handle filter changes - notify parent if server-side
  const handleColumnFiltersChange: typeof setColumnFilters = (updater) => {
    const newFilters = typeof updater === "function" ? updater(columnFilters) : updater;
    setColumnFilters(newFilters);
    onColumnFiltersChangeExternal?.(newFilters);
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    // Only enable client-side filtering/sorting when not in manual mode
    getFilteredRowModel: manualFiltering ? undefined : getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    // Enable manual modes
    manualFiltering,
    manualSorting,
  });

  // Helper to render table body content - avoids nested ternary
  const renderTableBodyContent = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell className="h-24 text-center" colSpan={columns.length}>
            <div className="flex items-center justify-center gap-2">
              <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              {mergedLabels.loading}
            </div>
          </TableCell>
        </TableRow>
      );
    }

    const rows = table.getRowModel().rows;
    if (rows.length > 0) {
      return rows.map((row) => (
        <TableRow
          className={cn(onRowClick && "cursor-pointer")}
          data-state={row.getIsSelected() && "selected"}
          key={row.id}
          onClick={() => onRowClick?.(row.original)}
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      ));
    }

    return (
      <TableRow>
        <TableCell className="h-24 text-center" colSpan={columns.length}>
          {mergedLabels.noResults}
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="space-y-4" data-slot="data-table">
      {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>{renderTableBodyContent()}</TableBody>
        </Table>
      </div>
      <DataTablePagination labels={mergedLabels} table={table} />
    </div>
  );
}

/**
 * Column header component with sorting
 */
interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: import("@tanstack/react-table").Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  const sortDirection = column.getIsSorted();
  const getSortIcon = () => {
    if (sortDirection === "desc") {
      return <ChevronDown className="ml-2 size-4" />;
    }
    if (sortDirection === "asc") {
      return <ChevronUp className="ml-2 size-4" />;
    }
    return <ChevronsUpDown className="ml-2 size-4" />;
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Button
        className="-ml-3 h-8 data-[state=open]:bg-accent"
        onClick={() => column.toggleSorting(sortDirection === "asc")}
        size="sm"
        variant="ghost"
      >
        <span>{title}</span>
        {getSortIcon()}
      </Button>
    </div>
  );
}

/**
 * Pagination component for DataTable
 */
type DataTablePaginationProps<TData> = {
  table: import("@tanstack/react-table").Table<TData>;
  labels?: DataTableLabels;
};

export function DataTablePagination<TData>({ table, labels }: DataTablePaginationProps<TData>) {
  const mergedLabels = { ...defaultDataTableLabels, ...labels };
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const totalCount = table.getFilteredRowModel().rows.length;
  const selectedLabel = selectedCount === 1 ? mergedLabels.rowSelected : mergedLabels.rowsSelected;

  const pageText = `${mergedLabels.page} ${table.getState().pagination.pageIndex + 1} ${mergedLabels.of} ${table.getPageCount()}`;

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-muted-foreground text-sm">
        {selectedCount} {mergedLabels.of} {totalCount} {selectedLabel}
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="font-medium text-sm">{mergedLabels.rowsPerPage}</p>
          <select
            className="h-8 w-[70px] rounded-md border border-input bg-transparent px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            value={table.getState().pagination.pageSize}
          >
            {PAGE_SIZE_OPTIONS.map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
        <div className="flex w-[100px] items-center justify-center font-medium text-sm">
          {pageText}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            size="sm"
            variant="outline"
          >
            {mergedLabels.previous}
          </Button>
          <Button
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            size="sm"
            variant="outline"
          >
            {mergedLabels.next}
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Column visibility toggle (for showing/hiding columns)
 */
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

type DataTableViewOptionsProps<TData> = {
  table: import("@tanstack/react-table").Table<TData>;
  labels?: DataTableLabels;
};

export function DataTableViewOptions<TData>({ table, labels }: DataTableViewOptionsProps<TData>) {
  const mergedLabels = { ...defaultDataTableLabels, ...labels };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="ml-auto h-8" size="sm" variant="outline">
          <ChevronDown className="mr-2 size-4" />
          {mergedLabels.view}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>{mergedLabels.columns}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter((column) => column.accessorFn !== undefined && column.getCanHide())
          .map((column) => (
            <DropdownMenuCheckboxItem
              checked={column.getIsVisible()}
              className="capitalize"
              key={column.id}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {column.id}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
