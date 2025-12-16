import type { Meta, StoryObj } from "@storybook/react-vite";
import { Home, Settings, Users } from "lucide-react";

import { DashboardLayout } from "./dashboard-layout";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./sidebar";

/**
 * DashboardLayout component - Standardized dashboard layout with sidebar.
 */
const meta: Meta<typeof DashboardLayout> = {
  title: "domain/DashboardLayout",
  component: DashboardLayout,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["sidebar", "floating", "inset"],
      description: "Sidebar variant",
    },
    defaultOpen: {
      control: "boolean",
      description: "Default sidebar open state",
    },
  },
  args: {
    variant: "inset",
    defaultOpen: true,
  },
} satisfies Meta<typeof DashboardLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

const sidebarContent = (
  <SidebarGroup>
    <SidebarGroupLabel>Application</SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <Home className="size-4" />
            <span>Dashboard</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <Users className="size-4" />
            <span>Users</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <Settings className="size-4" />
            <span>Settings</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
);

/**
 * Default dashboard layout with sidebar navigation.
 */
export const Default: Story = {
  render: (args) => (
    <div className="h-screen">
      <DashboardLayout {...args} sidebarContent={sidebarContent}>
        <div className="p-8">
          <h1 className="mb-4 font-bold text-3xl">Dashboard</h1>
          <p className="text-muted-foreground">Main content area with sidebar navigation</p>
        </div>
      </DashboardLayout>
    </div>
  ),
};

/**
 * Dashboard with sidebar footer.
 */
export const WithFooter: Story = {
  render: (args) => (
    <div className="h-screen">
      <DashboardLayout
        {...args}
        sidebarContent={sidebarContent}
        sidebarFooter={<div className="p-4 text-muted-foreground text-sm">v1.0.0</div>}
      >
        <div className="p-8">
          <h1 className="mb-4 font-bold text-3xl">Dashboard</h1>
          <p className="text-muted-foreground">With sidebar footer</p>
        </div>
      </DashboardLayout>
    </div>
  ),
};
