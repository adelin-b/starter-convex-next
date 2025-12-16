import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { generateManyColumns, StoryDebugOutput, sampleUserColumns } from "../story-helpers";
import type { DataTableColumn, FilterGroup } from "../types";
import { FilterButton } from "./filter-button";

// Sample columns for stories - filterable subset
const sampleColumns = sampleUserColumns.filter((col) => col.enableFiltering);

// Many columns for scroll test
const manyColumns = generateManyColumns(20);

// Wrapper component for interactive state
function FilterButtonWrapper({
  columns = sampleColumns as DataTableColumn<unknown>[],
  initialFilters = [],
  showLabel = true,
  className,
  showDebug = true,
}: {
  columns?: DataTableColumn<unknown>[];
  initialFilters?: FilterGroup[];
  showLabel?: boolean;
  className?: string;
  showDebug?: boolean;
}) {
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>(
    initialFilters.length > 0 ? initialFilters : [{ logic: "AND", filters: [] }],
  );

  return (
    <div className="flex flex-col gap-4">
      <FilterButton
        className={className}
        columns={columns}
        filterGroups={filterGroups}
        onFiltersChange={setFilterGroups}
        showLabel={showLabel}
      />

      {showDebug && <StoryDebugOutput data={filterGroups} label="Active Filters" />}
    </div>
  );
}

const meta: Meta<typeof FilterButtonWrapper> = {
  title: "composite/Datatable/FilterButton",
  component: FilterButtonWrapper,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    showDebug: {
      control: "boolean",
      description: "Show debug output with filter state",
    },
    showLabel: {
      control: "boolean",
      description: "Show label text",
    },
  },
  args: {
    showDebug: true,
    showLabel: true,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default FilterButton with filterable columns.
 * Click to open dropdown and add filters.
 */
export const Default: Story = {};

/**
 * FilterButton with active filters showing badge and filter list.
 * The badge displays the count of active filters.
 */
export const WithActiveFilters: Story = {
  args: {
    initialFilters: [
      {
        logic: "AND",
        filters: [
          {
            id: "filter-1",
            column: "name",
            operator: "contains",
            value: "John",
          },
          {
            id: "filter-2",
            column: "email",
            operator: "contains",
            value: "@example.com",
          },
        ],
      },
    ],
  },
};

/**
 * FilterButton with no filterable columns.
 * Shows empty state message.
 */
export const NoFilterableColumns: Story = {
  args: {
    columns: [
      {
        id: "id",
        header: "ID",
        accessorKey: "id",
        enableFiltering: false,
      },
    ],
  },
};

/**
 * FilterButton with many columns to test scroll behavior.
 * The dropdown uses ScrollArea with automatic scroll shadows.
 */
export const ManyColumns: Story = {
  args: {
    columns: manyColumns as DataTableColumn<unknown>[],
  },
};

/**
 * FilterButton in small container (icon only).
 * Label is hidden via container queries.
 */
export const SmallContainer: Story = {
  render: (args) => (
    <div className="w-32">
      <FilterButtonWrapper {...args} className="w-full" />
    </div>
  ),
  args: {
    showDebug: false,
  },
};

/**
 * FilterButton in large container (icon + label).
 * Label is visible via container queries.
 */
export const LargeContainer: Story = {
  render: (args) => (
    <div className="w-96">
      <FilterButtonWrapper {...args} className="w-full" />
    </div>
  ),
  args: {
    showDebug: false,
  },
};

/**
 * FilterButton with label hidden via prop.
 * Always shows icon only regardless of container size.
 */
export const IconOnly: Story = {
  args: {
    showLabel: false,
  },
};
