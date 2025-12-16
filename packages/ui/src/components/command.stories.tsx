import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/command";

const CALENDAR_PATTERN = /calendar/i;
const SEARCH_PATTERN = /search/i;
const NO_RESULTS_PATTERN = /no results/i;

/**
 * Fast, composable, unstyled command menu for React.
 */
const meta: Meta<typeof Command> = {
  title: "ui/Command",
  component: Command,
  tags: ["autodocs"],
  argTypes: {},
  args: {
    className: "rounded-lg w-96 border shadow-md",
  },
  render: (args) => (
    <Command {...args}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>Calendar</CommandItem>
          <CommandItem>Search Emoji</CommandItem>
          <CommandItem disabled>Calculator</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>Profile</CommandItem>
          <CommandItem>Billing</CommandItem>
          <CommandItem>Settings</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the command.
 */
export const Default: Story = {};

export const TypingInCombobox: Story = {
  name: "when typing into the combobox, should filter results",
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox");

    // Search for "calendar" which should return a single result
    await userEvent.type(input, "calen", { delay: 100 });
    expect(canvas.getAllByRole("option", { name: CALENDAR_PATTERN })).toHaveLength(1);

    await userEvent.clear(input);

    // Search for "story" which should return multiple results
    await userEvent.type(input, "se", { delay: 100 });
    expect(canvas.getAllByRole("option").length).toBeGreaterThan(1);
    expect(canvas.getAllByRole("option", { name: SEARCH_PATTERN })).toHaveLength(1);

    await userEvent.clear(input);

    // Search for "story" which should return no results
    await userEvent.type(input, "story", { delay: 100 });
    expect(canvas.queryAllByRole("option", { hidden: false })).toHaveLength(0);
    expect(canvas.getByText(NO_RESULTS_PATTERN)).toBeVisible();
  },
};
