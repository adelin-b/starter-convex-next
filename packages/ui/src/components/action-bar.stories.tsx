import type { Meta, StoryObj } from "@storybook/react-vite";
import { Trash2 } from "lucide-react";

import { ActionBar, ActionBarPrimary, ActionBarSecondary, ActionBarSticky } from "./action-bar";
import { Button } from "./button";

/**
 * ActionBar component for consistent action button groups with flexible alignment.
 */
const meta: Meta<typeof ActionBar> = {
  title: "domain/ActionBar",
  component: ActionBar,
  tags: ["autodocs"],
  argTypes: {
    align: {
      control: "select",
      options: ["left", "center", "right", "between"],
      description: "Alignment of action buttons",
    },
    wrap: {
      control: "boolean",
      description: "Whether buttons should wrap on narrow screens",
    },
  },
  parameters: {
    layout: "padded",
  },
  args: {
    align: "right",
    wrap: false,
  },
} satisfies Meta<typeof ActionBar>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default action bar with right-aligned buttons (most common pattern).
 */
export const Default: Story = {
  render: (args) => (
    <ActionBar {...args}>
      <Button variant="outline">Cancel</Button>
      <Button>Save Changes</Button>
    </ActionBar>
  ),
};

/**
 * Left-aligned action bar for forms or lists where actions are on the left.
 */
export const AlignLeft: Story = {
  render: (args) => (
    <ActionBar {...args} align="left">
      <Button>Create New</Button>
      <Button variant="outline">Import</Button>
    </ActionBar>
  ),
};

/**
 * Center-aligned action bar for modals or centered layouts.
 */
export const AlignCenter: Story = {
  render: (args) => (
    <ActionBar {...args} align="center">
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </ActionBar>
  ),
};

/**
 * Between alignment with actions on both sides - destructive action on left, primary on right.
 */
export const AlignBetween: Story = {
  render: (args) => (
    <ActionBar {...args} align="between">
      <Button variant="destructive">
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </Button>
      <div className="flex gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Save</Button>
      </div>
    </ActionBar>
  ),
};

/**
 * Action bar with wrap enabled for responsive layouts with many buttons.
 */
export const WithWrap: Story = {
  render: (args) => (
    <ActionBar {...args} wrap>
      <Button variant="outline">Cancel</Button>
      <Button variant="outline">Save Draft</Button>
      <Button variant="outline">Preview</Button>
      <Button>Publish</Button>
    </ActionBar>
  ),
};

/**
 * Using ActionBarPrimary and ActionBarSecondary for semantic grouping.
 */
export const WithGroups: Story = {
  render: () => (
    <ActionBar align="between">
      <ActionBarSecondary>
        <Button variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </ActionBarSecondary>
      <ActionBarPrimary>
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </ActionBarPrimary>
    </ActionBar>
  ),
};

/**
 * Sticky action bar that stays at the bottom of the viewport.
 */
export const Sticky: Story = {
  render: () => (
    <div className="relative h-[400px] overflow-auto rounded-lg border">
      <div className="space-y-4 p-6">
        <h2 className="font-bold text-2xl">Form Title</h2>
        <p>Scroll down to see the sticky action bar...</p>
        {Array.from({ length: 20 }).map((_, i) => (
          <p className="text-muted-foreground" key={i}>
            Form field {i + 1} content here...
          </p>
        ))}
      </div>
      <ActionBarSticky align="right">
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </ActionBarSticky>
    </div>
  ),
  parameters: {
    layout: "centered",
  },
};

/**
 * Multiple action states - disabled, loading, icons.
 */
export const WithStates: Story = {
  render: (args) => (
    <ActionBar {...args}>
      <Button disabled variant="outline">
        Disabled
      </Button>
      <Button variant="outline">
        <Trash2 className="mr-2 h-4 w-4" />
        With Icon
      </Button>
      <Button>Save</Button>
    </ActionBar>
  ),
};
