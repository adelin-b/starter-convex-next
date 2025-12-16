import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SearchInput } from "./search-input";

/**
 * Interactive SearchInput with state management
 */
function SearchInputWrapper({
  placeholder = "Search all columns...",
  isLoading = false,
  disabled = false,
  debounceMs,
  showDebug = true,
}: {
  placeholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
  debounceMs?: number;
  showDebug?: boolean;
}) {
  const [value, setValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");

  const handleChange = (newValue: string) => {
    setValue(newValue);
    setDebouncedValue(newValue);
  };

  return (
    <div className="w-full max-w-md space-y-4">
      <SearchInput
        debounceMs={debounceMs}
        disabled={disabled}
        isLoading={isLoading}
        onChange={handleChange}
        placeholder={placeholder}
        value={value}
      />
      {showDebug && (
        <div className="rounded-md border p-4 text-sm">
          <p className="font-medium">Local value (immediate):</p>
          <p className="text-muted-foreground">{value || "(empty)"}</p>
          <p className="mt-2 font-medium">Debounced value:</p>
          <p className="text-muted-foreground">{debouncedValue || "(empty)"}</p>
        </div>
      )}
    </div>
  );
}

const meta: Meta<typeof SearchInputWrapper> = {
  title: "composite/Datatable/SearchInput",
  component: SearchInputWrapper,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    placeholder: {
      control: "text",
      description: "Placeholder text for the input",
    },
    isLoading: {
      control: "boolean",
      description: "Show loading spinner",
    },
    disabled: {
      control: "boolean",
      description: "Disable the input",
    },
    debounceMs: {
      control: "number",
      description: "Debounce delay in milliseconds",
    },
    showDebug: {
      control: "boolean",
      description: "Show debug output with search state",
    },
  },
  args: {
    placeholder: "Search all columns...",
    isLoading: false,
    disabled: false,
    showDebug: true,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default search input with standard placeholder
 */
export const Default: Story = {};

/**
 * Search input in loading state
 */
export const Loading: Story = {
  args: {
    isLoading: true,
    placeholder: "Searching...",
  },
};

/**
 * Disabled search input
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "Search disabled",
  },
};

/**
 * Custom debounce delay (100ms for instant feedback)
 */
export const FastDebounce: Story = {
  args: {
    debounceMs: 100,
    placeholder: "Fast search (100ms delay)",
  },
};

/**
 * Slow debounce delay (1000ms)
 */
export const SlowDebounce: Story = {
  args: {
    debounceMs: 1000,
    placeholder: "Slow search (1s delay)",
  },
};

/**
 * Multiple search inputs in a container
 */
export const MultipleInputs: Story = {
  render: () => (
    <div className="space-y-4">
      <SearchInputWrapper placeholder="Search products..." showDebug={false} />
      <SearchInputWrapper placeholder="Search categories..." showDebug={false} />
      <SearchInputWrapper placeholder="Search tags..." showDebug={false} />
    </div>
  ),
};

/**
 * Responsive container query test
 */
export const ResponsiveContainer: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="w-full">
        <p className="mb-2 font-medium text-sm">Full width:</p>
        <SearchInputWrapper showDebug={false} />
      </div>
      <div className="w-64">
        <p className="mb-2 font-medium text-sm">Narrow container (256px):</p>
        <SearchInputWrapper showDebug={false} />
      </div>
      <div className="w-32">
        <p className="mb-2 font-medium text-sm">Very narrow (128px):</p>
        <SearchInputWrapper showDebug={false} />
      </div>
    </div>
  ),
};
