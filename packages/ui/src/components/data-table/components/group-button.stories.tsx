import type { Meta, StoryObj } from "@storybook/react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useState } from "react";
import { generateManyColumns, StoryDebugOutput, sampleUserColumns } from "../story-helpers";
import type { DataTableColumn, GroupConfig } from "../types";
import { GroupButton } from "./group-button";

// Sample data type
type SampleUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  age: number;
};

// Generate sample data with varied status and role values for grouping
const generateSampleData = (count: number): SampleUser[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `user-${i + 1}`,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: ["Admin", "Editor", "Viewer"][i % 3]!,
    status: ["Active", "Inactive", "Pending"][i % 3]!,
    age: 25 + (i % 40),
  }));

const sampleData = generateSampleData(30);

// Wrapper component for interactive state with real table instance
function GroupButtonWrapper({
  columns = sampleUserColumns as DataTableColumn<SampleUser>[],
  data = sampleData,
  initialGroupConfig = null,
  showLabel = true,
  className,
  showDebug = true,
}: {
  columns?: DataTableColumn<SampleUser>[];
  data?: SampleUser[];
  initialGroupConfig?: GroupConfig | null;
  showLabel?: boolean;
  className?: string;
  showDebug?: boolean;
}) {
  const [groupConfig, setGroupConfig] = useState<GroupConfig | null>(initialGroupConfig);

  // Create a real TanStack Table instance
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel().rows;

  return (
    <div className="flex flex-col gap-4">
      <GroupButton
        className={className}
        columns={columns}
        groupConfig={groupConfig}
        onGroupConfigChange={setGroupConfig}
        rows={rows}
        showLabel={showLabel}
        table={table}
      />

      {showDebug && <StoryDebugOutput data={groupConfig} label="Group Config" />}
    </div>
  );
}

const meta: Meta<typeof GroupButtonWrapper> = {
  title: "composite/Datatable/GroupButton",
  component: GroupButtonWrapper,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    showDebug: {
      control: "boolean",
      description: "Show debug output with group config state",
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
 * Default GroupButton with groupable columns.
 * Click to open popover and select a column to group by.
 */
export const Default: Story = {};

/**
 * GroupButton with active grouping showing badge.
 * Groups are sorted A-Z by default.
 */
export const WithActiveGrouping: Story = {
  args: {
    initialGroupConfig: {
      columnId: "status",
      sortOrder: "asc",
      hideEmpty: false,
      hiddenGroups: [],
      collapsedGroups: [],
    },
  },
};

/**
 * GroupButton grouped by role with descending sort order.
 */
export const GroupedByRole: Story = {
  args: {
    initialGroupConfig: {
      columnId: "role",
      sortOrder: "desc",
      hideEmpty: false,
      hiddenGroups: [],
      collapsedGroups: [],
    },
  },
};

/**
 * GroupButton with groups sorted by count (ascending).
 * Groups with fewer items appear first.
 */
export const SortByCountAscending: Story = {
  args: {
    initialGroupConfig: {
      columnId: "status",
      sortOrder: "count-asc",
      hideEmpty: false,
      hiddenGroups: [],
      collapsedGroups: [],
    },
  },
};

/**
 * GroupButton with groups sorted by count (descending).
 * Groups with more items appear first.
 */
export const SortByCountDescending: Story = {
  args: {
    initialGroupConfig: {
      columnId: "status",
      sortOrder: "count-desc",
      hideEmpty: false,
      hiddenGroups: [],
      collapsedGroups: [],
    },
  },
};

/**
 * GroupButton with some groups hidden.
 * Hidden groups don't appear in the grouped view.
 */
export const WithHiddenGroups: Story = {
  args: {
    initialGroupConfig: {
      columnId: "status",
      sortOrder: "asc",
      hideEmpty: false,
      hiddenGroups: ["Inactive"],
      collapsedGroups: [],
    },
  },
};

/**
 * GroupButton with some groups collapsed.
 * Collapsed groups show only the header, not the rows.
 */
export const WithCollapsedGroups: Story = {
  args: {
    initialGroupConfig: {
      columnId: "status",
      sortOrder: "asc",
      hideEmpty: false,
      hiddenGroups: [],
      collapsedGroups: ["Pending"],
    },
  },
};

/**
 * GroupButton with hide empty groups enabled.
 * Groups with zero items are hidden automatically.
 */
export const HideEmptyGroups: Story = {
  args: {
    initialGroupConfig: {
      columnId: "status",
      sortOrder: "asc",
      hideEmpty: true,
      hiddenGroups: [],
      collapsedGroups: [],
    },
  },
};

/**
 * GroupButton with many columns to test scroll behavior.
 * The column selector dropdown uses ScrollArea.
 */
export const ManyColumns: Story = {
  args: {
    columns: generateManyColumns(20) as DataTableColumn<SampleUser>[],
  },
};

/**
 * GroupButton in small container (icon only).
 * Label is hidden via container queries.
 */
export const SmallContainer: Story = {
  render: (args) => (
    <div className="w-32">
      <GroupButtonWrapper {...args} className="w-full" />
    </div>
  ),
  args: {
    showDebug: false,
  },
};

/**
 * GroupButton in large container (icon + label).
 * Label is visible via container queries.
 */
export const LargeContainer: Story = {
  render: (args) => (
    <div className="w-96">
      <GroupButtonWrapper {...args} className="w-full" />
    </div>
  ),
  args: {
    showDebug: false,
  },
};

/**
 * GroupButton with label hidden via prop.
 * Always shows icon only regardless of container size.
 */
export const IconOnly: Story = {
  args: {
    showLabel: false,
  },
};

/**
 * GroupButton with custom labels for internationalization.
 */
export const CustomLabels: Story = {
  render: (args) => {
    const [groupConfig, setGroupConfig] = useState<GroupConfig | null>(null);

    const table = useReactTable({
      data: sampleData,
      columns: sampleUserColumns as DataTableColumn<SampleUser>[],
      getCoreRowModel: getCoreRowModel(),
    });

    return (
      <div className="flex flex-col gap-4">
        <GroupButton
          columns={sampleUserColumns as DataTableColumn<SampleUser>[]}
          groupConfig={groupConfig}
          labels={{
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
          }}
          onGroupConfigChange={setGroupConfig}
          rows={table.getRowModel().rows}
          showLabel={args.showLabel}
          table={table}
        />

        {args.showDebug && <StoryDebugOutput data={groupConfig} label="Group Config" />}
      </div>
    );
  },
  args: {
    showDebug: true,
    showLabel: true,
  },
};
