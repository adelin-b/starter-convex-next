import type { ViewType } from "../components/data-table/types";

/**
 * Default DataTable configuration for consistent setup
 */
export const DEFAULT_TABLE_CONFIG = {
  defaultView: "table" as ViewType,
  enableFiltering: false,
  enablePagination: true,
  enableSearch: true,
  enableSorting: false,
  enableViewSwitcher: true,
  pageSize: 20,
};

/**
 * Standard view configurations (table only)
 * Uses `as const satisfies` to preserve literal types while remaining assignable to ViewType[]
 */
export const STANDARD_VIEWS = ["table"] as const satisfies readonly ViewType[];

/**
 * Extended view configurations (table + gallery)
 * Uses `as const satisfies` to preserve literal types while remaining assignable to ViewType[]
 */
export const EXTENDED_VIEWS = ["table", "gallery"] as const satisfies readonly ViewType[];
