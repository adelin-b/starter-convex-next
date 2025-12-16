import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bell, Calendar, Settings, User } from "lucide-react";
import React from "react";
import { Button } from "./button";
import {
  MorphingPopover,
  MorphingPopoverContent,
  MorphingPopoverTrigger,
} from "./morphing-popover";

/**
 * A morphing popover component with smooth animations that transitions from a
 * trigger element into a popover using Framer Motion layout animations.
 */
const meta: Meta<typeof MorphingPopover> = {
  title: "ui/MorphingPopover",
  component: MorphingPopover,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    viewport: {
      defaultViewport: "responsive",
    },
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-[600px] items-center justify-center">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MorphingPopover>;

export default meta;

type MorphingPopoverStory = StoryObj<typeof meta>;

/**
 * Basic morphing popover with simple content.
 */
export const Default: MorphingPopoverStory = {
  render: () => (
    <MorphingPopover>
      <MorphingPopoverTrigger className="rounded-md bg-zinc-900 px-4 py-2 font-medium text-sm text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
        Open Popover
      </MorphingPopoverTrigger>
      <MorphingPopoverContent className="w-64">
        <div className="space-y-2">
          <h3 className="font-semibold">Popover Title</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            This is a morphing popover that smoothly transitions from the trigger button. It uses
            Framer Motion for seamless animations.
          </p>
        </div>
      </MorphingPopoverContent>
    </MorphingPopover>
  ),
};

/**
 * Morphing popover with menu items and icons.
 */
export const MenuStyle: MorphingPopoverStory = {
  render: () => (
    <MorphingPopover>
      <MorphingPopoverTrigger className="flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 font-medium text-sm text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
        <Settings className="h-4 w-4" />
        Settings
      </MorphingPopoverTrigger>
      <MorphingPopoverContent className="w-56">
        <div className="flex flex-col gap-1">
          <Button className="justify-start gap-2" size="sm" variant="ghost">
            <User className="h-4 w-4" />
            Profile
          </Button>
          <Button className="justify-start gap-2" size="sm" variant="ghost">
            <Bell className="h-4 w-4" />
            Notifications
          </Button>
          <Button className="justify-start gap-2" size="sm" variant="ghost">
            <Calendar className="h-4 w-4" />
            Schedule
          </Button>
          <div className="my-1 h-px bg-zinc-200 dark:bg-zinc-600" />
          <Button
            className="justify-start gap-2 text-red-600 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-950/20 dark:hover:text-red-400"
            size="sm"
            variant="ghost"
          >
            Sign out
          </Button>
        </div>
      </MorphingPopoverContent>
    </MorphingPopover>
  ),
};

/**
 * Morphing popover with custom transition for smoother animations.
 */
export const CustomTransition: MorphingPopoverStory = {
  render: () => (
    <MorphingPopover
      transition={{
        type: "spring",
        bounce: 0.2,
        duration: 0.6,
      }}
    >
      <MorphingPopoverTrigger className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 font-medium text-sm text-white hover:from-purple-600 hover:to-pink-600">
        Smooth Animation
      </MorphingPopoverTrigger>
      <MorphingPopoverContent className="w-72">
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Custom Spring Animation</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            This popover uses a custom spring animation with increased bounce and duration for a
            more playful feel.
          </p>
          <div className="rounded-md bg-zinc-100 p-3 dark:bg-zinc-800">
            <code className="text-xs">bounce: 0.2, duration: 0.6</code>
          </div>
        </div>
      </MorphingPopoverContent>
    </MorphingPopover>
  ),
};

/**
 * Morphing popover with form inputs.
 */
export const WithForm: MorphingPopoverStory = {
  render: () => (
    <MorphingPopover>
      <MorphingPopoverTrigger className="rounded-md bg-blue-600 px-4 py-2 font-medium text-sm text-white hover:bg-blue-700">
        Quick Add
      </MorphingPopoverTrigger>
      <MorphingPopoverContent className="w-80">
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 font-semibold">Add New Item</h3>
            <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
              Fill in the details below to create a new item.
            </p>
          </div>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block font-medium text-sm" htmlFor="popover-name">
                Name
              </label>
              <input
                className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
                id="popover-name"
                placeholder="Enter name"
                type="text"
              />
            </div>
            <div>
              <label className="mb-1 block font-medium text-sm" htmlFor="popover-description">
                Description
              </label>
              <textarea
                className="w-full resize-none rounded border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
                id="popover-description"
                placeholder="Enter description"
                rows={3}
              />
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">Create</Button>
          </div>
        </div>
      </MorphingPopoverContent>
    </MorphingPopover>
  ),
};

/**
 * Morphing popover with custom variants for content animation.
 */
export const CustomVariants: MorphingPopoverStory = {
  render: () => (
    <MorphingPopover
      variants={{
        initial: { opacity: 0, scale: 0.8, y: -20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.8, y: -20 },
      }}
    >
      <MorphingPopoverTrigger className="rounded-md bg-emerald-600 px-4 py-2 font-medium text-sm text-white hover:bg-emerald-700">
        Custom Animation
      </MorphingPopoverTrigger>
      <MorphingPopoverContent className="w-64">
        <div className="space-y-2">
          <h3 className="font-semibold">Fade & Scale</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            This popover uses custom variants for a unique fade and scale animation effect.
          </p>
        </div>
      </MorphingPopoverContent>
    </MorphingPopover>
  ),
};

/**
 * Morphing popover with controlled open state.
 */
export const Controlled: MorphingPopoverStory = {
  render() {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <div className="flex flex-col items-center gap-4">
        <MorphingPopover onOpenChange={setIsOpen} open={isOpen}>
          <MorphingPopoverTrigger className="rounded-md bg-zinc-900 px-4 py-2 font-medium text-sm text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
            {isOpen ? "Close" : "Open"} Popover
          </MorphingPopoverTrigger>
          <MorphingPopoverContent className="w-64">
            <div className="space-y-2">
              <h3 className="font-semibold">Controlled Popover</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                This popover's open state is controlled externally. Try the button below to toggle
                it.
              </p>
            </div>
          </MorphingPopoverContent>
        </MorphingPopover>
        <Button onClick={() => setIsOpen(!isOpen)} variant="outline">
          Toggle from outside
        </Button>
      </div>
    );
  },
};

/**
 * Morphing popover with default open state.
 */
export const DefaultOpen: MorphingPopoverStory = {
  render: () => (
    <MorphingPopover defaultOpen>
      <MorphingPopoverTrigger className="rounded-md bg-zinc-900 px-4 py-2 font-medium text-sm text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
        Already Open
      </MorphingPopoverTrigger>
      <MorphingPopoverContent className="w-64">
        <div className="space-y-2">
          <h3 className="font-semibold">Default Open</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            This popover is open by default when the component mounts.
          </p>
        </div>
      </MorphingPopoverContent>
    </MorphingPopover>
  ),
};
