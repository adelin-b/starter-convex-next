import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { RelationCell } from "./relation-cell";
import { RelationSelector } from "./relation-selector";

const meta: Meta<typeof RelationCell> = {
  title: "composite/Datatable/RelationCell",
  component: RelationCell,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data
const mockUsers = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com" },
  { id: "2", name: "Bob Smith", email: "bob@example.com" },
  { id: "3", name: "Carol White", email: "carol@example.com" },
  { id: "4", name: "David Brown", email: "david@example.com" },
  { id: "5", name: "Eve Davis", email: "eve@example.com" },
];

const mockProjects = [
  { id: "p1", title: "Project Alpha", status: "active" },
  { id: "p2", title: "Project Beta", status: "planning" },
  { id: "p3", title: "Project Gamma", status: "completed" },
];

/**
 * Single relation - displays one related record
 */
export const SingleRelation: Story = {
  args: {
    value: "1",
    resolvedData: mockUsers,
    config: {
      targetTable: "users",
      displayField: "name",
      multiple: false,
    },
    onRelationClick: (id: string, data?: Record<string, unknown>) => {
      console.log("Clicked relation:", id, data);
    },
  },
};

/**
 * Multiple relations - displays several related records as badges
 */
export const MultipleRelations: Story = {
  args: {
    value: ["1", "2", "3"],
    resolvedData: mockUsers,
    config: {
      targetTable: "users",
      displayField: "name",
      multiple: true,
    },
    onRelationClick: (id: string, data?: Record<string, unknown>) => {
      console.log("Clicked relation:", id, data);
    },
  },
};

/**
 * Many relations - shows truncation with "+N more" when maxDisplay is exceeded
 */
export const ManyRelations: Story = {
  args: {
    value: ["1", "2", "3", "4", "5"],
    resolvedData: mockUsers,
    config: {
      targetTable: "users",
      displayField: "name",
      multiple: true,
    },
    maxDisplay: 2,
    onRelationClick: (id: string, data?: Record<string, unknown>) => {
      console.log("Clicked relation:", id, data);
    },
  },
};

/**
 * Clickable relation badges - click to view related record
 */
export const Clickable: Story = {
  args: {
    value: ["1", "2"],
    resolvedData: mockUsers,
    config: {
      targetTable: "users",
      displayField: "name",
      multiple: true,
    },
    onRelationClick: (id: string, data?: Record<string, unknown>) => {
      console.log(`Clicked relation: ${data?.name || id}`);
    },
  },
};

/**
 * Edit mode - allows removing relations
 */
export const EditMode: Story = {
  args: {
    value: ["1", "2", "3"],
    resolvedData: mockUsers,
    config: {
      targetTable: "users",
      displayField: "name",
      multiple: true,
    },
    isEditing: true,
    onRemove: (id: string) => {
      console.log("Remove relation:", id);
    },
  },
};

/**
 * Empty state - no relations selected
 */
export const Empty: Story = {
  args: {
    value: [],
    resolvedData: [],
    config: {
      targetTable: "users",
      displayField: "name",
      multiple: true,
    },
  },
};

/**
 * Loading state - data not yet resolved
 */
export const Loading: Story = {
  args: {
    value: ["1", "2"],
    resolvedData: undefined, // No data loaded yet
    config: {
      targetTable: "users",
      displayField: "name",
      multiple: true,
    },
  },
};

/**
 * Projects relation - different target table
 */
export const ProjectsRelation: Story = {
  args: {
    value: ["p1", "p2"],
    resolvedData: mockProjects,
    config: {
      targetTable: "projects",
      displayField: "title",
      multiple: true,
    },
    onRelationClick: (id: string, data?: Record<string, unknown>) => {
      console.log("Navigate to project:", id, data);
    },
  },
};

/**
 * Interactive example with RelationSelector
 */
function InteractiveExample() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>(["1", "2"]);

  return (
    <div className="w-[600px] space-y-4">
      <div>
        <h3 className="mb-2 font-semibold text-sm">Relation Selector</h3>
        <RelationSelector
          config={{
            targetTable: "users",
            displayField: "name",
            multiple: true,
          }}
          onChange={(value) => setSelectedUsers(value as string[])}
          options={mockUsers}
          placeholder="Select team members..."
          value={selectedUsers}
        />
      </div>

      <div>
        <h3 className="mb-2 font-semibold text-sm">Relation Cell (Display)</h3>
        <RelationCell
          config={{
            targetTable: "users",
            displayField: "name",
            multiple: true,
          }}
          onRelationClick={(_id, data) => {
            console.log("View user profile:", data);
          }}
          resolvedData={mockUsers}
          value={selectedUsers}
        />
      </div>

      <div>
        <h3 className="mb-2 font-semibold text-sm">Relation Cell (Edit Mode)</h3>
        <RelationCell
          config={{
            targetTable: "users",
            displayField: "name",
            multiple: true,
          }}
          isEditing
          onRemove={(id) => {
            setSelectedUsers(selectedUsers.filter((userId) => userId !== id));
          }}
          resolvedData={mockUsers}
          value={selectedUsers}
        />
      </div>

      <div className="rounded-md border bg-muted/50 p-3 text-muted-foreground text-sm">
        <div className="font-semibold">Selected IDs:</div>
        <code className="text-xs">{JSON.stringify(selectedUsers)}</code>
      </div>
    </div>
  );
}

export const Interactive: Story = {
  render: () => <InteractiveExample />,
};
