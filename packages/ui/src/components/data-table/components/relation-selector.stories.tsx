import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { RelationSelectorStoryWrapper, SelectedValueDisplay } from "../story-helpers";
import { RelationSelector } from "./relation-selector";

const meta: Meta<typeof RelationSelector> = {
  title: "composite/Datatable/RelationSelector",
  component: RelationSelector,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data
const mockUsers = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com", role: "Admin" },
  { id: "2", name: "Bob Smith", email: "bob@example.com", role: "User" },
  { id: "3", name: "Carol White", email: "carol@example.com", role: "User" },
  { id: "4", name: "David Brown", email: "david@example.com", role: "Manager" },
  { id: "5", name: "Eve Davis", email: "eve@example.com", role: "User" },
  { id: "6", name: "Frank Miller", email: "frank@example.com", role: "Admin" },
  { id: "7", name: "Grace Lee", email: "grace@example.com", role: "User" },
  {
    id: "8",
    name: "Henry Wilson",
    email: "henry@example.com",
    role: "Manager",
  },
];

/**
 * Default relation selector - single select
 */
function DefaultExample() {
  const [selected, setSelected] = useState<string | string[]>([]);

  return (
    <RelationSelectorStoryWrapper>
      <RelationSelector
        config={{
          targetTable: "users",
          displayField: "name",
          multiple: true,
        }}
        onChange={setSelected}
        options={mockUsers}
        placeholder="Select relations..."
        value={selected}
      />
      <SelectedValueDisplay selected={selected} />
    </RelationSelectorStoryWrapper>
  );
}

export const Default: Story = {
  render: () => <DefaultExample />,
};

/**
 * Multi-select - select multiple relations
 */
function MultiSelectExample() {
  const [selected, setSelected] = useState<string | string[]>(["1"]);

  return (
    <RelationSelectorStoryWrapper>
      <RelationSelector
        config={{
          targetTable: "users",
          displayField: "name",
          multiple: true,
        }}
        onChange={setSelected}
        options={mockUsers}
        placeholder="Select team members..."
        value={selected}
      />
      <SelectedValueDisplay label="Selected IDs" selected={selected} />
    </RelationSelectorStoryWrapper>
  );
}

export const MultiSelect: Story = {
  render: () => <MultiSelectExample />,
};

/**
 * With selected values - shows how selected items appear
 */
function WithSelectedExample() {
  const [selected, setSelected] = useState<string | string[]>(["1", "2", "3"]);

  return (
    <RelationSelectorStoryWrapper>
      <RelationSelector
        config={{
          targetTable: "users",
          displayField: "name",
          multiple: true,
        }}
        onChange={setSelected}
        options={mockUsers}
        placeholder="Select team members..."
        value={selected}
      />
      <SelectedValueDisplay
        label={`${(selected as string[]).length} selected:`}
        selected={selected}
      />
    </RelationSelectorStoryWrapper>
  );
}

export const WithSelected: Story = {
  render: () => <WithSelectedExample />,
};

/**
 * Async search - simulates searching with delay
 */
function AsyncSearchExample() {
  const [selected, setSelected] = useState<string | string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(mockUsers);

  const handleSearch = async (query: string) => {
    if (!query) {
      setSearchResults(mockUsers);
      return;
    }

    setIsSearching(true);
    // Simulate async search
    await new Promise((resolve) => setTimeout(resolve, 500));

    const filtered = mockUsers.filter((user) =>
      user.name.toLowerCase().includes(query.toLowerCase()),
    );
    setSearchResults(filtered);
    setIsSearching(false);
  };

  return (
    <RelationSelectorStoryWrapper>
      <RelationSelector
        config={{
          targetTable: "users",
          displayField: "name",
          multiple: true,
          searchRelated: async (query) => {
            await handleSearch(query);
            return searchResults;
          },
        }}
        onChange={setSelected}
        options={searchResults}
        placeholder="Search users..."
        value={selected}
      />
      {isSearching && (
        <div className="mt-2 text-muted-foreground text-sm">Loading search results...</div>
      )}
      <SelectedValueDisplay selected={selected} />
    </RelationSelectorStoryWrapper>
  );
}

export const AsyncSearch: Story = {
  render: () => <AsyncSearchExample />,
};

/**
 * Single select mode - only one relation can be selected
 */
function SingleSelectExample() {
  const [selected, setSelected] = useState<string | string[]>("");

  return (
    <RelationSelectorStoryWrapper>
      <RelationSelector
        config={{
          targetTable: "users",
          displayField: "name",
          multiple: false,
        }}
        onChange={setSelected}
        options={mockUsers}
        placeholder="Select a user..."
        value={selected}
      />
      <SelectedValueDisplay selected={selected} />
    </RelationSelectorStoryWrapper>
  );
}

export const SingleSelect: Story = {
  render: () => <SingleSelectExample />,
};

/**
 * Custom display field - shows different field (email instead of name)
 */
function CustomDisplayExample() {
  const [selected, setSelected] = useState<string | string[]>([]);

  return (
    <RelationSelectorStoryWrapper>
      <RelationSelector
        config={{
          targetTable: "users",
          displayField: "email", // Display email instead of name
          multiple: true,
        }}
        onChange={setSelected}
        options={mockUsers}
        placeholder="Select by email..."
        value={selected}
      />
      <SelectedValueDisplay selected={selected} />
    </RelationSelectorStoryWrapper>
  );
}

export const CustomDisplay: Story = {
  render: () => <CustomDisplayExample />,
};
