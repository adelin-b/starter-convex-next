import type { Row, RowSelectionState, VisibilityState } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { DEFAULT_VIEW_CONFIGS } from "../constants";
import type {
  DataTableColumn,
  DataTableState,
  Filter,
  FilterGroup,
  ViewConfig,
  ViewType,
} from "../types";

export type UseTableStateProps<TData> = {
  columns: DataTableColumn<TData>[];
  defaultView?: ViewType;
  enabledViews?: readonly ViewType[];
};

export type UseTableStateReturn<TData> = {
  // State object (for convenience)
  state: DataTableState<TData>;

  // Individual state values (for direct access)
  activeView: ViewConfig;
  availableViews: ViewConfig[];
  filterGroups: FilterGroup[];
  sorting: any[];
  columnVisibility: VisibilityState;
  columnFilters: any[];
  globalFilter: string;
  orderedColumns: DataTableColumn<TData>[];
  rowSelection: RowSelectionState;

  // Setters
  setActiveView: (view: ViewConfig) => void;
  setSorting: (sorting: any) => void;
  setFilterGroups: (filterGroups: FilterGroup[]) => void;
  setGlobalFilter: (filter: string) => void;
  setRowSelection: (
    selection: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState),
  ) => void;

  // Actions
  addFilter: (filter: Filter, groupIndex?: number) => void;
  removeFilter: (filterId: string) => void;
  clearFilters: () => void;
  addFilterGroup: () => void;
  removeFilterGroup: (groupIndex: number) => void;
  toggleColumnVisibility: (columnId: string) => void;
  setColumnVisibility: (visibility: VisibilityState) => void;
  updateColumnVisibility: (columnId: string, visible: boolean) => void;
  updateColumnOrder: (columnId: string, newOrder: number) => void;
  updateColumnPinned: (columnId: string, pinned: "left" | "right" | false) => void;
  reorderColumns: (columnIds: string[]) => void;
  resetState: () => void;

  // Row selection actions
  selectAll: (rows: Row<TData>[]) => void;
  selectNone: () => void;
  getSelectedRows: (rows: Row<TData>[]) => TData[];
  getSelectedCount: () => number;
  isAllSelected: (rows: Row<TData>[]) => boolean;
  isIndeterminate: (rows: Row<TData>[]) => boolean;
};

/**
 * Main hook for managing data table state
 * Combines all state management into a single source of truth
 */
export function useTableState<TData>({
  columns,
  defaultView = "table",
  enabledViews = ["table", "board", "gallery", "list", "feed"],
}: UseTableStateProps<TData>): UseTableStateReturn<TData> {
  // Filter available views based on enabled views
  const availableViews = useMemo(
    () => DEFAULT_VIEW_CONFIGS.filter((view) => enabledViews.includes(view.type)),
    [enabledViews],
  );

  // Get initial active view - guaranteed to exist
  const initialView = useMemo(() => {
    const foundView = availableViews.find((view) => view.type === defaultView);
    if (!foundView && availableViews.length === 0) {
      throw new Error("No views available. At least one view must be enabled.");
    }
    return foundView || availableViews[0]!;
  }, [availableViews, defaultView]);

  // Active view state
  const [activeView, setActiveView] = useState<ViewConfig>(initialView);

  // Filter groups state (supports AND/OR logic)
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([{ logic: "AND", filters: [] }]);

  // Column visibility state
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
    const initial: VisibilityState = {};
    for (const column of columns) {
      if (column.id && column.visible !== undefined) {
        initial[column.id] = column.visible;
      }
    }
    return initial;
  });

  // Sorting state
  const [sorting, setSorting] = useState([]);

  // Column filters state (for TanStack Table)
  const [columnFilters, setColumnFilters] = useState([]);

  // Global search filter
  const [globalFilter, setGlobalFilter] = useState("");

  // Column order state
  const [orderedColumns, setOrderedColumns] = useState<DataTableColumn<TData>[]>(columns);

  // Row selection state
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Add filter to a specific group
  const addFilter = useCallback((filter: Filter, groupIndex = 0) => {
    setFilterGroups((prev) => {
      const newGroups = [...prev];
      if (newGroups[groupIndex]) {
        newGroups[groupIndex] = {
          ...newGroups[groupIndex],
          filters: [...newGroups[groupIndex].filters, filter],
        };
      }
      return newGroups;
    });
  }, []);

  // Remove filter by ID
  const removeFilter = useCallback((filterId: string) => {
    setFilterGroups((prev) =>
      prev.map((group) => ({
        ...group,
        filters: group.filters.filter((f) => f.id !== filterId),
      })),
    );
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilterGroups([{ logic: "AND", filters: [] }]);
    setColumnFilters([]);
    setGlobalFilter("");
  }, []);

  // Add new filter group
  const addFilterGroup = useCallback(() => {
    setFilterGroups((prev) => [...prev, { logic: "AND", filters: [] }]);
  }, []);

  // Remove filter group by index
  const removeFilterGroup = useCallback((groupIndex: number) => {
    setFilterGroups((prev) => prev.filter((_, index) => index !== groupIndex));
  }, []);

  // Toggle column visibility
  const toggleColumnVisibility = useCallback((columnId: string) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  }, []);

  // Update column visibility (explicit set)
  const updateColumnVisibility = useCallback((columnId: string, visible: boolean) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnId]: visible,
    }));
    setOrderedColumns((prev) =>
      prev.map((col) => (col.id === columnId ? { ...col, visible } : col)),
    );
  }, []);

  // Update column order
  const updateColumnOrder = useCallback((columnId: string, newOrder: number) => {
    setOrderedColumns((prev) =>
      prev.map((col) => (col.id === columnId ? { ...col, order: newOrder } : col)),
    );
  }, []);

  // Update column pinned state
  const updateColumnPinned = useCallback((columnId: string, pinned: "left" | "right" | false) => {
    setOrderedColumns((prev) =>
      prev.map((col) => (col.id === columnId ? { ...col, pinned } : col)),
    );
  }, []);

  // Reorder columns
  const reorderColumns = useCallback(
    (columnIds: string[]) => {
      const reordered = columnIds
        .map((id) => columns.find((col) => col.id === id))
        .filter(Boolean) as DataTableColumn<TData>[];
      setOrderedColumns(reordered);
    },
    [columns],
  );

  // Reset state to initial values
  const resetState = useCallback(() => {
    setActiveView(initialView);
    setFilterGroups([{ logic: "AND", filters: [] }]);
    setColumnVisibility({});
    setSorting([]);
    setColumnFilters([]);
    setGlobalFilter("");
    setOrderedColumns(columns);
    setRowSelection({});
  }, [initialView, columns]);

  // Select all rows
  const selectAll = useCallback((rows: Row<TData>[]) => {
    const newSelection: RowSelectionState = {};
    for (const row of rows) {
      newSelection[row.id] = true;
    }
    setRowSelection(newSelection);
  }, []);

  // Clear selection
  const selectNone = useCallback(() => {
    setRowSelection({});
  }, []);

  // Get selected row data
  const getSelectedRows = useCallback(
    (rows: Row<TData>[]): TData[] =>
      rows.filter((row) => rowSelection[row.id]).map((row) => row.original),
    [rowSelection],
  );

  // Get count of selected rows
  const getSelectedCount = useCallback(
    () => Object.keys(rowSelection).filter((key) => rowSelection[key]).length,
    [rowSelection],
  );

  // Check if all rows are selected
  const isAllSelected = useCallback(
    (rows: Row<TData>[]): boolean => {
      if (rows.length === 0) {
        return false;
      }
      return rows.every((row) => rowSelection[row.id]);
    },
    [rowSelection],
  );

  // Check if some but not all rows are selected (indeterminate state)
  const isIndeterminate = useCallback(
    (rows: Row<TData>[]): boolean => {
      const selectedCount = rows.filter((row) => rowSelection[row.id]).length;
      return selectedCount > 0 && selectedCount < rows.length;
    },
    [rowSelection],
  );

  // Combine into single state object
  const state: DataTableState<TData> = useMemo(
    () => ({
      activeView,
      availableViews,
      columns: orderedColumns,
      filterGroups,
      sorting,
      columnVisibility,
      columnFilters,
      globalFilter,
      rowSelection,
    }),
    [
      activeView,
      availableViews,
      orderedColumns,
      filterGroups,
      sorting,
      columnVisibility,
      columnFilters,
      globalFilter,
      rowSelection,
    ],
  );

  return {
    // State object
    state,

    // Individual state values
    activeView,
    availableViews,
    filterGroups,
    sorting,
    columnVisibility,
    columnFilters,
    globalFilter,
    orderedColumns,
    rowSelection,

    // Setters
    setActiveView,
    setSorting,
    setFilterGroups,
    setGlobalFilter,
    setRowSelection,

    // Actions
    addFilter,
    removeFilter,
    clearFilters,
    addFilterGroup,
    removeFilterGroup,
    toggleColumnVisibility,
    setColumnVisibility,
    updateColumnVisibility,
    updateColumnOrder,
    updateColumnPinned,
    reorderColumns,
    resetState,

    // Row selection actions
    selectAll,
    selectNone,
    getSelectedRows,
    getSelectedCount,
    isAllSelected,
    isIndeterminate,
  };
}
