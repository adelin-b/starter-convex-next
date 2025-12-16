import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

import {
  FilterPanel,
  FilterPanelActions,
  FilterPanelDateRange,
  FilterPanelMultiSelect,
} from "./filter-panel";

/**
 * FilterPanel component for building complex filters with date ranges and multi-select options.
 */
const meta: Meta<typeof FilterPanel> = {
  title: "domain/FilterPanel",
  component: FilterPanel,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof FilterPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Complete filter panel with date range and multi-select filters.
 */
export const Default: Story = {
  render: () => {
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [statuses, setStatuses] = useState<string[]>([]);
    const [types, setTypes] = useState<string[]>([]);

    const handleClear = () => {
      setDateRange(undefined);
      setStatuses([]);
      setTypes([]);
    };

    const handleApply = () => {
      console.log("Applying filters:", { dateRange, statuses, types });
    };

    return (
      <div className="w-[350px]">
        <FilterPanel>
          <FilterPanelDateRange label="Date Range" onChange={setDateRange} value={dateRange} />
          <FilterPanelMultiSelect
            label="Status"
            onChange={setStatuses}
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
              { value: "pending", label: "Pending" },
            ]}
            value={statuses}
          />
          <FilterPanelMultiSelect
            label="Type"
            onChange={setTypes}
            options={[
              { value: "call", label: "Call" },
              { value: "email", label: "Email" },
              { value: "sms", label: "SMS" },
            ]}
            value={types}
          />
          <FilterPanelActions onApply={handleApply} onClear={handleClear} />
        </FilterPanel>
      </div>
    );
  },
};

/**
 * Filter panel with only date range picker.
 */
export const DateRangeOnly: Story = {
  render: () => {
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    return (
      <div className="w-[350px]">
        <FilterPanel>
          <FilterPanelDateRange
            label="Select Period"
            onChange={setDateRange}
            placeholder="Choose date range"
            value={dateRange}
          />
          <FilterPanelActions
            onApply={() => console.log("Apply:", dateRange)}
            onClear={() => setDateRange(undefined)}
          />
        </FilterPanel>
      </div>
    );
  },
};

/**
 * Filter panel with only multi-select options.
 */
export const MultiSelectOnly: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>([]);

    return (
      <div className="w-[350px]">
        <FilterPanel>
          <FilterPanelMultiSelect
            label="Categories"
            onChange={setSelected}
            options={[
              { value: "tech", label: "Technology" },
              { value: "business", label: "Business" },
              { value: "design", label: "Design" },
              { value: "marketing", label: "Marketing" },
            ]}
            value={selected}
          />
          <FilterPanelActions
            onApply={() => console.log("Apply:", selected)}
            onClear={() => setSelected([])}
          />
        </FilterPanel>
      </div>
    );
  },
};

/**
 * Filter panel without action buttons (auto-apply).
 */
export const AutoApply: Story = {
  render: () => {
    const [statuses, setStatuses] = useState<string[]>([]);

    const handleChange = (values: string[]) => {
      setStatuses(values);
      console.log("Auto-applied:", values);
    };

    return (
      <div className="w-[350px]">
        <FilterPanel>
          <FilterPanelMultiSelect
            label="Status Filter"
            onChange={handleChange}
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
              { value: "archived", label: "Archived" },
            ]}
            value={statuses}
          />
        </FilterPanel>
      </div>
    );
  },
};

/**
 * Multiple filter sections in one panel.
 */
export const ComplexFilters: Story = {
  render: () => {
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [priorities, setPriorities] = useState<string[]>([]);
    const [assignees, setAssignees] = useState<string[]>([]);
    const [labels, setLabels] = useState<string[]>([]);

    const handleClearAll = () => {
      setDateRange(undefined);
      setPriorities([]);
      setAssignees([]);
      setLabels([]);
    };

    return (
      <div className="w-[350px]">
        <FilterPanel>
          <FilterPanelDateRange label="Created Date" onChange={setDateRange} value={dateRange} />
          <FilterPanelMultiSelect
            label="Priority"
            onChange={setPriorities}
            options={[
              { value: "high", label: "High" },
              { value: "medium", label: "Medium" },
              { value: "low", label: "Low" },
            ]}
            value={priorities}
          />
          <FilterPanelMultiSelect
            label="Assignee"
            onChange={setAssignees}
            options={[
              { value: "john", label: "John Doe" },
              { value: "jane", label: "Jane Smith" },
              { value: "bob", label: "Bob Johnson" },
            ]}
            value={assignees}
          />
          <FilterPanelMultiSelect
            label="Labels"
            onChange={setLabels}
            options={[
              { value: "bug", label: "Bug" },
              { value: "feature", label: "Feature" },
              { value: "docs", label: "Documentation" },
            ]}
            value={labels}
          />
          <FilterPanelActions onClear={handleClearAll} />
        </FilterPanel>
      </div>
    );
  },
};
