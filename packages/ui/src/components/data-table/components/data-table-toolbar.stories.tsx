import type { Meta, StoryObj } from "@storybook/react";
import type { SortingState } from "@tanstack/react-table";
import { useState } from "react";
import { DEFAULT_VIEW_CONFIGS } from "../constants";
import type { DataTableColumn, FilterGroup, ViewConfig } from "../types";
import { DataTableToolbar } from "./data-table-toolbar";

// Sample columns for stories
const sampleColumns: DataTableColumn<{
  name: string;
  email: string;
  role: string;
  status: string;
  age: number;
}>[] = [
  {
    id: "name",
    header: "Name",
    accessorKey: "name",
    enableSorting: true,
    enableFiltering: true,
  },
  {
    id: "email",
    header: "Email",
    accessorKey: "email",
    enableSorting: true,
    enableFiltering: true,
  },
  {
    id: "role",
    header: "Role",
    accessorKey: "role",
    enableSorting: true,
    enableFiltering: true,
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    enableFiltering: true,
  },
  {
    id: "age",
    header: "Age",
    accessorKey: "age",
    enableSorting: true,
  },
];

// Wrapper component for interactive state
function DataTableToolbarWrapper({
  availableViews = DEFAULT_VIEW_CONFIGS,
  showSearch = true,
  showViewSwitcher = true,
  showFilterButton = true,
  showSortButton = true,
  className,
  showDebug = true,
}: {
  availableViews?: ViewConfig[];
  showSearch?: boolean;
  showViewSwitcher?: boolean;
  showFilterButton?: boolean;
  showSortButton?: boolean;
  className?: string;
  showDebug?: boolean;
}) {
  const [activeView, setActiveView] = useState<ViewConfig>(availableViews[0]!);
  const [globalFilter, setGlobalFilter] = useState("");
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([{ logic: "AND", filters: [] }]);
  const [sorting, setSorting] = useState<SortingState>([]);

  return (
    <div className="space-y-4">
      <DataTableToolbar
        activeView={activeView}
        availableViews={availableViews}
        className={className}
        columns={sampleColumns}
        filterGroups={filterGroups}
        globalFilter={globalFilter}
        onFiltersChange={setFilterGroups}
        onGlobalFilterChange={setGlobalFilter}
        onSortingChange={setSorting}
        onViewChange={setActiveView}
        showFilterButton={showFilterButton}
        showSearch={showSearch}
        showSortButton={showSortButton}
        showViewSwitcher={showViewSwitcher}
        sorting={sorting}
      />

      {showDebug && (
        <div className="grid @md:grid-cols-2 gap-2">
          <div className="rounded-md border p-2 text-xs">
            <div className="font-medium">Active View:</div>
            <pre className="mt-1">{activeView.type}</pre>
          </div>
          <div className="rounded-md border p-2 text-xs">
            <div className="font-medium">Search:</div>
            <pre className="mt-1">{globalFilter || "(empty)"}</pre>
          </div>
          <div className="rounded-md border p-2 text-xs">
            <div className="font-medium">Filters:</div>
            <pre className="mt-1 overflow-auto">{filterGroups[0]?.filters.length || 0} active</pre>
          </div>
          <div className="rounded-md border p-2 text-xs">
            <div className="font-medium">Sorts:</div>
            <pre className="mt-1 overflow-auto">{sorting.length} active</pre>
          </div>
        </div>
      )}
    </div>
  );
}

const meta: Meta<typeof DataTableToolbarWrapper> = {
  title: "composite/Datatable/DataTableToolbar",
  component: DataTableToolbarWrapper,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    showDebug: {
      control: "boolean",
      description: "Show debug output with toolbar state",
    },
  },
  args: {
    showDebug: true,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default DataTableToolbar with all controls enabled.
 * Shows view switcher, search, filter, and sort buttons.
 */
export const Default: Story = {};

/**
 * DataTableToolbar with active filters and sorts.
 * Demonstrates toolbar with badges showing active state.
 */
export const WithActiveState: Story = {
  render: () => {
    function ActiveStateStory() {
      const [activeView, setActiveView] = useState<ViewConfig>(DEFAULT_VIEW_CONFIGS[0]!);
      const [globalFilter, setGlobalFilter] = useState("john");
      const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([
        {
          logic: "AND",
          filters: [
            {
              id: "filter-1",
              column: "role",
              operator: "equals",
              value: "admin",
            },
          ],
        },
      ]);
      const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);

      return (
        <DataTableToolbar
          activeView={activeView}
          availableViews={DEFAULT_VIEW_CONFIGS}
          columns={sampleColumns}
          filterGroups={filterGroups}
          globalFilter={globalFilter}
          onFiltersChange={setFilterGroups}
          onGlobalFilterChange={setGlobalFilter}
          onSortingChange={setSorting}
          onViewChange={setActiveView}
          sorting={sorting}
        />
      );
    }
    return <ActiveStateStory />;
  },
};

/**
 * DataTableToolbar with only search enabled.
 * Shows toolbar in minimal configuration.
 */
export const SearchOnly: Story = {
  args: {
    showFilterButton: false,
    showSortButton: false,
    showViewSwitcher: false,
  },
};

/**
 * DataTableToolbar with only view switcher enabled.
 * No search, filter, or sort buttons.
 */
export const ViewSwitcherOnly: Story = {
  args: {
    showFilterButton: false,
    showSearch: false,
    showSortButton: false,
  },
};

/**
 * DataTableToolbar with only action buttons (filter + sort).
 * No search or view switcher.
 */
export const ActionButtonsOnly: Story = {
  args: {
    showSearch: false,
    showViewSwitcher: false,
  },
};

/**
 * DataTableToolbar with limited views.
 * Shows toolbar with only table and board views.
 */
export const LimitedViews: Story = {
  args: {
    availableViews: [DEFAULT_VIEW_CONFIGS[0]!, DEFAULT_VIEW_CONFIGS[1]!],
  },
};

/**
 * DataTableToolbar in narrow container.
 * Demonstrates responsive stacked layout.
 */
export const NarrowContainer: Story = {
  render: (args) => (
    <div className="max-w-sm">
      <DataTableToolbarWrapper {...args} />
    </div>
  ),
  args: {
    showDebug: false,
  },
};

/**
 * DataTableToolbar in wide container.
 * Demonstrates responsive horizontal layout.
 */
export const WideContainer: Story = {
  render: (args) => (
    <div className="w-full max-w-4xl">
      <DataTableToolbarWrapper {...args} />
    </div>
  ),
  args: {
    showDebug: false,
  },
};
