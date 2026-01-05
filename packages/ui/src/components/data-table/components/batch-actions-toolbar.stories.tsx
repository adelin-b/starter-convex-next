import type { Meta, StoryObj } from "@storybook/react-vite";
import { Archive, Mail, UserCheck } from "lucide-react";
import { BatchActionsToolbar } from "./batch-actions-toolbar";

const meta: Meta<typeof BatchActionsToolbar> = {
  title: "composite/Datatable/BatchActionsToolbar",
  component: BatchActionsToolbar,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data type
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

// Sample selected rows
const sampleUsers: User[] = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com", role: "Admin" },
  { id: "2", name: "Bob Smith", email: "bob@example.com", role: "Editor" },
  {
    id: "3",
    name: "Carol Williams",
    email: "carol@example.com",
    role: "Viewer",
  },
];

/**
 * Default BatchActionsToolbar with default actions.
 * Shows Delete, Export, and Bulk Edit buttons.
 */
export const Default: Story = {
  args: {
    selectedCount: 3,
    totalCount: 50,
    selectedRows: sampleUsers,
    onClearSelection: () => {
      console.log("Clear selection clicked");
      console.log("Selection cleared");
    },
    showDefaultActions: true,
    onDelete: (rows: unknown[]) => {
      console.log("Delete clicked:", rows);
      console.log(`Deleting ${rows.length} users`);
    },
    onExport: (rows: unknown[]) => {
      console.log("Export clicked:", rows);
      console.log(`Exporting ${rows.length} users`);
    },
    onBulkEdit: (rows: unknown[]) => {
      console.log("Bulk edit clicked:", rows);
      console.log(`Bulk editing ${rows.length} users`);
    },
  },
};

/**
 * BatchActionsToolbar with only custom actions.
 * Shows Archive and Send Email buttons.
 */
export const CustomActions: Story = {
  args: {
    selectedCount: 5,
    totalCount: 100,
    selectedRows: sampleUsers,
    onClearSelection: () => {
      console.log("Selection cleared");
    },
    showDefaultActions: false,
    batchActions: [
      {
        action: "archive",
        label: "Archive",
        icon: Archive,
        variant: "outline",
        onClick: (rows: unknown[]) => {
          console.log(`Archiving ${rows.length} users`);
        },
      },
      {
        action: "email",
        label: "Send Email",
        icon: Mail,
        variant: "default",
        onClick: (rows: unknown[]) => {
          console.log(`Sending email to ${rows.length} users`);
        },
      },
    ],
  },
};

/**
 * BatchActionsToolbar with mixed actions.
 * Shows both default and custom actions.
 */
export const MixedActions: Story = {
  args: {
    selectedCount: 8,
    totalCount: 75,
    selectedRows: sampleUsers,
    onClearSelection: () => {
      console.log("Selection cleared");
    },
    showDefaultActions: true,
    onDelete: (rows: unknown[]) => {
      console.log(`Deleting ${rows.length} users`);
    },
    onExport: (rows: unknown[]) => {
      console.log(`Exporting ${rows.length} users`);
    },
    batchActions: [
      {
        action: "activate",
        label: "Activate",
        icon: UserCheck,
        variant: "secondary",
        onClick: (rows: unknown[]) => {
          console.log(`Activating ${rows.length} users`);
        },
      },
    ],
  },
};

/**
 * BatchActionsToolbar with select all option.
 * Shows "Select all X rows" button when not all rows are selected.
 */
export const WithSelectAll: Story = {
  args: {
    selectedCount: 10,
    totalCount: 50,
    selectedRows: sampleUsers,
    onClearSelection: () => {
      console.log("Selection cleared");
    },
    onSelectAll: () => {
      console.log("Select all clicked");
      console.log("Selecting all 50 rows");
    },
    showDefaultActions: true,
    onDelete: (rows: unknown[]) => {
      console.log(`Deleting ${rows.length} users`);
    },
  },
};

/**
 * BatchActionsToolbar with all rows selected.
 * No "Select all" button shown when all rows are already selected.
 */
export const AllSelected: Story = {
  args: {
    selectedCount: 50,
    totalCount: 50,
    selectedRows: sampleUsers,
    onClearSelection: () => {
      console.log("Selection cleared");
    },
    onSelectAll: () => {
      console.log("All already selected");
    },
    showDefaultActions: true,
    onDelete: (rows: unknown[]) => {
      console.log(`Deleting ${rows.length} users`);
    },
  },
};

/**
 * BatchActionsToolbar with single row selected.
 * Shows singular "row" text instead of plural "rows".
 */
export const SingleSelection: Story = {
  args: {
    selectedCount: 1,
    totalCount: 50,
    selectedRows: [sampleUsers[0]!],
    onClearSelection: () => {
      console.log("Selection cleared");
    },
    showDefaultActions: true,
    onDelete: (rows: unknown[]) => {
      console.log(`Deleting ${rows.length} user`);
    },
  },
};

/**
 * BatchActionsToolbar with disabled action.
 * Shows how actions can be conditionally disabled based on selection.
 */
export const WithDisabledAction: Story = {
  args: {
    selectedCount: 3,
    totalCount: 50,
    selectedRows: sampleUsers,
    onClearSelection: () => {
      console.log("Selection cleared");
    },
    showDefaultActions: false,
    batchActions: [
      {
        action: "delete",
        label: "Delete",
        variant: "destructive",
        onClick: (rows: unknown[]) => {
          console.log(`Deleting ${rows.length} users`);
        },
      },
      {
        action: "change-role",
        label: "Change Role",
        variant: "outline",
        onClick: (rows: unknown[]) => {
          console.log(`Changing role for ${rows.length} users`);
        },
        isDisabled: (rows: unknown[]) => rows.some((u: any) => u.role === "Admin"),
      },
    ],
  },
};

/**
 * BatchActionsToolbar with many actions.
 * Demonstrates wrapping behavior with multiple actions.
 */
export const ManyActions: Story = {
  args: {
    selectedCount: 15,
    totalCount: 100,
    selectedRows: sampleUsers,
    onClearSelection: () => {
      console.log("Selection cleared");
    },
    showDefaultActions: true,
    onDelete: (rows: unknown[]) => {
      console.log(`Deleting ${rows.length} users`);
    },
    onExport: (rows: unknown[]) => {
      console.log(`Exporting ${rows.length} users`);
    },
    onBulkEdit: (rows: unknown[]) => {
      console.log(`Bulk editing ${rows.length} users`);
    },
    batchActions: [
      {
        action: "archive",
        label: "Archive",
        icon: Archive,
        variant: "outline",
        onClick: (rows: unknown[]) => {
          console.log(`Archiving ${rows.length} users`);
        },
      },
      {
        action: "email",
        label: "Send Email",
        icon: Mail,
        variant: "outline",
        onClick: (rows: unknown[]) => {
          console.log(`Emailing ${rows.length} users`);
        },
      },
      {
        action: "activate",
        label: "Activate",
        icon: UserCheck,
        variant: "outline",
        onClick: (rows: unknown[]) => {
          console.log(`Activating ${rows.length} users`);
        },
      },
    ],
  },
};

/**
 * BatchActionsToolbar with no default actions.
 * Only shows selection count and clear button.
 */
export const NoActions: Story = {
  args: {
    selectedCount: 5,
    totalCount: 50,
    selectedRows: sampleUsers,
    onClearSelection: () => {
      console.log("Selection cleared");
    },
    showDefaultActions: false,
    batchActions: [],
  },
};
