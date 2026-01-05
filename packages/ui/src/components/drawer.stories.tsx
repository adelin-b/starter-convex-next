import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  type DrawerProps,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/drawer";

// Test regex patterns for button matching
const OPEN_BUTTON_PATTERN = /open/i;
const SUBMIT_BUTTON_PATTERN = /submit/i;
const CANCEL_BUTTON_PATTERN = /cancel/i;

/**
 * A drawer component for React.
 */
const meta = {
  title: "ui/Drawer",
  component: Drawer,
  tags: ["autodocs"],
  args: {
    onOpenChange: fn(),
    onClose: fn(),
    onAnimationEnd: fn(),
  },
  render: (args: any) => (
    <Drawer {...args}>
      <DrawerTrigger>Open</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Are you sure absolutely sure?</DrawerTitle>
          <DrawerDescription>This action cannot be undone.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose className="rounded bg-primary px-4 py-2 text-primary-foreground">
            Submit
          </DrawerClose>
          <DrawerClose className="hover:underline">Cancel</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
  parameters: {
    layout: "centered",
  },
} satisfies Meta<DrawerProps>;

export default meta;

type Story = StoryObj<DrawerProps>;

/**
 * The default form of the drawer.
 */
export const Default: Story = {};

export const ShouldOpenCloseWithSubmit: Story = {
  name: "when clicking Submit button, should close the drawer",
  tags: ["!dev", "!autodocs"],
  play: async ({ args, canvasElement, step }: any) => {
    const canvasBody = within(canvasElement.ownerDocument.body);

    await step("Open the drawer", async () => {
      await userEvent.click(await canvasBody.findByRole("button", { name: OPEN_BUTTON_PATTERN }));
      await expect(args.onOpenChange).toHaveBeenCalled();

      const dialog = await canvasBody.findByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute("data-state", "open");
    });

    await step("Close the drawer", async () => {
      await userEvent.click(
        await canvasBody.findByRole("button", { name: SUBMIT_BUTTON_PATTERN }),
        {
          delay: 100,
        },
      );
      await expect(args.onClose).toHaveBeenCalled();
      expect(await canvasBody.findByRole("dialog")).toHaveAttribute("data-state", "closed");
    });
  },
};

export const ShouldOpenCloseWithCancel: Story = {
  name: "when clicking Cancel button, should close the drawer",
  tags: ["!dev", "!autodocs"],
  play: async ({ args, canvasElement, step }: any) => {
    const canvasBody = within(canvasElement.ownerDocument.body);

    await step("Open the drawer", async () => {
      await userEvent.click(await canvasBody.findByRole("button", { name: OPEN_BUTTON_PATTERN }));
      await expect(args.onOpenChange).toHaveBeenCalled();

      const dialog = await canvasBody.findByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute("data-state", "open");
    });

    await step("Close the drawer", async () => {
      await userEvent.click(
        await canvasBody.findByRole("button", { name: CANCEL_BUTTON_PATTERN }),
        {
          delay: 100,
        },
      );
      await expect(args.onClose).toHaveBeenCalled();
      expect(await canvasBody.findByRole("dialog")).toHaveAttribute("data-state", "closed");
    });
  },
};
