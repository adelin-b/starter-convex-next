import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Button } from "./button";
import { ConfirmDialog, useConfirmDialog } from "./confirm-dialog";

const ASYNC_OPERATION_DELAY_MS = 1000;

/**
 * ConfirmDialog component for user confirmations with different severity levels.
 */
const meta: Meta<typeof ConfirmDialog> = {
  title: "domain/ConfirmDialog",
  component: ConfirmDialog,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["destructive", "warning", "info"],
      description: "Visual severity of the confirmation",
    },
    title: {
      control: "text",
      description: "Dialog title",
    },
    description: {
      control: "text",
      description: "Dialog description text",
    },
    confirmText: {
      control: "text",
      description: "Confirm button text",
    },
    cancelText: {
      control: "text",
      description: "Cancel button text",
    },
    loading: {
      control: "boolean",
      description: "Loading state during async operations",
    },
  },
  parameters: {
    layout: "centered",
  },
  args: {
    title: "Are you sure?",
    description: "This action requires your confirmation to proceed.",
    confirmText: "Confirm",
    cancelText: "Cancel",
    variant: "info",
    loading: false,
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Default info variant for general confirmations.
 */
export const Default: Story = {
  render: (args) => (
    <ConfirmDialog
      {...args}
      onConfirm={() => {
        console.log("Confirmed!");
      }}
    >
      <Button>Open Dialog</Button>
    </ConfirmDialog>
  ),
};

/**
 * Destructive variant for dangerous actions like deletions.
 */
export const Destructive: Story = {
  render: (args) => (
    <ConfirmDialog
      {...args}
      confirmText="Delete"
      description="This will permanently delete the agent. This action cannot be undone."
      onConfirm={() => {
        console.log("Deleted!");
      }}
      title="Delete Agent"
      variant="destructive"
    >
      <Button variant="destructive">Delete Agent</Button>
    </ConfirmDialog>
  ),
};

/**
 * Warning variant for actions that need caution but aren't destructive.
 */
export const Warning: Story = {
  render: (args) => (
    <ConfirmDialog
      {...args}
      confirmText="Archive"
      description="Archiving will disable this agent. You can restore it later from the archive."
      onConfirm={() => {
        console.log("Archived!");
      }}
      title="Archive Agent"
      variant="warning"
    >
      <Button variant="outline">Archive Agent</Button>
    </ConfirmDialog>
  ),
};

/**
 * Loading state during async operations.
 */
export const Loading: Story = {
  render: (args) => (
    <ConfirmDialog
      {...args}
      description="Please wait while we process your request..."
      loading
      onConfirm={() => {
        console.log("Processing...");
      }}
      title="Processing Action"
    >
      <Button>Start Process</Button>
    </ConfirmDialog>
  ),
};

/**
 * Controlled usage with state management.
 */
export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [result, setResult] = useState("");

    return (
      <div className="flex flex-col items-center gap-4">
        <Button onClick={() => setOpen(true)}>Open Controlled Dialog</Button>
        {result && <p className="text-muted-foreground text-sm">Result: {result}</p>}
        <ConfirmDialog
          confirmText="Save"
          description="Do you want to save your changes before leaving?"
          onConfirm={() => {
            setResult("Changes saved!");
            setOpen(false);
          }}
          onOpenChange={setOpen}
          open={open}
          title="Save Changes"
          variant="info"
        />
      </div>
    );
  },
};

/**
 * Using the useConfirmDialog hook for imperative dialogs.
 */
export const WithHook: Story = {
  render: () => {
    const { confirm, dialog } = useConfirmDialog();
    const [result, setResult] = useState("");

    const handleDelete = async () => {
      await confirm({
        title: "Delete Item",
        description: "This will permanently delete the item. Continue?",
        confirmText: "Delete",
        variant: "destructive",
        onConfirm: async () => {
          // Simulate async operation
          await new Promise((resolve) => setTimeout(resolve, ASYNC_OPERATION_DELAY_MS));
          setResult("Item deleted!");
        },
      });
    };

    const handleArchive = async () => {
      await confirm({
        title: "Archive Item",
        description: "Archive this item? You can restore it later.",
        confirmText: "Archive",
        variant: "warning",
        onConfirm: async () => {
          await new Promise((resolve) => setTimeout(resolve, ASYNC_OPERATION_DELAY_MS));
          setResult("Item archived!");
        },
      });
    };

    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-2">
          <Button onClick={handleDelete} variant="destructive">
            Delete (Hook)
          </Button>
          <Button onClick={handleArchive} variant="outline">
            Archive (Hook)
          </Button>
        </div>
        {result && <p className="text-muted-foreground text-sm">Result: {result}</p>}
        {dialog}
      </div>
    );
  },
};

/**
 * Custom button labels for different contexts.
 */
export const CustomLabels: Story = {
  render: (args) => (
    <ConfirmDialog
      {...args}
      cancelText="Stay on Page"
      confirmText="Leave Anyway"
      description="You have unsaved changes. Are you sure you want to leave?"
      onConfirm={() => {
        console.log("Leaving page...");
      }}
      title="Leave Page"
      variant="warning"
    >
      <Button variant="outline">Navigate Away</Button>
    </ConfirmDialog>
  ),
};
