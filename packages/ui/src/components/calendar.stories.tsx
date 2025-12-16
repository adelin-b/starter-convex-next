import type { Meta, StoryObj } from "@storybook/react-vite";
import { addDays } from "date-fns";
import { action } from "storybook/actions";
import { expect, userEvent, within } from "storybook/test";
import { Calendar, type CalendarProps } from "@/components/calendar";

// Constants for date offsets
const TWO_DAYS = 2;
const THREE_DAYS = 3;
const FIVE_DAYS = 5;
const SEVEN_DAYS = 7;
const EIGHT_DAYS = 8;

// Constants for navigation test
const TEST_YEAR = 2000;
const TEST_MONTH = 8;

// Regex patterns for testing
const YEAR_PATTERN = /2000/i;
const PREVIOUS_BUTTON_PATTERN = /previous/i;
const NEXT_BUTTON_PATTERN = /next/i;

/**
 * A date field component that allows users to enter and edit date.
 */
const meta = {
  title: "ui/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  argTypes: {
    mode: {
      table: {
        disable: true,
      },
    },
    disabled: {
      control: "boolean",
    },
    numberOfMonths: {
      control: "number",
      description: "Number of months to display",
    },
    showOutsideDays: {
      control: "boolean",
      description: "Show days that fall outside the current month",
    },
  },
  args: {
    mode: "single",
    selected: new Date(),
    onSelect: action("onDayClick"),
    className: "rounded-md border w-fit",
    disabled: false,
    numberOfMonths: 1,
    showOutsideDays: true,
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<CalendarProps>;

export default meta;

type Story = StoryObj<CalendarProps>;

/**
 * The default form of the calendar.
 */
export const Default: Story = {};

/**
 * Use the `multiple` mode to select multiple dates.
 */
export const Multiple: Story = {
  args: {
    min: 1,
    selected: [new Date(), addDays(new Date(), TWO_DAYS), addDays(new Date(), EIGHT_DAYS)],
    mode: "multiple",
  },
};

/**
 * Use the `range` mode to select a range of dates.
 */
export const Range: Story = {
  args: {
    selected: {
      from: new Date(),
      to: addDays(new Date(), SEVEN_DAYS),
    },
    mode: "range",
  },
};

/**
 * Use the `disabled` prop to disable specific dates.
 */
export const Disabled: Story = {
  args: {
    disabled: [
      addDays(new Date(), 1),
      addDays(new Date(), TWO_DAYS),
      addDays(new Date(), THREE_DAYS),
      addDays(new Date(), FIVE_DAYS),
    ],
  },
};

/**
 * Use the `numberOfMonths` prop to display multiple months.
 */
export const MultipleMonths: Story = {
  args: {
    numberOfMonths: 2,
    showOutsideDays: false,
  },
};

export const ShouldNavigateMonthsWhenClicked: Story = {
  name: "when using the calendar navigation, should change months",
  tags: ["!dev", "!autodocs"],
  args: {
    defaultMonth: new Date(TEST_YEAR, TEST_MONTH),
  },
  play: async ({ canvasElement }: any) => {
    const canvas = within(canvasElement);
    const title = await canvas.findByText(YEAR_PATTERN);
    const startTitle = title.textContent || "";
    const backBtn = await canvas.findByRole("button", {
      name: PREVIOUS_BUTTON_PATTERN,
    });
    const nextBtn = await canvas.findByRole("button", {
      name: NEXT_BUTTON_PATTERN,
    });
    const steps = 6;
    for (let i = 0; i < steps / 2; i += 1) {
      await userEvent.click(backBtn);
      expect(title).not.toHaveTextContent(startTitle);
    }
    for (let i = 0; i < steps; i += 1) {
      await userEvent.click(nextBtn);
      if (i === steps / 2 - 1) {
        expect(title).toHaveTextContent(startTitle);
        continue;
      }
      expect(title).not.toHaveTextContent(startTitle);
    }
  },
};
