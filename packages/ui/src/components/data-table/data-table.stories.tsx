import type { Meta, StoryObj } from "@storybook/react-vite";
import { cn } from "../../utils";
import { DataTable } from "./data-table";
import type { DataTableColumn } from "./types";

// Sample data types
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "pending";
  age: number;
  department: string;
};

const meta: Meta<typeof DataTable<User>> = {
  title: "composite/Datatable/DataTable",
  component: DataTable<User>,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Generate sample data
const generateUsers = (count: number): User[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `user-${i + 1}`,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: ["Admin", "Editor", "Viewer"][i % 3]!,
    status: ["active", "inactive", "pending"][i % 3] as User["status"],
    age: 25 + (i % 40),
    department: ["Engineering", "Design", "Marketing", "Sales"][i % 4]!,
  }));

// Sample columns
const userColumns: DataTableColumn<User>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Name",
    enableSorting: true,
    enableFiltering: true,
  },
  {
    id: "email",
    accessorKey: "email",
    header: "Email",
    enableSorting: true,
    enableFiltering: true,
  },
  {
    id: "role",
    accessorKey: "role",
    header: "Role",
    enableSorting: true,
    enableFiltering: true,
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    enableFiltering: true,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const colors = {
        active: "bg-green-100 text-green-800",
        inactive: "bg-gray-100 text-gray-800",
        pending: "bg-yellow-100 text-yellow-800",
      };
      return (
        <span
          className={cn(
            "inline-flex rounded-full px-2 py-1 font-semibold text-xs",
            colors[status as keyof typeof colors],
          )}
        >
          {status}
        </span>
      );
    },
  },
  {
    id: "age",
    accessorKey: "age",
    header: "Age",
    enableSorting: true,
  },
  {
    id: "department",
    accessorKey: "department",
    header: "Department",
    enableSorting: true,
    enableFiltering: true,
  },
];

/**
 * Default DataTable with all features enabled.
 * Shows table view with 50 users.
 */
export const Default: Story = {
  args: {
    data: generateUsers(50),
    columns: userColumns,
    defaultView: "table",
    enableSearch: true,
    enableFiltering: true,
    enableSorting: true,
    enablePagination: true,
    enableViewSwitcher: true,
  },
};

/**
 * DataTable with small dataset (10 users).
 * Demonstrates table with minimal pagination.
 */
export const SmallDataset: Story = {
  args: {
    data: generateUsers(10),
    columns: userColumns,
    defaultView: "table",
  },
};

/**
 * DataTable with large dataset (500 users).
 * Demonstrates pagination with many pages.
 */
export const LargeDataset: Story = {
  args: {
    data: generateUsers(500),
    columns: userColumns,
    defaultView: "table",
    pageSize: 20,
  },
};

/**
 * DataTable with empty state.
 * Shows empty state message when no data.
 */
export const EmptyState: Story = {
  args: {
    data: [],
    columns: userColumns,
    emptyStateMessage: "No users found. Try adjusting your search or filters.",
  },
};

/**
 * DataTable in loading state.
 * Shows skeleton loaders while data is loading.
 */
export const LoadingState: Story = {
  args: {
    data: generateUsers(50),
    columns: userColumns,
    isLoading: true,
  },
};

/**
 * DataTable with row click handler.
 * Click on any row to see console output.
 */
export const WithRowClick: Story = {
  args: {
    data: generateUsers(20),
    columns: userColumns,
    onRowClick: (row: User) => {
      console.log(`Clicked user: ${row.name} (${row.email})`);
    },
  },
};

/**
 * DataTable with search disabled.
 * No global search input in toolbar.
 */
export const NoSearch: Story = {
  args: {
    data: generateUsers(50),
    columns: userColumns,
    enableSearch: false,
  },
};

/**
 * DataTable with filtering disabled.
 * No filter button in toolbar.
 */
export const NoFiltering: Story = {
  args: {
    data: generateUsers(50),
    columns: userColumns,
    enableFiltering: false,
  },
};

/**
 * DataTable with sorting disabled.
 * No sort button in toolbar.
 */
export const NoSorting: Story = {
  args: {
    data: generateUsers(50),
    columns: userColumns,
    enableSorting: false,
  },
};

/**
 * DataTable with pagination disabled.
 * All rows shown in single page.
 */
export const NoPagination: Story = {
  args: {
    data: generateUsers(20),
    columns: userColumns,
    enablePagination: false,
  },
};

/**
 * DataTable with view switcher disabled.
 * Only shows table view, no view switching.
 */
export const NoViewSwitcher: Story = {
  args: {
    data: generateUsers(50),
    columns: userColumns,
    enableViewSwitcher: false,
  },
};

/**
 * DataTable with limited views.
 * Only table and list views available.
 */
export const LimitedViews: Story = {
  args: {
    data: generateUsers(50),
    columns: userColumns,
    enabledViews: ["table", "list"],
  },
};

/**
 * DataTable with board view as default.
 * Opens with board (kanban) view.
 * Note: Board view is not implemented yet, shows placeholder.
 */
export const BoardViewDefault: Story = {
  args: {
    data: generateUsers(50),
    columns: userColumns,
    defaultView: "board",
  },
};

/**
 * DataTable with custom page size.
 * Shows 25 rows per page by default.
 */
export const CustomPageSize: Story = {
  args: {
    data: generateUsers(100),
    columns: userColumns,
    pageSize: 25,
    pageSizeOptions: [25, 50, 75, 100],
  },
};

/**
 * DataTable with custom search placeholder.
 */
export const CustomSearchPlaceholder: Story = {
  args: {
    data: generateUsers(50),
    columns: userColumns,
    searchPlaceholder: "Search users by name, email, or role...",
  },
};

/**
 * DataTable with minimal features.
 * Only table view with basic display, no search/filter/sort.
 */
export const MinimalFeatures: Story = {
  args: {
    data: generateUsers(20),
    columns: userColumns,
    enableSearch: false,
    enableFiltering: false,
    enableSorting: false,
    enablePagination: false,
    enableViewSwitcher: false,
  },
};

/**
 * DataTable with all views enabled.
 * Can switch between all 5 view types.
 */
export const AllViews: Story = {
  args: {
    data: generateUsers(50),
    columns: userColumns,
    enabledViews: ["table", "board", "gallery", "list", "feed"],
    boardGroupByColumn: "status",
    galleryGridCols: 3,
    feedTimestampColumn: "id",
  },
};

/**
 * Board view (Kanban) grouped by status.
 * Cards organized in columns by status value.
 */
export const BoardView: Story = {
  args: {
    data: generateUsers(30),
    columns: userColumns,
    defaultView: "board",
    enabledViews: ["board"],
    boardGroupByColumn: "status",
    enablePagination: false,
  },
};

/**
 * Gallery view with 3 columns.
 * Card-based grid layout.
 */
export const GalleryView: Story = {
  args: {
    data: generateUsers(24),
    columns: userColumns,
    defaultView: "gallery",
    enabledViews: ["gallery"],
    galleryGridCols: 3,
    galleryCompactCards: false,
  },
};

/**
 * Gallery view compact with 4 columns.
 * Denser card layout.
 */
export const GalleryViewCompact: Story = {
  args: {
    data: generateUsers(32),
    columns: userColumns,
    defaultView: "gallery",
    enabledViews: ["gallery"],
    galleryGridCols: 4,
    galleryCompactCards: true,
  },
};

/**
 * List view with dividers.
 * Compact list layout for quick scanning.
 */
export const ListView: Story = {
  args: {
    data: generateUsers(25),
    columns: userColumns,
    defaultView: "list",
    enabledViews: ["list"],
    listShowDividers: true,
    listCompactSpacing: false,
  },
};

/**
 * List view compact without dividers.
 * Even denser layout.
 */
export const ListViewCompact: Story = {
  args: {
    data: generateUsers(25),
    columns: userColumns,
    defaultView: "list",
    enabledViews: ["list"],
    listShowDividers: false,
    listCompactSpacing: true,
  },
};

/**
 * Feed view with timestamps.
 * Chronological feed layout.
 */
export const FeedView: Story = {
  args: {
    data: generateUsers(15),
    columns: userColumns,
    defaultView: "feed",
    enabledViews: ["feed"],
    feedTimestampColumn: "id",
    feedShowTimestamps: true,
  },
};

/**
 * DataTable with row selection enabled.
 * Click checkboxes to select rows. Select all checkbox in header.
 */
export const WithSelection: Story = {
  args: {
    data: generateUsers(50),
    columns: userColumns,
    enableSelection: true,
    onSelectionChange: (selectedRows: User[]) => {
      console.log(`Selected ${selectedRows.length} rows:`, selectedRows);
    },
  },
};

/**
 * DataTable with selection and default batch actions.
 * Shows Delete, Export, and Bulk Edit buttons when rows are selected.
 */
export const WithSelectionAndBatchActions: Story = {
  args: {
    data: generateUsers(50),
    columns: userColumns,
    enableSelection: true,
    showDefaultBatchActions: true,
    onBatchDelete: async (selectedRows: User[]) => {
      console.log(
        `Deleting ${selectedRows.length} users:`,
        selectedRows.map((u) => u.name),
      );
      console.log(`Would delete ${selectedRows.length} users`);
    },
    onBatchExport: async (selectedRows: User[]) => {
      console.log(`Exporting ${selectedRows.length} users to CSV`);
      console.log(`Would export ${selectedRows.length} users to CSV`);
    },
    onBatchEdit: async (selectedRows: User[]) => {
      console.log(`Bulk editing ${selectedRows.length} users`);
      console.log(`Would open bulk edit modal for ${selectedRows.length} users`);
    },
  },
};

/**
 * DataTable with selection and custom batch actions.
 * Shows custom Archive and Email actions instead of defaults.
 */
export const WithCustomBatchActions: Story = {
  args: {
    data: generateUsers(50),
    columns: userColumns,
    enableSelection: true,
    showDefaultBatchActions: false,
    batchActions: [
      {
        action: "archive",
        label: "Archive",
        variant: "outline",
        onClick: async (selectedRows: User[]) => {
          console.log(`Archiving ${selectedRows.length} users`);
          console.log(`Would archive ${selectedRows.length} users`);
        },
      },
      {
        action: "email",
        label: "Send Email",
        variant: "default",
        onClick: async (selectedRows: User[]) => {
          console.log(`Sending email to ${selectedRows.length} users`);
          console.log(`Would send email to ${selectedRows.length} users`);
        },
      },
      {
        action: "change-role",
        label: "Change Role",
        variant: "secondary",
        onClick: async (selectedRows: User[]) => {
          console.log(`Changing role for ${selectedRows.length} users`);
          console.log(`Would change role for ${selectedRows.length} users`);
        },
        isDisabled: (selectedRows: User[]) => selectedRows.some((u) => u.role === "Admin"),
      },
    ],
  },
};

/**
 * DataTable with selection and mixed batch actions.
 * Shows both default and custom batch actions.
 */
export const WithMixedBatchActions: Story = {
  args: {
    data: generateUsers(50),
    columns: userColumns,
    enableSelection: true,
    showDefaultBatchActions: true,
    onBatchDelete: async (selectedRows: User[]) => {
      console.log(`Would delete ${selectedRows.length} users`);
    },
    onBatchExport: async (selectedRows: User[]) => {
      console.log(`Would export ${selectedRows.length} users`);
    },
    batchActions: [
      {
        action: "archive",
        label: "Archive",
        variant: "outline",
        onClick: async (selectedRows: User[]) => {
          console.log(`Would archive ${selectedRows.length} users`);
        },
      },
    ],
  },
};

/**
 * DataTable with selection and pagination.
 * Demonstrates selection across multiple pages.
 * Try selecting rows, then changing pages to see selection persistence.
 */
export const SelectionWithPagination: Story = {
  args: {
    data: generateUsers(100),
    columns: userColumns,
    enableSelection: true,
    enablePagination: true,
    pageSize: 10,
    showDefaultBatchActions: true,
    onBatchDelete: async (selectedRows: User[]) => {
      console.log(`Would delete ${selectedRows.length} users across all pages`);
    },
  },
};

/**
 * DataTable with selection only (no batch actions).
 * Useful for scenarios where you just want selection state without actions.
 */
export const SelectionOnly: Story = {
  args: {
    data: generateUsers(30),
    columns: userColumns,
    enableSelection: true,
    showDefaultBatchActions: false,
    onSelectionChange: (selectedRows: User[]) => {
      console.log(`Current selection: ${selectedRows.length} rows`);
    },
  },
};

/**
 * DataTable with advanced filtering enabled.
 * Shows the "Advanced Filter" button in the toolbar.
 * Click it to open the filter builder with nested groups and AND/OR logic.
 */
export const WithAdvancedFiltering: Story = {
  args: {
    data: generateUsers(50),
    columns: userColumns,
    enableAdvancedFiltering: true,
    enableFiltering: true,
    onAdvancedFiltersChange: (filters) => {
      console.log("Advanced filters changed:", filters);
    },
  },
};

/**
 * DataTable with only advanced filtering (no simple filter).
 * Use case: When you want to offer only the advanced filter experience.
 */
export const AdvancedFilteringOnly: Story = {
  args: {
    data: generateUsers(50),
    columns: userColumns,
    enableAdvancedFiltering: true,
    enableFiltering: false,
    onAdvancedFiltersChange: (filters) => {
      console.log("Advanced filters changed:", filters);
    },
  },
};

/**
 * DataTable with both simple and advanced filtering.
 * Shows both "Filter" and "Advanced Filter" buttons.
 * Use simple filters for quick, single-condition filters.
 * Use advanced filters for complex, nested conditions.
 */
export const BothFilterModes: Story = {
  args: {
    data: generateUsers(100),
    columns: userColumns,
    enableFiltering: true,
    enableAdvancedFiltering: true,
    onFiltersChange: (filters) => {
      console.log("Simple filters changed:", filters);
    },
    onAdvancedFiltersChange: (filters) => {
      console.log("Advanced filters changed:", filters);
    },
  },
};
