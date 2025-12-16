import type { Meta, StoryObj } from "@storybook/react";
import type { SortingState } from "@tanstack/react-table";
import { useState } from "react";
import { generateManyColumns, StoryDebugOutput, sampleUserColumns } from "../story-helpers";
import type { DataTableColumn } from "../types";
import { SortButton } from "./sort-button";

// Sample columns for stories - sortable subset
const sampleColumns = sampleUserColumns.filter((col) => col.enableSorting);

// Many columns for scroll test
const manyColumns = generateManyColumns(20);

// Wrapper component for interactive state
function SortButtonWrapper({
  columns = sampleColumns as DataTableColumn<unknown>[],
  initialSorting = [],
  showLabel = true,
  className,
  showDebug = true,
}: {
  columns?: DataTableColumn<unknown>[];
  initialSorting?: SortingState;
  showLabel?: boolean;
  className?: string;
  showDebug?: boolean;
}) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting);

  return (
    <div className="flex flex-col gap-4">
      <SortButton
        className={className}
        columns={columns}
        onSortingChange={setSorting}
        showLabel={showLabel}
        sorting={sorting}
      />

      {showDebug && <StoryDebugOutput data={sorting} label="Active Sorts" />}
    </div>
  );
}

const meta: Meta<typeof SortButtonWrapper> = {
  title: "composite/Datatable/SortButton",
  component: SortButtonWrapper,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    showDebug: {
      control: "boolean",
      description: "Show debug output with sort state",
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
 * Default SortButton with sortable columns.
 * Click to open dropdown and add sorts.
 */
export const Default: Story = {};

/**
 * SortButton with active sorts showing badge and sort list.
 * The badge displays the count of active sorts.
 * Click on sorted column to toggle direction.
 */
export const WithActiveSorts: Story = {
  args: {
    initialSorting: [
      { id: "name", desc: false },
      { id: "age", desc: true },
    ],
  },
};

/**
 * SortButton with no sortable columns.
 * Shows empty state message.
 */
export const NoSortableColumns: Story = {
  args: {
    columns: [
      {
        id: "id",
        header: "ID",
        accessorKey: "id",
        enableSorting: false,
      },
    ],
  },
};

/**
 * SortButton with many columns to test scroll behavior.
 * The dropdown uses ScrollArea with automatic scroll shadows.
 */
export const ManyColumns: Story = {
  args: {
    columns: manyColumns as DataTableColumn<unknown>[],
  },
};

/**
 * SortButton in small container (icon only).
 * Label is hidden via container queries.
 */
export const SmallContainer: Story = {
  render: (args) => (
    <div className="w-32">
      <SortButtonWrapper {...args} className="w-full" />
    </div>
  ),
  args: {
    showDebug: false,
  },
};

/**
 * SortButton in large container (icon + label).
 * Label is visible via container queries.
 */
export const LargeContainer: Story = {
  render: (args) => (
    <div className="w-96">
      <SortButtonWrapper {...args} className="w-full" />
    </div>
  ),
  args: {
    showDebug: false,
  },
};

/**
 * SortButton with label hidden via prop.
 * Always shows icon only regardless of container size.
 */
export const IconOnly: Story = {
  args: {
    showLabel: false,
  },
};

/**
 * SortButton with multiple sorts demonstrating priority order.
 * Sorts are applied in the order shown (1, 2, 3...).
 */
export const MultipleSorts: Story = {
  args: {
    initialSorting: [
      { id: "role", desc: false },
      { id: "name", desc: false },
      { id: "age", desc: true },
    ],
  },
};
