import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  AudioLinesIcon,
  BotIcon,
  ChevronDownIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react";
import * as React from "react";
import { Button } from "@/components/button";
import { ButtonGroup, ButtonGroupSeparator } from "@/components/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/dropdown-menu";
import { Input } from "@/components/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/select";
import { Separator } from "@/components/separator";
import { Textarea } from "@/components/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/tooltip";

/**
 * A container that groups related buttons together with consistent styling.
 */
const meta: Meta<typeof ButtonGroup> = {
  title: "ui/ButtonGroup",
  component: ButtonGroup,
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
    },
  },
  parameters: {
    layout: "centered",
  },
  args: {
    orientation: "horizontal",
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default horizontal button group with related action buttons.
 */
export const Default: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="outline">Copy</Button>
      <Button variant="outline">Paste</Button>
      <Button variant="outline">Cut</Button>
    </ButtonGroup>
  ),
};

/**
 * Vertical orientation stacks buttons in a column layout.
 */
export const Orientation: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <Button size="icon" variant="outline">
        <PlusIcon />
      </Button>
      <Button size="icon" variant="outline">
        <MoreHorizontalIcon />
      </Button>
    </ButtonGroup>
  ),
  args: {
    orientation: "vertical",
  },
};

/**
 * Nest ButtonGroup components to create button groups with spacing.
 */
export const Nested: Story = {
  render: () => (
    <ButtonGroup>
      <ButtonGroup>
        <Button size="sm" variant="outline">
          1
        </Button>
        <Button size="sm" variant="outline">
          2
        </Button>
        <Button size="sm" variant="outline">
          3
        </Button>
        <Button size="sm" variant="outline">
          4
        </Button>
        <Button size="sm" variant="outline">
          5
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button aria-label="Previous" size="icon-sm" variant="outline">
          <ArrowLeftIcon />
        </Button>
        <Button aria-label="Next" size="icon-sm" variant="outline">
          <ArrowRightIcon />
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  ),
};

/**
 * Button group with separators to visually divide related button sections.
 */
export const WithSeparator: Story = {
  render: () => (
    <ButtonGroup>
      <Button size="sm" variant="secondary">
        Copy
      </Button>
      <ButtonGroupSeparator />
      <Button size="sm" variant="secondary">
        Paste
      </Button>
    </ButtonGroup>
  ),
};

/**
 * Create a split button group by adding two buttons separated by a separator.
 */
export const Split: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="secondary">Button</Button>
      <ButtonGroupSeparator />
      <Button size="icon" variant="secondary">
        <PlusIcon />
      </Button>
    </ButtonGroup>
  ),
};

/**
 * Wrap an Input component with buttons.
 */
export const WithInput: Story = {
  render: () => (
    <ButtonGroup>
      <Input placeholder="Search..." />
      <Button aria-label="Search" variant="outline">
        <SearchIcon />
      </Button>
    </ButtonGroup>
  ),
};

/**
 * Wrap an InputGroup component to create complex input layouts.
 */
export const WithInputGroup: Story = {
  render: () => {
    const [voiceEnabled, setVoiceEnabled] = React.useState(false);

    return (
      <TooltipProvider>
        <ButtonGroup className="[--radius:9999rem]">
          <ButtonGroup>
            <Button size="icon" variant="outline">
              <PlusIcon />
            </Button>
          </ButtonGroup>
          <ButtonGroup>
            <InputGroup>
              <InputGroupInput
                disabled={voiceEnabled}
                placeholder={voiceEnabled ? "Record and send audio..." : "Send a message..."}
              />
              <InputGroupAddon align="inline-end">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InputGroupButton
                      aria-pressed={voiceEnabled}
                      className="data-[active=true]:bg-orange-100 data-[active=true]:text-orange-700 dark:data-[active=true]:bg-orange-800 dark:data-[active=true]:text-orange-100"
                      data-active={voiceEnabled}
                      onClick={() => setVoiceEnabled(!voiceEnabled)}
                      size="icon-xs"
                    >
                      <AudioLinesIcon />
                    </InputGroupButton>
                  </TooltipTrigger>
                  <TooltipContent>Voice Mode</TooltipContent>
                </Tooltip>
              </InputGroupAddon>
            </InputGroup>
          </ButtonGroup>
        </ButtonGroup>
      </TooltipProvider>
    );
  },
};

/**
 * Create a split button group with a DropdownMenu component.
 */
export const WithDropdownMenu: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Follow</Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="!pl-2" variant="outline">
            <ChevronDownIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="[--radius:1rem]">
          <DropdownMenuItem>Mute Conversation</DropdownMenuItem>
          <DropdownMenuItem>Mark as Read</DropdownMenuItem>
          <DropdownMenuItem>Report Conversation</DropdownMenuItem>
          <DropdownMenuItem>Block User</DropdownMenuItem>
          <DropdownMenuItem>Share Conversation</DropdownMenuItem>
          <DropdownMenuItem>Copy Conversation</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive focus:text-destructive">
            Delete Conversation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  ),
};

/**
 * Pair with a Select component.
 */
export const WithSelect: Story = {
  render: () => {
    const [currency, setCurrency] = React.useState("$");

    const CURRENCIES = [
      { value: "$", label: "US Dollar" },
      { value: "€", label: "Euro" },
      { value: "£", label: "British Pound" },
    ];

    return (
      <ButtonGroup>
        <ButtonGroup>
          <Select onValueChange={setCurrency} value={currency}>
            <SelectTrigger className="font-mono">{currency}</SelectTrigger>
            <SelectContent className="min-w-24">
              {CURRENCIES.map((currencyOption) => (
                <SelectItem key={currencyOption.value} value={currencyOption.value}>
                  {currencyOption.value}{" "}
                  <span className="text-muted-foreground">{currencyOption.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input pattern="[0-9]*" placeholder="10.00" />
        </ButtonGroup>
        <ButtonGroup>
          <Button aria-label="Send" size="icon" variant="outline">
            <ArrowRightIcon />
          </Button>
        </ButtonGroup>
      </ButtonGroup>
    );
  },
};

/**
 * Use with a Popover component.
 */
export const WithPopover: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">
        <BotIcon /> Copilot
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button aria-label="Open Popover" size="icon" variant="outline">
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="rounded-xl p-0 text-sm">
          <div className="px-4 py-3">
            <div className="font-medium text-sm">Agent Tasks</div>
          </div>
          <Separator />
          <div className="p-4 text-sm *:[p:not(:last-child)]:mb-2">
            <Textarea
              className="mb-4 resize-none"
              placeholder="Describe your task in natural language."
            />
            <p className="font-medium">Start a new task with Copilot</p>
            <p className="text-muted-foreground">
              Describe your task in natural language. Copilot will work in the background and open a
              pull request for your review.
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </ButtonGroup>
  ),
};
