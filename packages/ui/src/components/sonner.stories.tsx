import type { Meta, StoryObj } from "@storybook/react-vite";
import { toast } from "sonner";

import { Button } from "./button";
import { Toaster } from "./sonner";

/**
 * Toast notifications using Sonner. The Toaster component should be placed at the root
 * of your application. Use the `toast` function from 'sonner' to trigger notifications.
 */
const meta: Meta<typeof Toaster> = {
  title: "ui/Sonner",
  component: Toaster,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="min-h-[200px] w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Toaster>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Default toast notification.
 */
export const Default: Story = {
  render: () => (
    <>
      <Toaster />
      <Button onClick={() => toast("Event has been created")}>Show Toast</Button>
    </>
  ),
};

/**
 * Toast with title and description.
 */
export const WithDescription: Story = {
  render: () => (
    <>
      <Toaster />
      <Button
        onClick={() =>
          toast("Event Created", {
            description: "Monday, January 6, 2025 at 9:00 AM",
          })
        }
      >
        Show Toast with Description
      </Button>
    </>
  ),
};

/**
 * Success toast for successful operations.
 */
export const Success: Story = {
  render: () => (
    <>
      <Toaster />
      <Button
        onClick={() =>
          toast.success("Success", {
            description: "Your changes have been saved.",
          })
        }
        variant="default"
      >
        Show Success Toast
      </Button>
    </>
  ),
};

/**
 * Error toast for failed operations.
 */
export const Error: Story = {
  render: () => (
    <>
      <Toaster />
      <Button
        onClick={() =>
          toast.error("Error", {
            description: "Something went wrong. Please try again.",
          })
        }
        variant="destructive"
      >
        Show Error Toast
      </Button>
    </>
  ),
};

/**
 * Toast with an action button.
 */
export const WithAction: Story = {
  render: () => (
    <>
      <Toaster />
      <Button
        onClick={() =>
          toast("File deleted", {
            description: "The file has been moved to trash.",
            action: {
              label: "Undo",
              onClick: () => toast.success("Undo successful"),
            },
          })
        }
      >
        Show Toast with Action
      </Button>
    </>
  ),
};

/**
 * Loading toast for async operations.
 */
export const Loading: Story = {
  render: () => (
    <>
      <Toaster />
      <Button
        onClick={() => {
          const toastId = toast.loading("Uploading...");
          setTimeout(() => {
            toast.success("Upload complete!", { id: toastId });
          }, 2000);
        }}
      >
        Show Loading Toast
      </Button>
    </>
  ),
};

/**
 * Promise toast for async operations with automatic state updates.
 */
export const PromiseToast: Story = {
  render: () => (
    <>
      <Toaster />
      <Button
        onClick={() => {
          const asyncTask = new globalThis.Promise<void>((resolve) => setTimeout(resolve, 2000));
          toast.promise(asyncTask, {
            loading: "Saving changes...",
            success: "Changes saved!",
            error: "Failed to save changes",
          });
        }}
      >
        Show Promise Toast
      </Button>
    </>
  ),
};

/**
 * All toast types in one view.
 */
export const AllTypes: Story = {
  render: () => (
    <>
      <Toaster />
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => toast("Default toast")} variant="outline">
          Default
        </Button>
        <Button onClick={() => toast.success("Success!")} variant="outline">
          Success
        </Button>
        <Button onClick={() => toast.error("Error!")} variant="outline">
          Error
        </Button>
        <Button onClick={() => toast.warning("Warning!")} variant="outline">
          Warning
        </Button>
        <Button onClick={() => toast.info("Info")} variant="outline">
          Info
        </Button>
      </div>
    </>
  ),
};
