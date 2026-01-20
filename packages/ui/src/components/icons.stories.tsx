import type { Meta, StoryObj } from "@storybook/react-vite";
import type { LucideProps } from "lucide-react";

import { Icons } from "./icons";

/**
 * A collection of commonly used icons exported from the application.
 * These are re-exports of Lucide icons with consistent naming.
 */
const meta: Meta = {
  title: "ui/Icons",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const IconDisplay = ({
  name,
  Icon,
  ...props
}: { name: string; Icon: React.FC<LucideProps> } & LucideProps) => (
  <div className="flex flex-col items-center gap-2 p-4">
    <Icon {...props} />
    <span className="text-muted-foreground text-xs">{name}</span>
  </div>
);

/**
 * All available icons in the Icons collection.
 */
export const AllIcons: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <IconDisplay Icon={Icons.SignOut} name="SignOut" />
      <IconDisplay Icon={Icons.Copy} name="Copy" />
      <IconDisplay Icon={Icons.Check} name="Check" />
      <IconDisplay Icon={Icons.Loader} name="Loader" />
    </div>
  ),
};

/**
 * SignOut icon - used for logout actions.
 */
export const SignOut: Story = {
  render: () => <Icons.SignOut className="size-6" />,
};

/**
 * Copy icon - used for copy to clipboard actions.
 */
export const Copy: Story = {
  render: () => <Icons.Copy className="size-6" />,
};

/**
 * Check icon - used for success states and confirmations.
 */
export const Check: Story = {
  render: () => <Icons.Check className="size-6" />,
};

/**
 * Loader icon - animated spinner for loading states.
 */
export const Loader: Story = {
  render: () => <Icons.Loader className="size-6 animate-spin" />,
};

/**
 * Icons with different sizes.
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <Icons.Check className="size-4" />
      <Icons.Check className="size-5" />
      <Icons.Check className="size-6" />
      <Icons.Check className="size-8" />
      <Icons.Check className="size-10" />
    </div>
  ),
};

/**
 * Icons with different colors.
 */
export const Colors: Story = {
  render: () => (
    <div className="flex gap-4">
      <Icons.Check className="size-6 text-primary" />
      <Icons.Check className="size-6 text-destructive" />
      <Icons.Check className="size-6 text-green-500" />
      <Icons.Check className="size-6 text-muted-foreground" />
    </div>
  ),
};
