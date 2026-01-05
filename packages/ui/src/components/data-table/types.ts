import type {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";

/**
 * Available view types for the data table
 */
export type ViewType = "table" | "board" | "gallery" | "list" | "feed" | "calendar";

/**
 * Filter operators for advanced filtering
 */
export type FilterOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "notContains"
  | "startsWith"
  | "endsWith"
  | "greaterThan"
  | "lessThan"
  | "greaterThanOrEqual"
  | "lessThanOrEqual"
  | "isEmpty"
  | "isNotEmpty"
  | "isAnyOf"
  | "isNoneOf"
  // Relation-specific operators
  | "relatedTo"
  | "notRelatedTo"
  | "hasAnyRelation"
  | "hasNoRelation"
  | "relatedToAny"
  | "relatedToAll";

/**
 * Filter condition combining operator
 */
export type FilterLogic = "AND" | "OR";

/**
 * Card size options for gallery view
 */
export type CardSize = "small" | "medium" | "large";

/**
 * Page opening behavior
 */
export type PageOpenMode = "center-peek" | "side-peek" | "full-page";

/**
 * Load limit options for feed view
 */
export type LoadLimit = 10 | 20 | 30 | 50 | 100;

/**
 * Individual filter configuration
 */
export type Filter = {
  id: string;
  column: string;
  operator: FilterOperator;
  value: unknown;
};

/**
 * Filter group with logic operator
 */
export type FilterGroup = {
  logic: FilterLogic;
  filters: Filter[];
};

/**
 * Advanced filter rule - a single condition
 */
export type AdvancedFilterRule = {
  type: "rule";
  id: string;
  field: string;
  operator: FilterOperator;
  value: unknown;
};

/**
 * Advanced filter group - can contain rules or nested groups
 */
export type AdvancedFilterGroup = {
  type: "group";
  id: string;
  logic: FilterLogic;
  children: AdvancedFilterNode[];
};

/**
 * Union type for filter tree nodes
 */
export type AdvancedFilterNode = AdvancedFilterRule | AdvancedFilterGroup;

/**
 * Table view specific settings
 */
export type TableViewSettings = {
  enableSorting: boolean;
  enableSelection: boolean;
  enablePagination: boolean;
  enableRowHover: boolean;
  denseMode: boolean;
};

/**
 * Board/Kanban view specific settings
 */
export type BoardViewSettings = {
  groupByColumn: string;
  enableDragDrop: boolean;
  showCardCount: boolean;
  columnWidth: number;
};

/**
 * Gallery view specific settings
 */
export type GalleryViewSettings = {
  cardSize: CardSize;
  showPageIcon: boolean;
  fitImage: boolean;
  wrapProperties: boolean;
  cardPreview: "none" | "page-content" | "cover";
  openPagesIn: PageOpenMode;
  columns: number; // Grid columns (responsive)
};

/**
 * List view specific settings
 */
export type ListViewSettings = {
  showPageIcon: boolean;
  compactMode: boolean;
  openPagesIn: PageOpenMode;
  showProperties: boolean;
};

/**
 * Feed view specific settings
 */
export type FeedViewSettings = {
  showAuthorByline: boolean;
  enableReactions: boolean;
  enableComments: boolean;
  loadLimit: LoadLimit;
  openPagesIn: PageOpenMode;
  showTimestamps: boolean;
};

/**
 * Calendar view specific settings
 */
export type CalendarViewSettings = {
  dateColumn: string;
  titleColumn?: string;
  showEventCount: boolean;
  maxEventsPerDate: number;
  defaultView: "month" | "week" | "day";
};

/**
 * Union type of all view settings
 */
export type ViewSettings =
  | TableViewSettings
  | BoardViewSettings
  | GalleryViewSettings
  | ListViewSettings
  | FeedViewSettings
  | CalendarViewSettings;

/**
 * Sort order options for grouped rows
 */
export const groupSortOrders = ["asc", "desc", "count-asc", "count-desc"] as const;
export type GroupSortOrder = (typeof groupSortOrders)[number];

/**
 * Group configuration for table/list view grouping (Notion-style)
 */
export type GroupConfig = {
  /** Column ID to group by */
  columnId: string;
  /** Sort order for groups */
  sortOrder: GroupSortOrder;
  /** Whether to hide empty groups */
  hideEmpty: boolean;
  /** Group values to hide */
  hiddenGroups: string[];
  /** Group values that are collapsed */
  collapsedGroups: string[];
};

/**
 * View configuration
 */
export type ViewConfig<TSettings extends ViewSettings = ViewSettings> = {
  id: string;
  type: ViewType;
  name: string;
  icon: LucideIcon;
  settings: TSettings;
};

/**
 * Relation/Reference field configuration
 * Similar to Notion's relation properties
 */
export type RelationConfig = {
  /** Target table/collection name */
  targetTable: string;
  /** Field to display from related record (e.g., "name", "title") */
  displayField: string;
  /** Field that contains the relation ID(s) */
  relationField?: string;
  /** Whether this is a multi-select relation */
  multiple?: boolean;
  /** Optional function to fetch related records */
  fetchRelated?: (ids: string | string[]) => Promise<Record<string, unknown>[]>;
  /** Optional function to search related records */
  searchRelated?: (query: string) => Promise<Record<string, unknown>[]>;
};

/**
 * Extended column definition with visibility and order
 * Uses intersection type to combine with TanStack Table's ColumnDef
 */
export type DataTableColumn<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  id: string;
  visible?: boolean;
  order?: number;
  filterOperator?: FilterOperator;
  enableFiltering?: boolean;
  enableSorting?: boolean;
  pinned?: "left" | "right" | false;
  /** Relation/reference field configuration */
  relation?: RelationConfig;
};

/**
 * Batch action configuration with error handling and loading states
 */
export type BatchAction<TData> = {
  /** Unique action identifier */
  action: string;
  /** Button label */
  label: string;
  /** Optional icon */
  icon?: LucideIcon;
  /** Button variant */
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  /** Action handler - can be async */
  onClick: (selectedRows: TData[]) => void | Promise<void>;
  /** Optional disable condition */
  isDisabled?: (selectedRows: TData[]) => boolean;
  /** Custom loading text during execution */
  loadingText?: string;
  /** Success message to show after completion */
  successMessage?: string;
  /** Custom error handler */
  onError?: (error: unknown, selectedRows: TData[]) => void;
};

/**
 * Main data table state
 */
export type DataTableState<TData> = {
  activeView: ViewConfig;
  availableViews: ViewConfig[];
  columns: DataTableColumn<TData>[];
  filterGroups: FilterGroup[];
  sorting: SortingState;
  columnVisibility: VisibilityState;
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  rowSelection: RowSelectionState;
};

/**
 * Operator configuration for filters
 */
export type FilterOperatorConfig = {
  value: FilterOperator;
  label: string;
  description: string;
  inputType: "text" | "number" | "date" | "select" | "multiselect" | "none";
  availableFor: Array<"string" | "number" | "date" | "boolean">;
};
