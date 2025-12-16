/**
 * Centralized labels for DataTable components
 * All user-facing text strings should be translatable
 */

export type DataTableLabels = {
  // Main data table
  loading?: string;
  noResults?: string;
  totalRows?: string;
  clearSearch?: string;
  page?: string;
  of?: string;

  // Pagination
  rowsPerPage?: string;
  previous?: string;
  next?: string;
  rowSelected?: string;
  rowsSelected?: string;

  // Batch actions
  selected?: string;
  clearSelection?: string;
  selectAll?: string;
  rows?: string;

  // Column manager
  columns?: string;
  columnsHidden?: string;
  manageColumns?: string;
  showAll?: string;
  hideAll?: string;
  noColumnsAvailable?: string;
  reorderColumn?: string;
  toggleColumnVisibility?: string;
  pinColumn?: string;

  // Toolbar
  searchPlaceholder?: string;

  // Filter button
  filter?: string;
  filterActive?: string;
  filters?: string;
  filtersDescription?: string;
  noFiltersApplied?: string;
  addFilter?: string;
  clearAll?: string;

  // Filter editor
  selectColumn?: string;
  selectOperator?: string;
  removeFilter?: string;
  enterValue?: string;
  enterNumber?: string;
  selectValue?: string;
  selectValues?: string;
  noOptionsAvailable?: string;

  // Advanced filter
  advancedFilter?: string;
  advancedFilters?: string;
  advancedFiltersDescription?: string;
  addRule?: string;
  addGroup?: string;
  removeGroup?: string;
  and?: string;
  or?: string;
  where?: string;
  whereCondition?: string;
  matchAll?: string;
  matchAny?: string;
  noAdvancedFiltersApplied?: string;
  filterRuleCount?: string;

  // Sort button
  sort?: string;
  sortActive?: string;
  addSort?: string;
  noSortableColumns?: string;
  activeSorts?: string;
  removeSort?: string;
  asc?: string;
  desc?: string;

  // Group button
  group?: string;
  groupBy?: string;
  groupSort?: string;
  groupSortAsc?: string;
  groupSortDesc?: string;
  groupSortCountAsc?: string;
  groupSortCountDesc?: string;
  hideEmptyGroups?: string;
  groups?: string;
  hideAllGroups?: string;
  showAllGroups?: string;
  removeGrouping?: string;
  uncategorized?: string;
  expandGroup?: string;
  collapseGroup?: string;
  formatGroupedBy?: (column: string) => string;
  formatGroupCount?: (count: number) => string;

  // Search input
  search?: string;
  clearSearchLabel?: string;
  loadingSearchResults?: string;

  // Calendar view
  month?: string;
  week?: string;
  day?: string;
  agenda?: string;
  totalEvents?: string;
  view?: string;
  untitled?: string;
  event?: string;

  // Board view
  columnOptions?: string;

  // List/Gallery view
  selectRow?: string;

  // Table view
  selectAllRows?: string;

  // Relation components
  addRelation?: string;
  noRelations?: string;
  loadingRelations?: string;
  removeRelation?: string;
  moreRelations?: string;
  selectedRelations?: string;
  searchRelations?: string;
  noResultsFound?: string;
  searching?: string;

  // Views manager
  views?: string;
  savedViews?: string;
  new?: string;
  createNewView?: string;
  saveCurrentConfig?: string;
  name?: string;
  description?: string;
  descriptionOptional?: string;
  describeView?: string;
  cancel?: string;
  createView?: string;
  noSavedViews?: string;
  applyView?: string;
  setAsDefault?: string;
  unsetAsDefault?: string;
  duplicate?: string;
  delete?: string;
  defaultView?: string;
  manageViews?: string;

  // Batch actions
  success?: string;
  actionFailed?: string;
  failedTo?: string;
  bulkEdit?: string;
  export?: string;

  // Column header separator
  columnSeparator?: string;

  // Placeholders
  viewNamePlaceholder?: string;

  // Formatters (for dynamic text with variables)
  formatMoreRelations?: (count: number) => string;
  formatSelectedCount?: (count: number, isPlural: boolean) => string;
  formatSearchPlaceholder?: (tableName: string) => string;
};

export const defaultDataTableLabels: DataTableLabels = {
  // Main data table
  loading: "Loading...",
  noResults: "No results.",
  totalRows: "total rows",
  clearSearch: "Clear search",
  page: "Page",
  of: "of",

  // Pagination
  rowsPerPage: "Rows per page",
  previous: "Previous",
  next: "Next",
  rowSelected: "row selected",
  rowsSelected: "rows selected",

  // Batch actions
  selected: "selected",
  clearSelection: "Clear selection",
  selectAll: "Select all",
  rows: "rows",

  // Column manager
  columns: "Columns",
  columnsHidden: "hidden",
  manageColumns: "Manage Columns",
  showAll: "Show all",
  hideAll: "Hide all",
  noColumnsAvailable: "No columns available",
  reorderColumn: "Reorder",
  toggleColumnVisibility: "Toggle",
  pinColumn: "Pin",

  // Toolbar
  searchPlaceholder: "Search all columns...",

  // Filter button
  filter: "Filter",
  filterActive: "active",
  filters: "Filters",
  filtersDescription: "Add and configure filters to narrow down your data",
  noFiltersApplied: 'No filters applied. Click "Add filter" to get started.',
  addFilter: "Add filter",
  clearAll: "Clear all",

  // Filter editor
  selectColumn: "Select column...",
  selectOperator: "Select operator...",
  removeFilter: "Remove filter",
  enterValue: "Enter value...",
  enterNumber: "Enter number...",
  selectValue: "Select value...",
  selectValues: "Select values...",
  noOptionsAvailable: "No options available",

  // Advanced filter
  advancedFilter: "Advanced Filter",
  advancedFilters: "Advanced Filters",
  advancedFiltersDescription: "Build complex filter conditions with nested groups",
  addRule: "Add rule",
  addGroup: "Add group",
  removeGroup: "Remove group",
  and: "AND",
  or: "OR",
  where: "Where",
  whereCondition: "where",
  matchAll: "Match all conditions",
  matchAny: "Match any condition",
  noAdvancedFiltersApplied: "No filters applied. Add a rule to get started.",
  filterRuleCount: "rules",

  // Sort button
  sort: "Sort",
  sortActive: "active",
  addSort: "Add Sort",
  noSortableColumns: "No sortable columns",
  activeSorts: "Active Sorts",
  removeSort: "Remove",
  asc: "Asc",
  desc: "Desc",

  // Group button
  group: "Group",
  groupBy: "Group by",
  groupSort: "Sort",
  groupSortAsc: "A → Z",
  groupSortDesc: "Z → A",
  groupSortCountAsc: "Count ↑",
  groupSortCountDesc: "Count ↓",
  hideEmptyGroups: "Hide empty groups",
  groups: "Groups",
  hideAllGroups: "Hide all",
  showAllGroups: "Show all",
  removeGrouping: "Remove grouping",
  uncategorized: "Uncategorized",
  expandGroup: "Expand",
  collapseGroup: "Collapse",
  formatGroupedBy: (column: string) => `Grouped by: ${column}`,
  formatGroupCount: (count: number) => `${count} ${count === 1 ? "item" : "items"}`,

  // Search input
  search: "Search",
  clearSearchLabel: "Clear search",
  loadingSearchResults: "Loading search results...",

  // Calendar view
  month: "Month",
  week: "Week",
  day: "Day",
  agenda: "Agenda",
  totalEvents: "Total events",
  view: "view",
  untitled: "Untitled",
  event: "Event",

  // Board view
  columnOptions: "column options",

  // List/Gallery view
  selectRow: "Select row",

  // Table view
  selectAllRows: "Select all rows",

  // Relation components
  addRelation: "Add relation...",
  noRelations: "No relations",
  loadingRelations: "Loading relations",
  removeRelation: "Remove",
  moreRelations: "more",
  selectedRelations: "selected",
  searchRelations: "Search",
  noResultsFound: "No results found.",
  searching: "Searching...",

  // Views manager
  views: "Views",
  savedViews: "Saved Views",
  new: "New",
  createNewView: "Create New View",
  saveCurrentConfig: "Save the current table configuration as a reusable view.",
  name: "Name",
  description: "Description",
  descriptionOptional: "Description (optional)",
  describeView: "Describe this view...",
  cancel: "Cancel",
  createView: "Create View",
  noSavedViews: "No saved views yet. Create one to save your current table configuration.",
  applyView: "Apply View",
  setAsDefault: "Set as Default",
  unsetAsDefault: "Unset as Default",
  duplicate: "Duplicate",
  delete: "Delete",
  defaultView: "Default:",
  manageViews: "Manage views",

  // Batch actions
  success: "Success",
  actionFailed: "Action Failed",
  failedTo: "Failed to",
  bulkEdit: "Bulk Edit",
  export: "Export",

  // Column header separator
  columnSeparator: ": ",

  // Placeholders
  viewNamePlaceholder: "e.g., Active Users",

  // Formatters (for dynamic text with variables)
  formatMoreRelations: (count: number) => `+${count} more`,
  formatSelectedCount: (count: number, isPlural: boolean) =>
    `${count} ${isPlural ? "rows selected" : "row selected"}`,
  formatSearchPlaceholder: (tableName: string) => `Search ${tableName}`,
};
