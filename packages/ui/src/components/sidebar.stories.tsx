import { ChevronUpIcon } from "@radix-ui/react-icons";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Calendar, Home, Inbox, Search, Settings, User2 } from "lucide-react";
import { userEvent, within } from "storybook/test";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/sidebar";

const TOGGLE_BUTTON_PATTERN = /toggle/i;

/**
 * A composable, themeable and customizable sidebar component.
 */
const meta: Meta<typeof Sidebar> = {
  title: "ui/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  argTypes: {
    side: {
      options: ["left", "right"],
      control: { type: "radio" },
    },
    variant: {
      options: ["sidebar", "floating", "inset"],
      control: { type: "radio" },
    },
    collapsible: {
      options: ["offcanvas", "icon", "none"],
      control: { type: "radio" },
    },
  },
  args: {
    side: "left",
    variant: "sidebar",
    collapsible: "icon",
  },
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (SidebarStory) => (
      <SidebarProvider>
        <SidebarStory />
        <section className="m-4">
          <SidebarTrigger />
          <div className="size-full" />
        </section>
      </SidebarProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

// Menu items.
const items = [
  {
    title: "Home",
    url: "#",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

/**
 * A simple sidebar with a group of menu items.
 */
export const Simple: Story = {
  render: (args) => (
    <Sidebar {...args}>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  ),
};

/**
 * A simple sidebar with a footer menu item.
 */
export const Footer: Story = {
  render: (args) => (
    <Sidebar {...args}>
      <SidebarHeader />
      <SidebarContent />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> Username
                  <ChevronUpIcon className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-(--radix-popper-anchor-width)" side="top">
                <DropdownMenuItem>
                  <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  ),
};

export const ShouldCloseOpen: Story = {
  ...Simple,
  name: "when clicking the trigger, should close and open the sidebar",
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const sidebarBtn = await canvas.findByRole("button", {
      name: TOGGLE_BUTTON_PATTERN,
    });
    await step("close the sidebar", async () => {
      await userEvent.click(sidebarBtn);
    });

    await step("reopen the sidebar", async () => {
      await userEvent.click(sidebarBtn);
    });
  },
};
