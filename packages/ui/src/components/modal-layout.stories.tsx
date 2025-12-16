import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import {
  ModalLayout,
  ModalLayoutActions,
  ModalLayoutFormGrid,
  ModalLayoutSection,
} from "./modal-layout";

/**
 * ModalLayout component for consistent dialog sizing and spacing.
 */
const meta: Meta<typeof ModalLayout> = {
  title: "domain/ModalLayout",
  component: ModalLayout,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl", "full"],
      description: "Modal size preset",
    },
    showHeaderSeparator: {
      control: "boolean",
      description: "Show separator between header and content",
    },
    showFooterSeparator: {
      control: "boolean",
      description: "Show separator between content and footer",
    },
  },
  parameters: {
    layout: "centered",
  },
  args: {
    size: "md",
    showHeaderSeparator: false,
    showFooterSeparator: true,
  },
} satisfies Meta<typeof ModalLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Default modal with form content.
 */
export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Modal</Button>
        <ModalLayout
          {...args}
          description="Configure your new AI voice agent"
          footer={
            <ModalLayoutActions>
              <Button onClick={() => setOpen(false)} variant="outline">
                Cancel
              </Button>
              <Button>Create Agent</Button>
            </ModalLayoutActions>
          }
          onOpenChange={setOpen}
          open={open}
          title="Create Agent"
        >
          <ModalLayoutFormGrid cols={1}>
            <div className="space-y-2">
              <Label htmlFor="name">Agent Name</Label>
              <Input id="name" placeholder="Customer Support Bot" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="voice">Voice Type</Label>
              <Input id="voice" placeholder="Professional Female" />
            </div>
          </ModalLayoutFormGrid>
        </ModalLayout>
      </>
    );
  },
};

/**
 * Large modal with multiple sections.
 */
export const Large: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Large Modal</Button>
        <ModalLayout
          description="Configure all settings for your agent"
          footer={
            <ModalLayoutActions>
              <Button onClick={() => setOpen(false)} variant="outline">
                Cancel
              </Button>
              <Button>Save Changes</Button>
            </ModalLayoutActions>
          }
          onOpenChange={setOpen}
          open={open}
          size="lg"
          title="Agent Configuration"
        >
          <ModalLayoutSection description="Agent identification and description" title="Basic Info">
            <ModalLayoutFormGrid cols={2}>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input placeholder="Agent name" />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Input placeholder="Agent type" />
              </div>
            </ModalLayoutFormGrid>
          </ModalLayoutSection>

          <ModalLayoutSection
            description="Configure voice and speaking style"
            title="Voice Settings"
          >
            <ModalLayoutFormGrid cols={1}>
              <div className="space-y-2">
                <Label>Voice</Label>
                <Input placeholder="Select voice" />
              </div>
            </ModalLayoutFormGrid>
          </ModalLayoutSection>
        </ModalLayout>
      </>
    );
  },
};

/**
 * Small modal for confirmations.
 */
export const Small: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)} variant="destructive">
          Delete
        </Button>
        <ModalLayout
          description="Are you sure you want to delete this agent?"
          footer={
            <ModalLayoutActions>
              <Button onClick={() => setOpen(false)} variant="outline">
                Cancel
              </Button>
              <Button variant="destructive">Delete</Button>
            </ModalLayoutActions>
          }
          onOpenChange={setOpen}
          open={open}
          size="sm"
          title="Delete Agent"
        >
          <p className="text-muted-foreground text-sm">
            This action cannot be undone. All data associated with this agent will be permanently
            deleted.
          </p>
        </ModalLayout>
      </>
    );
  },
};

/**
 * Modal with header separator.
 */
export const WithHeaderSeparator: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Modal</Button>
        <ModalLayout
          description="Update your preferences"
          footer={
            <ModalLayoutActions>
              <Button onClick={() => setOpen(false)} variant="outline">
                Cancel
              </Button>
              <Button>Save</Button>
            </ModalLayoutActions>
          }
          onOpenChange={setOpen}
          open={open}
          showHeaderSeparator
          title="Edit Settings"
        >
          <ModalLayoutFormGrid cols={1}>
            <div className="space-y-2">
              <Label>Setting 1</Label>
              <Input placeholder="Value" />
            </div>
            <div className="space-y-2">
              <Label>Setting 2</Label>
              <Input placeholder="Value" />
            </div>
          </ModalLayoutFormGrid>
        </ModalLayout>
      </>
    );
  },
};

/**
 * Full-width modal for large forms.
 */
export const FullWidth: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Full Width</Button>
        <ModalLayout
          footer={
            <ModalLayoutActions>
              <Button onClick={() => setOpen(false)} variant="outline">
                Cancel
              </Button>
              <Button>Save</Button>
            </ModalLayoutActions>
          }
          onOpenChange={setOpen}
          open={open}
          size="full"
          title="Advanced Configuration"
        >
          <ModalLayoutFormGrid cols={3}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div className="space-y-2" key={i}>
                <Label>Field {i + 1}</Label>
                <Input placeholder={`Value ${i + 1}`} />
              </div>
            ))}
          </ModalLayoutFormGrid>
        </ModalLayout>
      </>
    );
  },
};
