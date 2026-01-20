import type { Meta, StoryObj } from "@storybook/react-vite";

import { Logo } from "./logo";

/**
 * The application logo component. Renders an SVG that inherits the primary color.
 */
const meta: Meta<typeof Logo> = {
  title: "ui/Logo",
  component: Logo,
  tags: ["autodocs"],
  argTypes: {
    width: {
      control: { type: "number", min: 16, max: 200, step: 8 },
    },
    height: {
      control: { type: "number", min: 16, max: 200, step: 8 },
    },
    className: {
      control: "text",
    },
  },
  parameters: {
    layout: "centered",
  },
  args: {
    width: 40,
    height: 40,
  },
} satisfies Meta<typeof Logo>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Default logo at the default size (40x40).
 */
export const Default: Story = {};

/**
 * Small logo variant.
 */
export const Small: Story = {
  args: {
    width: 24,
    height: 24,
  },
};

/**
 * Large logo variant.
 */
export const Large: Story = {
  args: {
    width: 80,
    height: 80,
  },
};

/**
 * Logo with custom color using className.
 */
export const CustomColor: Story = {
  args: {
    className: "text-destructive",
  },
};

/**
 * Logo gallery showing various sizes.
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <Logo height={16} width={16} />
      <Logo height={24} width={24} />
      <Logo height={32} width={32} />
      <Logo height={48} width={48} />
      <Logo height={64} width={64} />
      <Logo height={96} width={96} />
    </div>
  ),
};
