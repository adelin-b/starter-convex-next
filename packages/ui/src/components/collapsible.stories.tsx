import type { Meta, StoryObj } from "@storybook/react-vite";
import { Info } from "lucide-react";
import { expect, userEvent, within } from "storybook/test";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/collapsible";

const YES_TEXT_PATTERN = /yes/i;

/**
 * An interactive component which expands/collapses a panel.
 */
const meta: Meta<typeof Collapsible> = {
  title: "ui/Collapsible",
  component: Collapsible,
  tags: ["autodocs"],
  argTypes: {},
  args: {
    className: "w-96",
    disabled: false,
  },
  render: (args) => (
    <Collapsible {...args}>
      <CollapsibleTrigger className="flex gap-2">
        <h3 className="font-semibold">Can I use this in my project?</h3>
        <Info className="size-6" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        Yes. Free to use for personal and commercial projects. No attribution required.
      </CollapsibleContent>
    </Collapsible>
  ),
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the collapsible.
 */
export const Default: Story = {};

/**
 * Use the `disabled` prop to disable the interaction.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const ShouldOpenClose: Story = {
  name: "when collapsable trigger is clicked, should show content",
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole("button");

    await step("Open the collapsible", async () => {
      await userEvent.click(trigger, { delay: 100 });
      expect(await canvas.queryByText(YES_TEXT_PATTERN, { exact: true })).toBeVisible();
    });

    await step("Close the collapsible", async () => {
      await userEvent.click(trigger, { delay: 100 });
      expect(await canvas.queryByText(YES_TEXT_PATTERN, { exact: true })).toBeNull();
    });
  },
};
