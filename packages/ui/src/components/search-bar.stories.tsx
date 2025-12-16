import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { SearchBar } from "./search-bar";

/**
 * SearchBar component - enhanced Input with search icon and optional clear button.
 */
const meta: Meta<typeof SearchBar> = {
  title: "domain/SearchBar",
  component: SearchBar,
  tags: ["autodocs"],
  argTypes: {
    placeholder: {
      control: "text",
      description: "Placeholder text",
    },
    showClear: {
      control: "boolean",
      description: "Show clear button when value is not empty",
    },
    disabled: {
      control: "boolean",
      description: "Disabled state",
    },
  },
  parameters: {
    layout: "padded",
  },
  args: {
    placeholder: "Search...",
    showClear: true,
    disabled: false,
  },
} satisfies Meta<typeof SearchBar>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Default search bar with controlled state.
 */
export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState("");

    return (
      <div className="w-full max-w-md">
        <SearchBar
          {...args}
          onChange={(e) => setValue(e.target.value)}
          onClear={() => setValue("")}
          value={value}
        />
      </div>
    );
  },
};

/**
 * Search bar with initial value.
 */
export const WithValue: Story = {
  render: (args) => {
    const [value, setValue] = useState("search query");

    return (
      <div className="w-full max-w-md">
        <SearchBar
          {...args}
          onChange={(e) => setValue(e.target.value)}
          onClear={() => setValue("")}
          value={value}
        />
      </div>
    );
  },
};

/**
 * Search bar without clear button.
 */
export const NoClearButton: Story = {
  render: (args) => {
    const [value, setValue] = useState("search query");

    return (
      <div className="w-full max-w-md">
        <SearchBar
          {...args}
          onChange={(e) => setValue(e.target.value)}
          showClear={false}
          value={value}
        />
      </div>
    );
  },
};

/**
 * Disabled search bar.
 */
export const Disabled: Story = {
  render: (args) => {
    const [value, setValue] = useState("");

    return (
      <div className="w-full max-w-md">
        <SearchBar
          {...args}
          disabled
          onChange={(e) => setValue(e.target.value)}
          onClear={() => setValue("")}
          value={value}
        />
      </div>
    );
  },
};

/**
 * Different placeholders for different contexts.
 */
export const Placeholders: Story = {
  render: () => {
    const [value1, setValue1] = useState("");
    const [value2, setValue2] = useState("");
    const [value3, setValue3] = useState("");

    return (
      <div className="w-full max-w-md space-y-4">
        <SearchBar
          onChange={(e) => setValue1(e.target.value)}
          onClear={() => setValue1("")}
          placeholder="Search agents..."
          value={value1}
        />
        <SearchBar
          onChange={(e) => setValue2(e.target.value)}
          onClear={() => setValue2("")}
          placeholder="Search campaigns..."
          value={value2}
        />
        <SearchBar
          onChange={(e) => setValue3(e.target.value)}
          onClear={() => setValue3("")}
          placeholder="Search by name, email, or phone..."
          value={value3}
        />
      </div>
    );
  },
};

/**
 * Search bar with live filtering example.
 */
export const LiveFiltering: Story = {
  render: () => {
    const [query, setQuery] = useState("");
    const items = [
      "Voice Agent Alpha",
      "Customer Service Bot",
      "Sales Assistant",
      "Support Agent",
      "Marketing Automation",
    ];

    const filteredItems = items.filter((item) => item.toLowerCase().includes(query.toLowerCase()));

    return (
      <div className="w-full max-w-md space-y-4">
        <SearchBar
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => setQuery("")}
          placeholder="Search agents..."
          value={query}
        />
        <div className="space-y-2">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div className="cursor-pointer rounded-lg border p-3 hover:bg-muted" key={item}>
                {item}
              </div>
            ))
          ) : (
            <p className="py-4 text-center text-muted-foreground text-sm">No results found</p>
          )}
        </div>
      </div>
    );
  },
};

/**
 * Full width search bar.
 */
export const FullWidth: Story = {
  render: (args) => {
    const [value, setValue] = useState("");

    return (
      <SearchBar
        {...args}
        className="w-full"
        onChange={(e) => setValue(e.target.value)}
        onClear={() => setValue("")}
        value={value}
      />
    );
  },
  parameters: {
    layout: "padded",
  },
};
