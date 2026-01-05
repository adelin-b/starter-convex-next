import { Calendar, LayoutGrid, List, Newspaper, Table2, Trello } from "lucide-react";
import type {
  BoardViewSettings,
  CalendarViewSettings,
  FeedViewSettings,
  FilterOperatorConfig,
  GalleryViewSettings,
  ListViewSettings,
  TableViewSettings,
  ViewConfig,
} from "./types";

/**
 * Default settings for table view
 */
export const DEFAULT_TABLE_SETTINGS: TableViewSettings = {
  enableSorting: true,
  enableSelection: true,
  enablePagination: true,
  enableRowHover: true,
  denseMode: false,
} as const;

/**
 * Default settings for board view
 */
export const DEFAULT_BOARD_SETTINGS: BoardViewSettings = {
  groupByColumn: "status",
  enableDragDrop: true,
  showCardCount: true,
  columnWidth: 300,
} as const;

/**
 * Default settings for gallery view
 */
export const DEFAULT_GALLERY_SETTINGS: GalleryViewSettings = {
  cardSize: "medium",
  showPageIcon: true,
  fitImage: false,
  wrapProperties: false,
  cardPreview: "page-content",
  openPagesIn: "center-peek",
  columns: 3,
} as const;

/**
 * Default settings for list view
 */
export const DEFAULT_LIST_SETTINGS: ListViewSettings = {
  showPageIcon: true,
  compactMode: false,
  openPagesIn: "side-peek",
  showProperties: false,
} as const;

/**
 * Default settings for feed view
 */
export const DEFAULT_FEED_SETTINGS: FeedViewSettings = {
  showAuthorByline: true,
  enableReactions: true,
  enableComments: true,
  loadLimit: 10,
  openPagesIn: "center-peek",
  showTimestamps: true,
} as const;

/**
 * Default settings for calendar view
 */
export const DEFAULT_CALENDAR_SETTINGS: CalendarViewSettings = {
  dateColumn: "createdAt",
  titleColumn: "name",
  showEventCount: true,
  maxEventsPerDate: 5,
  defaultView: "month",
} as const;

/**
 * Default view configurations
 */
export const DEFAULT_VIEW_CONFIGS: ViewConfig[] = [
  {
    id: "table",
    type: "table",
    name: "Table",
    icon: Table2,
    settings: DEFAULT_TABLE_SETTINGS,
  },
  {
    id: "board",
    type: "board",
    name: "Board",
    icon: Trello,
    settings: DEFAULT_BOARD_SETTINGS,
  },
  {
    id: "gallery",
    type: "gallery",
    name: "Gallery",
    icon: LayoutGrid,
    settings: DEFAULT_GALLERY_SETTINGS,
  },
  {
    id: "list",
    type: "list",
    name: "List",
    icon: List,
    settings: DEFAULT_LIST_SETTINGS,
  },
  {
    id: "feed",
    type: "feed",
    name: "Feed",
    icon: Newspaper,
    settings: DEFAULT_FEED_SETTINGS,
  },
  {
    id: "calendar",
    type: "calendar",
    name: "Calendar",
    icon: Calendar,
    settings: DEFAULT_CALENDAR_SETTINGS,
  },
] as const;

/**
 * Filter operator configurations
 * Based on Notion's filter system and shadcn's faceted filter patterns
 */
export const FILTER_OPERATORS: FilterOperatorConfig[] = [
  {
    value: "equals",
    label: "Equals",
    description: "Exact match",
    inputType: "text",
    availableFor: ["string", "number", "date", "boolean"],
  },
  {
    value: "notEquals",
    label: "Not equals",
    description: "Does not match",
    inputType: "text",
    availableFor: ["string", "number", "date", "boolean"],
  },
  {
    value: "contains",
    label: "Contains",
    description: "Contains text",
    inputType: "text",
    availableFor: ["string"],
  },
  {
    value: "notContains",
    label: "Does not contain",
    description: "Does not contain text",
    inputType: "text",
    availableFor: ["string"],
  },
  {
    value: "startsWith",
    label: "Starts with",
    description: "Starts with text",
    inputType: "text",
    availableFor: ["string"],
  },
  {
    value: "endsWith",
    label: "Ends with",
    description: "Ends with text",
    inputType: "text",
    availableFor: ["string"],
  },
  {
    value: "greaterThan",
    label: "Greater than",
    description: "Greater than value",
    inputType: "number",
    availableFor: ["number", "date"],
  },
  {
    value: "lessThan",
    label: "Less than",
    description: "Less than value",
    inputType: "number",
    availableFor: ["number", "date"],
  },
  {
    value: "greaterThanOrEqual",
    label: "Greater than or equal",
    description: "Greater than or equal to value",
    inputType: "number",
    availableFor: ["number", "date"],
  },
  {
    value: "lessThanOrEqual",
    label: "Less than or equal",
    description: "Less than or equal to value",
    inputType: "number",
    availableFor: ["number", "date"],
  },
  {
    value: "isEmpty",
    label: "Is empty",
    description: "Field is empty",
    inputType: "none",
    availableFor: ["string", "number", "date"],
  },
  {
    value: "isNotEmpty",
    label: "Is not empty",
    description: "Field has a value",
    inputType: "none",
    availableFor: ["string", "number", "date"],
  },
  {
    value: "isAnyOf",
    label: "Is any of",
    description: "Matches any of the values",
    inputType: "multiselect",
    availableFor: ["string", "number"],
  },
  {
    value: "isNoneOf",
    label: "Is none of",
    description: "Does not match any of the values",
    inputType: "multiselect",
    availableFor: ["string", "number"],
  },
  // Relation-specific operators
  {
    value: "relatedTo",
    label: "Related to",
    description: "Is related to specific record",
    inputType: "select",
    availableFor: ["string", "number"],
  },
  {
    value: "notRelatedTo",
    label: "Not related to",
    description: "Is not related to specific record",
    inputType: "select",
    availableFor: ["string", "number"],
  },
  {
    value: "hasAnyRelation",
    label: "Has any relation",
    description: "Has at least one related record",
    inputType: "none",
    availableFor: ["string", "number"],
  },
  {
    value: "hasNoRelation",
    label: "Has no relation",
    description: "Has no related records",
    inputType: "none",
    availableFor: ["string", "number"],
  },
  {
    value: "relatedToAny",
    label: "Related to any of",
    description: "Is related to any of the specified records",
    inputType: "multiselect",
    availableFor: ["string", "number"],
  },
  {
    value: "relatedToAll",
    label: "Related to all of",
    description: "Is related to all of the specified records",
    inputType: "multiselect",
    availableFor: ["string", "number"],
  },
] as const;

/**
 * Debounce delays (ms)
 */
export const DEBOUNCE_DELAY = {
  SEARCH: 300,
  FILTER: 500,
  RESIZE: 150,
} as const;
