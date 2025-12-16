import type { Meta, StoryObj } from "@storybook/react-vite";
import { Download, Plus, Settings } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb";
import { Button } from "./button";
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderBreadcrumb,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "./page-header";

/**
 * PageHeader component for consistent page title, description, and action areas.
 */
const meta: Meta<typeof PageHeader> = {
  title: "domain/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof PageHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Default page header with title, description, and primary action.
 */
export const Default: Story = {
  render: () => (
    <PageHeader>
      <PageHeaderContent>
        <PageHeaderTitle>Agents</PageHeaderTitle>
        <PageHeaderDescription>
          Manage your AI voice agents and configure their settings
        </PageHeaderDescription>
      </PageHeaderContent>
      <PageHeaderActions>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Agent
        </Button>
      </PageHeaderActions>
    </PageHeader>
  ),
};

/**
 * Page header with multiple action buttons.
 */
export const MultipleActions: Story = {
  render: () => (
    <PageHeader>
      <PageHeaderContent>
        <PageHeaderTitle>Campaign Dashboard</PageHeaderTitle>
        <PageHeaderDescription>
          View and analyze your campaign performance metrics
        </PageHeaderDescription>
      </PageHeaderContent>
      <PageHeaderActions>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        <Button variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </PageHeaderActions>
    </PageHeader>
  ),
};

/**
 * Page header with breadcrumb navigation.
 */
export const WithBreadcrumb: Story = {
  render: () => (
    <div className="space-y-4">
      <PageHeaderBreadcrumb>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/agents">Agents</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </PageHeaderBreadcrumb>
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Agent Settings</PageHeaderTitle>
          <PageHeaderDescription>
            Configure voice, behavior, and integration settings
          </PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <Button variant="outline">Reset</Button>
          <Button>Save Changes</Button>
        </PageHeaderActions>
      </PageHeader>
    </div>
  ),
};

/**
 * Simple page header with just a title.
 */
export const TitleOnly: Story = {
  render: () => (
    <PageHeader>
      <PageHeaderContent>
        <PageHeaderTitle>Team Members</PageHeaderTitle>
      </PageHeaderContent>
    </PageHeader>
  ),
};

/**
 * Page header without actions (read-only view).
 */
export const NoActions: Story = {
  render: () => (
    <PageHeader>
      <PageHeaderContent>
        <PageHeaderTitle>Activity Log</PageHeaderTitle>
        <PageHeaderDescription>
          View all system activities and events in chronological order
        </PageHeaderDescription>
      </PageHeaderContent>
    </PageHeader>
  ),
};

/**
 * Responsive layout demonstration (resize browser to see changes).
 */
export const Responsive: Story = {
  render: () => (
    <PageHeader>
      <PageHeaderContent>
        <PageHeaderTitle>Responsive Header</PageHeaderTitle>
        <PageHeaderDescription>
          This header adapts to different screen sizes. Try resizing your browser to see the layout
          change from row to column.
        </PageHeaderDescription>
      </PageHeaderContent>
      <PageHeaderActions>
        <Button variant="outline">Secondary</Button>
        <Button>Primary Action</Button>
      </PageHeaderActions>
    </PageHeader>
  ),
};
