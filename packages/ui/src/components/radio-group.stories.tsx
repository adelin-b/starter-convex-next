import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Label } from "@/components/label";
import { RadioGroup, RadioGroupItem } from "@/components/radio-group";

const EXPECTED_RADIO_COUNT = 3;

/**
 * A set of checkable buttons—known as radio buttons—where no more than one of
 * the buttons can be checked at a time.
 */
const meta: Meta<typeof RadioGroup> = {
  title: "ui/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  argTypes: {},
  args: {
    defaultValue: "comfortable",
    className: "grid gap-2 grid-cols-[1rem_1fr] items-center",
  },
  render: (args: any) => (
    <RadioGroup {...args}>
      <RadioGroupItem id="r1" value="default" />
      <Label htmlFor="r1">Default</Label>
      <RadioGroupItem id="r2" value="comfortable" />
      <Label htmlFor="r2">Comfortable</Label>
      <RadioGroupItem id="r3" value="compact" />
      <Label htmlFor="r3">Compact</Label>
    </RadioGroup>
  ),
};

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the radio group.
 */
export const Default: Story = {};

export const ShouldToggleRadio: Story = {
  name: "when clicking on a radio button, it should toggle its state",
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const radios = await canvas.findAllByRole("radio");
    expect(radios).toHaveLength(EXPECTED_RADIO_COUNT);

    await step("click the default radio button", async () => {
      await userEvent.click(radios[0]!);
      await waitFor(() => expect(radios[0]).toBeChecked());
      await waitFor(() => expect(radios[1]).not.toBeChecked());
    });

    await step("click the comfortable radio button", async () => {
      await userEvent.click(radios[1]!);
      await waitFor(() => expect(radios[1]).toBeChecked());
      await waitFor(() => expect(radios[0]).not.toBeChecked());
    });
  },
};
