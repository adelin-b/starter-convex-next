import type { Meta, StoryObj } from "@storybook/react-vite";
import { AspectRatio } from "@/components/aspect-ratio";

// Common aspect ratio constants
const RATIO_16_9_WIDTH = 16;
const RATIO_16_9_HEIGHT = 9;
const RATIO_4_3_WIDTH = 4;
const RATIO_4_3_HEIGHT = 3;
const RATIO_CINEMASCOPE_WIDTH = 2.35;
const RATIO_CINEMASCOPE_HEIGHT = 1;

// Image dimensions for layout stability
const IMAGE_WIDTH = 800;
const IMAGE_HEIGHT = 450;

/**
 * Displays content within a desired ratio.
 */
const meta: Meta<typeof AspectRatio> = {
  title: "ui/AspectRatio",
  component: AspectRatio,
  tags: ["autodocs"],
  argTypes: {},
  render: (args) => (
    <AspectRatio {...args} className="bg-slate-50 dark:bg-slate-800">
      <img
        alt="Landscape by Alvaro Pinot"
        className="h-full w-full rounded-md object-cover"
        height={IMAGE_HEIGHT}
        src="https://images.unsplash.com/photo-1576075796033-848c2a5f3696?w=800&dpr=2&q=80"
        width={IMAGE_WIDTH}
      />
    </AspectRatio>
  ),
  decorators: [
    (StoryComponent) => (
      <div className="w-1/2">
        <StoryComponent />
      </div>
    ),
  ],
} satisfies Meta<typeof AspectRatio>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the aspect ratio.
 */
export const Default: Story = {
  args: {
    ratio: RATIO_16_9_WIDTH / RATIO_16_9_HEIGHT,
  },
};

/**
 * Use the `1:1` aspect ratio to display a square image.
 */
export const Square: Story = {
  args: {
    ratio: 1,
  },
};

/**
 * Use the `4:3` aspect ratio to display a landscape image.
 */
export const Landscape: Story = {
  args: {
    ratio: RATIO_4_3_WIDTH / RATIO_4_3_HEIGHT,
  },
};

/**
 * Use the `2.35:1` aspect ratio to display a cinemascope image.
 */
export const Cinemascope: Story = {
  args: {
    ratio: RATIO_CINEMASCOPE_WIDTH / RATIO_CINEMASCOPE_HEIGHT,
  },
};
