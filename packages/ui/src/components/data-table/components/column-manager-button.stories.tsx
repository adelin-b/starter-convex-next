import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import type { DataTableColumn } from "../types";
import { ColumnManagerButton } from "./column-manager-button";

type User = {
  name: string;
  email: string;
  role: string;
  age: number;
  status: string;
};

const defaultColumns: DataTableColumn<User>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Name",
    visible: true,
    order: 0,
    pinned: false,
  },
  {
    id: "email",
    accessorKey: "email",
    header: "Email",
    visible: true,
    order: 1,
    pinned: false,
  },
  {
    id: "role",
    accessorKey: "role",
    header: "Role",
    visible: true,
    order: 2,
    pinned: false,
  },
  {
    id: "age",
    accessorKey: "age",
    header: "Age",
    visible: true,
    order: 3,
    pinned: false,
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    visible: true,
    order: 4,
    pinned: false,
  },
];

// Wrapper component for interactive state
function ColumnManagerButtonWrapper({
  initialColumns = defaultColumns,
  className,
  showDebug = true,
}: {
  initialColumns?: DataTableColumn<User>[];
  className?: string;
  showDebug?: boolean;
}) {
  const [columns, setColumns] = useState<DataTableColumn<User>[]>(initialColumns);

  const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
    setColumns((prev) => prev.map((col) => (col.id === columnId ? { ...col, visible } : col)));
  };

  const handleColumnOrderChange = (columnId: string, newOrder: number) => {
    setColumns((prev) =>
      prev.map((col) => (col.id === columnId ? { ...col, order: newOrder } : col)),
    );
  };

  const handleColumnPinChange = (columnId: string, pinned: "left" | "right" | false) => {
    setColumns((prev) => prev.map((col) => (col.id === columnId ? { ...col, pinned } : col)));
  };

  return (
    <div className="space-y-4">
      <ColumnManagerButton
        className={className}
        columns={columns}
        onColumnOrderChange={handleColumnOrderChange}
        onColumnPinChange={handleColumnPinChange}
        onColumnVisibilityChange={handleColumnVisibilityChange}
      />

      {showDebug && (
        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-semibold">Column State:</h3>
          <pre className="text-xs">{JSON.stringify(columns, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

const meta: Meta<typeof ColumnManagerButtonWrapper> = {
  title: "composite/Datatable/ColumnManagerButton",
  component: ColumnManagerButtonWrapper,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    showDebug: {
      control: "boolean",
      description: "Show debug output with column state",
    },
  },
  args: {
    showDebug: true,
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Default ColumnManagerButton with all columns visible.
 */
export const Default: Story = {};

export const WithHiddenColumns: Story = {
  args: {
    initialColumns: [
      {
        id: "name",
        accessorKey: "name",
        header: "Name",
        visible: true,
        order: 0,
      },
      {
        id: "email",
        accessorKey: "email",
        header: "Email",
        visible: false,
        order: 1,
      },
      {
        id: "role",
        accessorKey: "role",
        header: "Role",
        visible: false,
        order: 2,
      },
      {
        id: "age",
        accessorKey: "age",
        header: "Age",
        visible: true,
        order: 3,
      },
      {
        id: "status",
        accessorKey: "status",
        header: "Status",
        visible: true,
        order: 4,
      },
    ],
  },
};

export const WithPinnedColumns: Story = {
  args: {
    initialColumns: [
      {
        id: "name",
        accessorKey: "name",
        header: "Name",
        visible: true,
        order: 0,
        pinned: "left",
      },
      {
        id: "email",
        accessorKey: "email",
        header: "Email",
        visible: true,
        order: 1,
        pinned: false,
      },
      {
        id: "role",
        accessorKey: "role",
        header: "Role",
        visible: true,
        order: 2,
        pinned: false,
      },
      {
        id: "age",
        accessorKey: "age",
        header: "Age",
        visible: true,
        order: 3,
        pinned: false,
      },
      {
        id: "status",
        accessorKey: "status",
        header: "Status",
        visible: true,
        order: 4,
        pinned: "right",
      },
    ],
  },
};

export const ManyColumns: Story = {
  args: {
    initialColumns: Array.from({ length: 20 }, (_, i) => ({
      id: `column${i + 1}`,
      accessorKey: `column${i + 1}` as keyof User,
      header: `Column ${i + 1}`,
      visible: i < 10,
      order: i,
      pinned: false,
    })),
  },
};

export const SmallContainer: Story = {
  render: (args) => (
    <div className="@container w-[200px] space-y-4">
      <ColumnManagerButtonWrapper {...args} />
    </div>
  ),
  args: {
    showDebug: false,
  },
};

export const LargeContainer: Story = {
  render: (args) => (
    <div className="@container w-[600px] space-y-4">
      <ColumnManagerButtonWrapper {...args} />
    </div>
  ),
  args: {
    showDebug: false,
  },
};
