import type { Meta, StoryObj } from "@storybook/react-vite";
import { Slider } from "@/components/slider";

const DEFAULT_SLIDER_VALUE = 33;

/**
 * An input where the user selects a value from within a given range.
 */
const meta: Meta<typeof Slider> = {
  title: "ui/Slider",
  component: Slider,
  tags: ["autodocs"],
  argTypes: {},
  args: {
    defaultValue: [DEFAULT_SLIDER_VALUE],
    max: 100,
    step: 1,
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the slider.
 */
export const Default: Story = {};

/**
 * Use the `disabled` prop to disable the slider.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
