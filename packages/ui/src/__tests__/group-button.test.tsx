import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GroupButton } from "../components/data-table/components/group-button";
import type { DataTableColumn, GroupConfig } from "../components/data-table/types";

// Mock TanStack Table
const createMockTable = () => ({
  getColumn: vi.fn(() => ({
    id: "status",
  })),
});

// Mock Row
const createMockRow = (status: string) => ({
  id: `row-${status}`,
  getValue: vi.fn((columnId: string) => {
    if (columnId === "status") {
      return status;
    }
    return null;
  }),
  original: { id: `row-${status}`, status },
});

describe("GroupButton component", () => {
  const mockColumns: DataTableColumn<{ id: string; status: string }>[] = [
    { id: "status", header: "Status", accessorKey: "status" },
    { id: "name", header: "Name", accessorKey: "name" },
  ];

  const mockRows = [createMockRow("Active"), createMockRow("Pending"), createMockRow("Inactive")];

  const mockTable = createMockTable();

  it("renders with Group label when showLabel is true", () => {
    render(
      <GroupButton
        columns={mockColumns}
        groupConfig={null}
        onGroupConfigChange={vi.fn()}
        rows={mockRows as never[]}
        showLabel={true}
        table={mockTable as never}
      />,
    );

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders without label when showLabel is false", () => {
    render(
      <GroupButton
        columns={mockColumns}
        groupConfig={null}
        onGroupConfigChange={vi.fn()}
        rows={mockRows as never[]}
        showLabel={false}
        table={mockTable as never}
      />,
    );

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("shows badge indicator when groupConfig is set", () => {
    const groupConfig: GroupConfig = {
      columnId: "status",
      sortOrder: "asc",
      hideEmpty: false,
      hiddenGroups: [],
      collapsedGroups: [],
    };

    render(
      <GroupButton
        columns={mockColumns}
        groupConfig={groupConfig}
        onGroupConfigChange={vi.fn()}
        rows={mockRows as never[]}
        table={mockTable as never}
      />,
    );

    // Badge shows "1" when grouped
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("does not show badge when groupConfig is null", () => {
    render(
      <GroupButton
        columns={mockColumns}
        groupConfig={null}
        onGroupConfigChange={vi.fn()}
        rows={mockRows as never[]}
        table={mockTable as never}
      />,
    );

    expect(screen.queryByText("1")).not.toBeInTheDocument();
  });

  it("has correct aria-label when not grouped", () => {
    render(
      <GroupButton
        columns={mockColumns}
        groupConfig={null}
        labels={{ group: "Group" }}
        onGroupConfigChange={vi.fn()}
        rows={mockRows as never[]}
        table={mockTable as never}
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Group");
  });

  it("has correct aria-label when grouped", () => {
    const groupConfig: GroupConfig = {
      columnId: "status",
      sortOrder: "asc",
      hideEmpty: false,
      hiddenGroups: [],
      collapsedGroups: [],
    };

    render(
      <GroupButton
        columns={mockColumns}
        groupConfig={groupConfig}
        onGroupConfigChange={vi.fn()}
        rows={mockRows as never[]}
        table={mockTable as never}
      />,
    );

    const button = screen.getByRole("button");
    // Default formatGroupedBy includes colon: "Grouped by: {column}"
    expect(button).toHaveAttribute("aria-label", "Grouped by: Status");
  });

  it("applies custom className", () => {
    render(
      <GroupButton
        className="custom-class"
        columns={mockColumns}
        groupConfig={null}
        onGroupConfigChange={vi.fn()}
        rows={mockRows as never[]}
        table={mockTable as never}
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });

  it("opens popover when button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <GroupButton
        columns={mockColumns}
        groupConfig={null}
        labels={{ groupBy: "Group by" }}
        onGroupConfigChange={vi.fn()}
        rows={mockRows as never[]}
        table={mockTable as never}
      />,
    );

    await user.click(screen.getByRole("button"));

    // Popover content should be visible
    expect(screen.getByText("Group by")).toBeInTheDocument();
  });

  it("calls onGroupConfigChange with null when selecting none", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    const groupConfig: GroupConfig = {
      columnId: "status",
      sortOrder: "asc",
      hideEmpty: false,
      hiddenGroups: [],
      collapsedGroups: [],
    };

    render(
      <GroupButton
        columns={mockColumns}
        groupConfig={groupConfig}
        labels={{ removeGrouping: "Remove grouping" }}
        onGroupConfigChange={handleChange}
        rows={mockRows as never[]}
        table={mockTable as never}
      />,
    );

    // Open popover
    await user.click(screen.getByRole("button"));

    // Click remove grouping
    await user.click(screen.getByText("Remove grouping"));

    expect(handleChange).toHaveBeenCalledWith(null);
  });

  it("renders combobox for column selection", async () => {
    const user = userEvent.setup();

    render(
      <GroupButton
        columns={mockColumns}
        groupConfig={null}
        onGroupConfigChange={vi.fn()}
        rows={mockRows as never[]}
        table={mockTable as never}
      />,
    );

    // Open popover
    await user.click(screen.getByRole("button"));

    // Combobox should be present for column selection
    const combobox = screen.getByRole("combobox");
    expect(combobox).toBeInTheDocument();
  });

  it("shows hide empty groups toggle when grouped", async () => {
    const user = userEvent.setup();

    const groupConfig: GroupConfig = {
      columnId: "status",
      sortOrder: "asc",
      hideEmpty: false,
      hiddenGroups: [],
      collapsedGroups: [],
    };

    render(
      <GroupButton
        columns={mockColumns}
        groupConfig={groupConfig}
        labels={{ hideEmptyGroups: "Hide empty groups" }}
        onGroupConfigChange={vi.fn()}
        rows={mockRows as never[]}
        table={mockTable as never}
      />,
    );

    // Open popover
    await user.click(screen.getByRole("button"));

    expect(screen.getByText("Hide empty groups")).toBeInTheDocument();
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("does not show hide empty groups toggle when not grouped", async () => {
    const user = userEvent.setup();

    render(
      <GroupButton
        columns={mockColumns}
        groupConfig={null}
        labels={{ hideEmptyGroups: "Hide empty groups" }}
        onGroupConfigChange={vi.fn()}
        rows={mockRows as never[]}
        table={mockTable as never}
      />,
    );

    // Open popover
    await user.click(screen.getByRole("button"));

    expect(screen.queryByText("Hide empty groups")).not.toBeInTheDocument();
  });

  it("calls onGroupConfigChange with updated hideEmpty when toggle is clicked", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    const groupConfig: GroupConfig = {
      columnId: "status",
      sortOrder: "asc",
      hideEmpty: false,
      hiddenGroups: [],
      collapsedGroups: [],
    };

    render(
      <GroupButton
        columns={mockColumns}
        groupConfig={groupConfig}
        onGroupConfigChange={handleChange}
        rows={mockRows as never[]}
        table={mockTable as never}
      />,
    );

    // Open popover
    await user.click(screen.getByRole("button"));

    // Click switch
    await user.click(screen.getByRole("switch"));

    expect(handleChange).toHaveBeenCalledWith({
      ...groupConfig,
      hideEmpty: true,
    });
  });
});
