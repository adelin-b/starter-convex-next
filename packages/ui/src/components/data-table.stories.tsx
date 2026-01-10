import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { cn } from "../utils";
import { Badge } from "./badge";
import { Button } from "./button";
import { DataTable, DataTableColumnHeader } from "./data-table";
import { Input } from "./input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

/**
 * DataTable component with sorting, filtering, and pagination.
 */
const meta: Meta<typeof DataTable> = {
  title: "domain/DataTable",
  component: DataTable,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof DataTable>;

export default meta;

type Story = StoryObj<typeof meta>;

// Sample data types
type Agent = {
  id: string;
  name: string;
  status: "active" | "inactive" | "draft";
  calls: number;
  successRate: number;
  createdAt: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member" | "viewer";
  lastActive: string;
};

// Sample agent data
const agentData: Agent[] = [
  {
    id: "1",
    name: "Customer Support Bot",
    status: "active",
    calls: 1234,
    successRate: 94.2,
    createdAt: "2025-01-15",
  },
  {
    id: "2",
    name: "Sales Assistant",
    status: "active",
    calls: 856,
    successRate: 89.7,
    createdAt: "2025-01-10",
  },
  {
    id: "3",
    name: "Tech Support Agent",
    status: "inactive",
    calls: 432,
    successRate: 91.5,
    createdAt: "2024-12-20",
  },
  {
    id: "4",
    name: "Appointment Scheduler",
    status: "draft",
    calls: 0,
    successRate: 0,
    createdAt: "2025-01-20",
  },
  {
    id: "5",
    name: "Order Tracker",
    status: "active",
    calls: 2145,
    successRate: 96.8,
    createdAt: "2024-11-05",
  },
];

// Sample user data
const userData: User[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "admin",
    lastActive: "2025-01-20",
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@example.com",
    role: "member",
    lastActive: "2025-01-19",
  },
  {
    id: "3",
    name: "Carol Williams",
    email: "carol@example.com",
    role: "viewer",
    lastActive: "2025-01-18",
  },
];

// Agent table columns
const agentColumns: ColumnDef<Agent>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      let variant: "default" | "secondary" | "outline" = "outline";
      if (status === "active") {
        variant = "default";
      } else if (status === "inactive") {
        variant = "secondary";
      }
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: "calls",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total Calls" />,
    cell: ({ row }) => <div className="text-right">{row.getValue("calls")}</div>,
  },
  {
    accessorKey: "successRate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Success Rate" />,
    cell: ({ row }) => {
      const rate = row.getValue("successRate") as number;
      return <div className="text-right">{rate}%</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
];

// User table columns
const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
  },
  {
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
  },
  {
    accessorKey: "role",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return <Badge variant="outline">{role}</Badge>;
    },
  },
  {
    accessorKey: "lastActive",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last Active" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue("lastActive"));
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
];

/**
 * Default data table with agents.
 */
export const Default: Story = {
  render: () => <DataTable columns={agentColumns} data={agentData} />,
};

/**
 * Data table with users data.
 */
export const UsersTable: Story = {
  render: () => <DataTable columns={userColumns} data={userData} />,
};

/**
 * Empty state.
 */
export const Empty: Story = {
  render: () => <DataTable columns={agentColumns} data={[]} />,
};

/**
 * With row click handler.
 */
export const WithRowClick: Story = {
  render: () => {
    const [selected, setSelected] = useState<Agent | null>(null);

    return (
      <div className="space-y-4">
        <DataTable columns={agentColumns} data={agentData} onRowClick={(row) => setSelected(row)} />
        {selected && (
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold text-sm">Selected Agent</h3>
            <p className="text-muted-foreground text-sm">
              {selected.name} - {selected.status}
            </p>
          </div>
        )}
      </div>
    );
  },
};

/**
 * With column visibility toggle.
 */
export const WithColumnVisibility: Story = {
  render: () => {
    const columnsWithActions: ColumnDef<Agent>[] = [
      ...agentColumns,
      {
        id: "actions",
        cell: () => (
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline">
              Edit
            </Button>
            <Button size="sm" variant="destructive">
              Delete
            </Button>
          </div>
        ),
      },
    ];

    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          {/* This would need access to the table instance */}
          <p className="text-muted-foreground text-sm">
            Use DataTableViewOptions component with table instance
          </p>
        </div>
        <DataTable columns={columnsWithActions} data={agentData} />
      </div>
    );
  },
};

/**
 * Large dataset (many rows).
 */
export const LargeDataset: Story = {
  render: () => {
    // Constants for data generation
    const STATUS_COUNT = 3;
    const MAX_CALLS = 3000;
    const SUCCESS_RATE_RANGE = 30;
    const MIN_SUCCESS_RATE = 70;
    const YEAR = 2024;
    const MONTHS_IN_YEAR = 12;
    const MAX_DAYS_IN_MONTH = 28;

    // Generate 50 rows
    const largeData: Agent[] = Array.from({ length: 50 }, (_, i) => ({
      id: String(i + 1),
      name: `Agent ${i + 1}`,
      status: ["active", "inactive", "draft"][
        Math.floor(Math.random() * STATUS_COUNT)
      ] as Agent["status"],
      calls: Math.floor(Math.random() * MAX_CALLS),
      successRate: Math.floor(Math.random() * SUCCESS_RATE_RANGE) + MIN_SUCCESS_RATE,
      createdAt: new Date(
        YEAR,
        Math.floor(Math.random() * MONTHS_IN_YEAR),
        Math.floor(Math.random() * MAX_DAYS_IN_MONTH) + 1,
      ).toISOString(),
    }));

    return <DataTable columns={agentColumns} data={largeData} />;
  },
};

/**
 * With custom actions column.
 */
export const WithActions: Story = {
  render: () => {
    const columnsWithActions: ColumnDef<Agent>[] = [
      ...agentColumns,
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button onClick={() => console.log("Edit", row.original)} size="sm" variant="outline">
              Edit
            </Button>
            <Button
              onClick={() => console.log("Delete", row.original)}
              size="sm"
              variant="destructive"
            >
              Delete
            </Button>
          </div>
        ),
      },
    ];

    return <DataTable columns={columnsWithActions} data={agentData} />;
  },
};

/**
 * Minimal columns (ID and name only).
 */
export const MinimalColumns: Story = {
  render: () => {
    const minimalColumns: ColumnDef<Agent>[] = [
      {
        accessorKey: "id",
        header: "ID",
      },
      {
        accessorKey: "name",
        header: "Name",
      },
    ];

    return <DataTable columns={minimalColumns} data={agentData} />;
  },
};

/**
 * With custom cell rendering.
 */
export const CustomCellRendering: Story = {
  render: () => {
    const customColumns: ColumnDef<Agent>[] = [
      {
        accessorKey: "name",
        header: "Agent",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
              <span className="font-medium text-primary text-xs">
                {row.getValue<string>("name").charAt(0)}
              </span>
            </div>
            <div>
              <div className="font-medium">{row.getValue("name")}</div>
              <div className="text-muted-foreground text-xs">ID: {row.original.id}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          let statusColor = "bg-yellow-500";
          if (status === "active") {
            statusColor = "bg-green-500";
          } else if (status === "inactive") {
            statusColor = "bg-gray-400";
          }
          return (
            <div className="flex items-center gap-2">
              <div className={cn("size-2 rounded-full", statusColor)} />
              <span className="capitalize">{status}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "calls",
        header: "Performance",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.getValue("calls")} calls</div>
            <div className="text-muted-foreground text-xs">{row.original.successRate}% success</div>
          </div>
        ),
      },
    ];

    return <DataTable columns={customColumns} data={agentData} />;
  },
};

// ============================================================================
// Server-Side Filtering Stories (Item DataTable)
// ============================================================================

// Item data type (generic example for any SaaS)
type Item = {
  _id: string;
  name: string;
  category: "basic" | "standard" | "premium" | "enterprise";
  status: "active" | "inactive" | "draft";
  price: number;
  date: string;
};

// Mock item data generator
const itemNames = [
  "Acme Widget",
  "Acme Pro",
  "Widget Basic",
  "Widget Plus",
  "Gadget Starter",
  "Gadget Pro",
  "Service Basic",
  "Service Premium",
  "Tool Standard",
  "Tool Enterprise",
];
const categories = ["basic", "standard", "premium", "enterprise"] as const;
const itemStatuses = ["active", "inactive", "draft"] as const;

function generateMockItems(count: number): Item[] {
  return Array.from({ length: count }, (_, i) => {
    const BASE_PRICE = 10;
    const PRICE_RANGE = 990;
    const DAYS_OFFSET = 365;
    const MS_PER_DAY = 86_400_000;
    return {
      _id: `item-${i + 1}`,
      name: itemNames[i % itemNames.length],
      category: categories[i % categories.length],
      status: itemStatuses[i % itemStatuses.length],
      price: BASE_PRICE + Math.floor(Math.random() * PRICE_RANGE),
      date: new Date(Date.now() - Math.floor(Math.random() * DAYS_OFFSET) * MS_PER_DAY)
        .toISOString()
        .split("T")[0],
    };
  });
}

const mockItems = generateMockItems(50);

// Filter types (for server-side filtering)
type FilterOperator = "eq" | "contains" | "gte" | "lte" | "in";

type FieldFilter = {
  field: string;
  operator: FilterOperator;
  value: unknown;
};

// Client-side filter simulation (mimics server behavior)
function applyItemFilters(data: Item[], filters: FieldFilter[]): Item[] {
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Filter simulation requires handling multiple operators
  return data.filter((item) => {
    for (const f of filters) {
      const fieldValue = item[f.field as keyof Item];

      switch (f.operator) {
        case "eq":
          if (fieldValue !== f.value) {
            return false;
          }
          break;
        case "contains":
          if (
            typeof fieldValue !== "string" ||
            !fieldValue.toLowerCase().includes(String(f.value).toLowerCase())
          ) {
            return false;
          }
          break;
        case "gte":
          if (typeof fieldValue !== "number" || fieldValue < (f.value as number)) {
            return false;
          }
          break;
        case "lte":
          if (typeof fieldValue !== "number" || fieldValue > (f.value as number)) {
            return false;
          }
          break;
        case "in":
          if (!(Array.isArray(f.value) && f.value.includes(fieldValue))) {
            return false;
          }
          break;
        default:
          // Unknown operator - skip filter
          break;
      }
    }
    return true;
  });
}

function applyItemSort(data: Item[], sortField?: string, sortDirection?: "asc" | "desc"): Item[] {
  if (!sortField) {
    return data;
  }

  return [...data].sort((a, b) => {
    const aVal = a[sortField as keyof Item];
    const bVal = b[sortField as keyof Item];
    if (aVal === bVal) {
      return 0;
    }
    if (aVal === undefined) {
      return 1;
    }
    if (bVal === undefined) {
      return -1;
    }
    const comparison = aVal < bVal ? -1 : 1;
    return sortDirection === "desc" ? -comparison : comparison;
  });
}

// Item columns with server-side sort support
const itemColumns: ColumnDef<Item>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
  },
  {
    accessorKey: "category",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
    cell: ({ row }) => {
      const category = row.getValue("category") as Item["category"];
      const variantMap: Record<Item["category"], "default" | "secondary" | "destructive"> = {
        basic: "secondary",
        standard: "default",
        premium: "default",
        enterprise: "destructive",
      };
      return <Badge variant={variantMap[category]}>{category}</Badge>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Item["status"];
      const variantMap: Record<Item["status"], "default" | "secondary" | "destructive"> = {
        active: "default",
        inactive: "secondary",
        draft: "secondary",
      };
      return <Badge variant={variantMap[status]}>{status}</Badge>;
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
    cell: ({ row }) => {
      const price = row.getValue("price") as number;
      return `$${price}`;
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"));
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
];

// Item toolbar component
type ItemToolbarProps = {
  filters: FieldFilter[];
  onAddFilter: (filter: FieldFilter) => void;
  onRemoveFilter: (field: string, operator?: FilterOperator) => void;
  onClearFilters: () => void;
};

function ItemToolbar({ filters, onAddFilter, onRemoveFilter, onClearFilters }: ItemToolbarProps) {
  const [searchValue, setSearchValue] = useState("");
  const [statusValue, setStatusValue] = useState<string>("");
  const [categoryValue, setCategoryValue] = useState<string>("");

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (value) {
      onRemoveFilter("name", "contains");
      onAddFilter({ field: "name", operator: "contains", value });
    } else {
      onRemoveFilter("name", "contains");
    }
  };

  const handleStatusChange = (value: string | null) => {
    if (value === null) {
      return;
    }
    setStatusValue(value);
    onRemoveFilter("status", "eq");
    if (value && value !== "all") {
      onAddFilter({ field: "status", operator: "eq", value });
    }
  };

  const handleCategoryChange = (value: string | null) => {
    if (value === null) {
      return;
    }
    setCategoryValue(value);
    onRemoveFilter("category", "eq");
    if (value && value !== "all") {
      onAddFilter({ field: "category", operator: "eq", value });
    }
  };

  const handleClear = () => {
    setSearchValue("");
    setStatusValue("");
    setCategoryValue("");
    onClearFilters();
  };

  const hasActiveFilters = filters.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        className="w-[200px]"
        data-testid="item-search-input"
        onChange={(e) => handleSearchChange(e.target.value)}
        placeholder="Search by name..."
        value={searchValue}
      />
      <Select
        data-testid="item-status-select"
        onValueChange={handleStatusChange}
        value={statusValue}
      >
        <SelectTrigger className="w-[150px]" data-testid="status-trigger">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
        </SelectContent>
      </Select>
      <Select
        data-testid="item-category-select"
        onValueChange={handleCategoryChange}
        value={categoryValue}
      >
        <SelectTrigger className="w-[150px]" data-testid="category-trigger">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="basic">Basic</SelectItem>
          <SelectItem value="standard">Standard</SelectItem>
          <SelectItem value="premium">Premium</SelectItem>
          <SelectItem value="enterprise">Enterprise</SelectItem>
        </SelectContent>
      </Select>
      {hasActiveFilters && (
        <Button data-testid="clear-filters-btn" onClick={handleClear} size="sm" variant="ghost">
          <X className="mr-1 size-4" />
          Clear filters
        </Button>
      )}
    </div>
  );
}

// Wrapper that simulates useItemFilters without Convex
type ItemsDataTableWrapperProps = {
  isLoading?: boolean;
  showToolbar?: boolean;
  initialData?: Item[];
};

function ItemsDataTableWrapper({
  isLoading = false,
  showToolbar = true,
  initialData = mockItems,
}: ItemsDataTableWrapperProps) {
  const [filters, setFilters] = useState<FieldFilter[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  // Simulate server-side processing
  const processedData = useMemo(() => {
    let result = applyItemFilters(initialData, filters);
    if (sorting.length > 0) {
      const [sort] = sorting;
      result = applyItemSort(result, sort.id, sort.desc ? "desc" : "asc");
    }
    return result;
  }, [initialData, filters, sorting]);

  const addFilter = useCallback((filter: FieldFilter) => {
    setFilters((prev) => [...prev, filter]);
  }, []);

  const removeFilter = useCallback((field: string, operator?: FilterOperator) => {
    setFilters((prev) =>
      prev.filter(
        (f) => !(f.field === field && (operator === undefined || f.operator === operator)),
      ),
    );
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
  }, []);

  const handleSortingChange = useCallback((newSorting: SortingState) => {
    setSorting(newSorting);
  }, []);

  return (
    <div className="space-y-4">
      <DataTable
        columns={itemColumns}
        data={processedData}
        isLoading={isLoading}
        manualFiltering
        manualSorting
        onSortingChange={handleSortingChange}
        toolbar={
          showToolbar ? (
            <ItemToolbar
              filters={filters}
              onAddFilter={addFilter}
              onClearFilters={clearFilters}
              onRemoveFilter={removeFilter}
            />
          ) : undefined
        }
      />
      <div
        className="rounded-md border p-4 text-muted-foreground text-sm"
        data-testid="filter-debug-panel"
      >
        <p>
          <strong>Active Filters:</strong>{" "}
          <span data-testid="active-filters">
            {filters.length === 0
              ? "None"
              : filters.map((f) => `${f.field} ${f.operator} "${f.value}"`).join(", ")}
          </span>
        </p>
        <p>
          <strong>Sort:</strong>{" "}
          <span data-testid="active-sort">
            {sorting.length === 0 ? "None" : `${sorting[0].id} ${sorting[0].desc ? "DESC" : "ASC"}`}
          </span>
        </p>
        <p>
          <strong>Results:</strong>{" "}
          <span data-testid="results-count">{processedData.length} items</span>
        </p>
      </div>
    </div>
  );
}

/**
 * Server-side filtered item data table.
 * Demonstrates manual filtering/sorting modes that work with backend queries.
 */
export const ServerSideFiltering: Story = {
  render: () => <ItemsDataTableWrapper />,
};

/**
 * Server-side filtering in loading state.
 */
export const ServerSideLoading: Story = {
  render: () => <ItemsDataTableWrapper isLoading />,
};

/**
 * Server-side filtering without toolbar.
 */
export const ServerSideNoToolbar: Story = {
  render: () => <ItemsDataTableWrapper showToolbar={false} />,
};

/**
 * Server-side filtering with empty results.
 */
export const ServerSideEmpty: Story = {
  render: () => <ItemsDataTableWrapper initialData={[]} />,
};

/**
 * Interactive demo with usage instructions.
 */
export const ServerSideInteractiveDemo: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="rounded-md bg-muted p-4">
        <h3 className="mb-2 font-semibold">Server-Side Filtering Demo</h3>
        <ol className="list-inside list-decimal space-y-1 text-sm">
          <li>Search by name (e.g., "Acme", "Widget")</li>
          <li>Filter by status or category dropdowns</li>
          <li>Click column headers to sort (simulated server-side)</li>
          <li>Watch the debug panel below for filter/sort state</li>
        </ol>
      </div>
      <ItemsDataTableWrapper />
    </div>
  ),
};
