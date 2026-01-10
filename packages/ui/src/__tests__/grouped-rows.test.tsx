import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { assertType, describe, expect, expectTypeOf, it, vi } from "vitest";
import type { GroupedRow } from "../components/data-table/components/grouped-rows";
import {
  createDefaultGroupConfig,
  GroupHeader,
  toggleGroupCollapsed,
  toggleGroupHidden,
} from "../components/data-table/components/grouped-rows";
import type { GroupConfig, GroupSortOrder } from "../components/data-table/types";
import { groupSortOrders } from "../components/data-table/types";

describe("GroupConfig utilities", () => {
  describe("createDefaultGroupConfig", () => {
    it("creates config with specified columnId", () => {
      const config = createDefaultGroupConfig("status");

      expect(config.columnId).toBe("status");
    });

    it("creates config with default sort order 'asc'", () => {
      const config = createDefaultGroupConfig("status");

      expect(config.sortOrder).toBe("asc");
    });

    it("creates config with hideEmpty false", () => {
      const config = createDefaultGroupConfig("status");

      expect(config.hideEmpty).toBe(false);
    });

    it("creates config with empty hiddenGroups array", () => {
      const config = createDefaultGroupConfig("status");

      expect(config.hiddenGroups).toEqual([]);
    });

    it("creates config with empty collapsedGroups array", () => {
      const config = createDefaultGroupConfig("status");

      expect(config.collapsedGroups).toEqual([]);
    });
  });

  describe("toggleGroupCollapsed", () => {
    it("adds group to collapsedGroups when not collapsed", () => {
      const config: GroupConfig = {
        columnId: "status",
        sortOrder: "asc",
        hideEmpty: false,
        hiddenGroups: [],
        collapsedGroups: [],
      };

      const result = toggleGroupCollapsed(config, "Active");

      expect(result.collapsedGroups).toContain("Active");
    });

    it("removes group from collapsedGroups when already collapsed", () => {
      const config: GroupConfig = {
        columnId: "status",
        sortOrder: "asc",
        hideEmpty: false,
        hiddenGroups: [],
        collapsedGroups: ["Active"],
      };

      const result = toggleGroupCollapsed(config, "Active");

      expect(result.collapsedGroups).not.toContain("Active");
    });

    it("preserves other collapsed groups", () => {
      const config: GroupConfig = {
        columnId: "status",
        sortOrder: "asc",
        hideEmpty: false,
        hiddenGroups: [],
        collapsedGroups: ["Pending", "Inactive"],
      };

      const result = toggleGroupCollapsed(config, "Active");

      expect(result.collapsedGroups).toContain("Pending");
      expect(result.collapsedGroups).toContain("Inactive");
      expect(result.collapsedGroups).toContain("Active");
    });

    it("does not mutate original config", () => {
      const config: GroupConfig = {
        columnId: "status",
        sortOrder: "asc",
        hideEmpty: false,
        hiddenGroups: [],
        collapsedGroups: [],
      };

      toggleGroupCollapsed(config, "Active");

      expect(config.collapsedGroups).toEqual([]);
    });
  });

  describe("toggleGroupHidden", () => {
    it("adds group to hiddenGroups when not hidden", () => {
      const config: GroupConfig = {
        columnId: "status",
        sortOrder: "asc",
        hideEmpty: false,
        hiddenGroups: [],
        collapsedGroups: [],
      };

      const result = toggleGroupHidden(config, "Active");

      expect(result.hiddenGroups).toContain("Active");
    });

    it("removes group from hiddenGroups when already hidden", () => {
      const config: GroupConfig = {
        columnId: "status",
        sortOrder: "asc",
        hideEmpty: false,
        hiddenGroups: ["Active"],
        collapsedGroups: [],
      };

      const result = toggleGroupHidden(config, "Active");

      expect(result.hiddenGroups).not.toContain("Active");
    });

    it("preserves other hidden groups", () => {
      const config: GroupConfig = {
        columnId: "status",
        sortOrder: "asc",
        hideEmpty: false,
        hiddenGroups: ["Pending", "Inactive"],
        collapsedGroups: [],
      };

      const result = toggleGroupHidden(config, "Active");

      expect(result.hiddenGroups).toContain("Pending");
      expect(result.hiddenGroups).toContain("Inactive");
      expect(result.hiddenGroups).toContain("Active");
    });

    it("does not mutate original config", () => {
      const config: GroupConfig = {
        columnId: "status",
        sortOrder: "asc",
        hideEmpty: false,
        hiddenGroups: [],
        collapsedGroups: [],
      };

      toggleGroupHidden(config, "Active");

      expect(config.hiddenGroups).toEqual([]);
    });
  });
});

describe("GroupHeader component", () => {
  it("renders group value", () => {
    render(<GroupHeader count={5} isCollapsed={false} onToggle={vi.fn()} value="Active" />);

    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders item count with default format", () => {
    render(<GroupHeader count={5} isCollapsed={false} onToggle={vi.fn()} value="Active" />);

    expect(screen.getByText("5 items")).toBeInTheDocument();
  });

  it("renders custom count format from labels", () => {
    render(
      <GroupHeader
        count={5}
        isCollapsed={false}
        labels={{ formatGroupCount: (n) => `${n} items` }}
        onToggle={vi.fn()}
        value="Active"
      />,
    );

    expect(screen.getByText("5 items")).toBeInTheDocument();
  });

  it("renders collapsed state with ChevronRight", () => {
    render(<GroupHeader count={5} isCollapsed={true} onToggle={vi.fn()} value="Active" />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("renders expanded state with ChevronDown", () => {
    render(<GroupHeader count={5} isCollapsed={false} onToggle={vi.fn()} value="Active" />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("calls onToggle when clicked", async () => {
    const user = userEvent.setup();
    const handleToggle = vi.fn();

    render(<GroupHeader count={5} isCollapsed={false} onToggle={handleToggle} value="Active" />);

    await user.click(screen.getByRole("button"));

    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it("has accessible aria-label for collapsed state", () => {
    render(
      <GroupHeader
        count={5}
        isCollapsed={true}
        labels={{ expandGroup: "Expand" }}
        onToggle={vi.fn()}
        value="Active"
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Expand Active");
  });

  it("has accessible aria-label for expanded state", () => {
    render(
      <GroupHeader
        count={5}
        isCollapsed={false}
        labels={{ collapseGroup: "Collapse" }}
        onToggle={vi.fn()}
        value="Active"
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Collapse Active");
  });

  it("applies custom className", () => {
    render(
      <GroupHeader
        className="custom-class"
        count={5}
        isCollapsed={false}
        onToggle={vi.fn()}
        value="Active"
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });

  it("renders button with type='button'", () => {
    render(<GroupHeader count={5} isCollapsed={false} onToggle={vi.fn()} value="Active" />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "button");
  });

  it("handles zero count", () => {
    render(<GroupHeader count={0} isCollapsed={false} onToggle={vi.fn()} value="Empty Group" />);

    expect(screen.getByText("0 items")).toBeInTheDocument();
  });

  it("handles large count", () => {
    render(<GroupHeader count={1000} isCollapsed={false} onToggle={vi.fn()} value="Large Group" />);

    expect(screen.getByText("1000 items")).toBeInTheDocument();
  });
});

// Type-Safety Tests using Vitest expectTypeOf
// These tests verify type constraints at compile time
describe("Type-Safety Tests", () => {
  describe("GroupSortOrder type", () => {
    it("should include all valid sort orders", () => {
      expectTypeOf<"asc">().toMatchTypeOf<GroupSortOrder>();
      expectTypeOf<"desc">().toMatchTypeOf<GroupSortOrder>();
      expectTypeOf<"count-asc">().toMatchTypeOf<GroupSortOrder>();
      expectTypeOf<"count-desc">().toMatchTypeOf<GroupSortOrder>();
    });

    it("should reject invalid sort orders", () => {
      expectTypeOf<"invalid">().not.toMatchTypeOf<GroupSortOrder>();
      expectTypeOf<"ASC">().not.toMatchTypeOf<GroupSortOrder>();
      expectTypeOf<"alphabetical">().not.toMatchTypeOf<GroupSortOrder>();
      expectTypeOf<string>().not.toMatchTypeOf<GroupSortOrder>();
    });

    it("should not be 'any'", () => {
      expectTypeOf<GroupSortOrder>().not.toBeAny();
    });

    it("groupSortOrders array should contain all sort order values", () => {
      // Verify the const array has the correct type
      expectTypeOf(groupSortOrders).toEqualTypeOf<
        readonly ["asc", "desc", "count-asc", "count-desc"]
      >();

      // Each element should be a valid GroupSortOrder
      for (const order of groupSortOrders) {
        expectTypeOf(order).toMatchTypeOf<GroupSortOrder>();
      }
    });
  });

  describe("GroupConfig type", () => {
    it("should have required fields with correct types", () => {
      type ConfigColumnId = GroupConfig["columnId"];
      type ConfigSortOrder = GroupConfig["sortOrder"];
      type ConfigHideEmpty = GroupConfig["hideEmpty"];
      type ConfigHiddenGroups = GroupConfig["hiddenGroups"];
      type ConfigCollapsedGroups = GroupConfig["collapsedGroups"];

      expectTypeOf<ConfigColumnId>().toBeString();
      expectTypeOf<ConfigSortOrder>().toEqualTypeOf<GroupSortOrder>();
      expectTypeOf<ConfigHideEmpty>().toBeBoolean();
      expectTypeOf<ConfigHiddenGroups>().toEqualTypeOf<string[]>();
      expectTypeOf<ConfigCollapsedGroups>().toEqualTypeOf<string[]>();
    });

    it("should validate complete GroupConfig objects", () => {
      const validConfig: GroupConfig = {
        columnId: "status",
        sortOrder: "asc",
        hideEmpty: false,
        hiddenGroups: [],
        collapsedGroups: [],
      };

      assertType<GroupConfig>(validConfig);
      expectTypeOf(validConfig).toMatchTypeOf<GroupConfig>();
    });
  });

  describe("GroupedRow type", () => {
    it("should be generic over TData", () => {
      type TestData = { id: string; name: string };
      type TestGroupedRow = GroupedRow<TestData>;

      // Value should be string
      expectTypeOf<TestGroupedRow["value"]>().toBeString();

      // Count should be number
      expectTypeOf<TestGroupedRow["count"]>().toBeNumber();
    });

    it("should have required fields", () => {
      type AnyGroupedRow = GroupedRow<unknown>;

      expectTypeOf<AnyGroupedRow>().toHaveProperty("value");
      expectTypeOf<AnyGroupedRow>().toHaveProperty("rows");
      expectTypeOf<AnyGroupedRow>().toHaveProperty("count");
    });
  });

  describe("Function return types", () => {
    it("createDefaultGroupConfig should return GroupConfig", () => {
      const result = createDefaultGroupConfig("test");
      expectTypeOf(result).toEqualTypeOf<GroupConfig>();
    });

    it("toggleGroupCollapsed should return GroupConfig", () => {
      const config: GroupConfig = {
        columnId: "test",
        sortOrder: "asc",
        hideEmpty: false,
        hiddenGroups: [],
        collapsedGroups: [],
      };
      const result = toggleGroupCollapsed(config, "group1");
      expectTypeOf(result).toEqualTypeOf<GroupConfig>();
    });

    it("toggleGroupHidden should return GroupConfig", () => {
      const config: GroupConfig = {
        columnId: "test",
        sortOrder: "asc",
        hideEmpty: false,
        hiddenGroups: [],
        collapsedGroups: [],
      };
      const result = toggleGroupHidden(config, "group1");
      expectTypeOf(result).toEqualTypeOf<GroupConfig>();
    });
  });
});
