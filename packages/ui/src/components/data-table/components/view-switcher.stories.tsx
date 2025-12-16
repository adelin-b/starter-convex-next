import type { Meta, StoryObj } from "@storybook/react";
import { LayoutGrid, List, Newspaper, Table2, Trello } from "lucide-react";
import { useState } from "react";
import type { ViewConfig } from "../types";
import { ViewSwitcher } from "./view-switcher";

// Sample view configurations
const sampleViews: ViewConfig[] = [
  {
    id: "table",
    type: "table",
    name: "Table",
    icon: Table2,
    settings: {
      enableSorting: true,
      enableSelection: true,
      enablePagination: true,
      enableRowHover: true,
      denseMode: false,
    },
  },
  {
    id: "board",
    type: "board",
    name: "Board",
    icon: Trello,
    settings: {
      groupByColumn: "status",
      enableDragDrop: true,
      showCardCount: true,
      columnWidth: 300,
    },
  },
  {
    id: "gallery",
    type: "gallery",
    name: "Gallery",
    icon: LayoutGrid,
    settings: {
      cardSize: "medium" as const,
      showPageIcon: true,
      fitImage: false,
      wrapProperties: false,
      cardPreview: "page-content" as const,
      openPagesIn: "center-peek" as const,
      columns: 3,
    },
  },
  {
    id: "list",
    type: "list",
    name: "List",
    icon: List,
    settings: {
      showPageIcon: true,
      compactMode: false,
      openPagesIn: "side-peek" as const,
      showProperties: false,
    },
  },
  {
    id: "feed",
    type: "feed",
    name: "Feed",
    icon: Newspaper,
    settings: {
      showAuthorByline: true,
      enableReactions: true,
      enableComments: true,
      loadLimit: 10 as const,
      openPagesIn: "center-peek" as const,
      showTimestamps: true,
    },
  },
];

/**
 * Interactive ViewSwitcher with state management
 */
function ViewSwitcherWrapper({
  views = sampleViews,
  showDebug = true,
  className,
}: {
  views?: ViewConfig[];
  showDebug?: boolean;
  className?: string;
}) {
  const [activeView, setActiveView] = useState(views[0]!);

  return (
    <div className="space-y-4">
      <ViewSwitcher
        activeView={activeView}
        availableViews={views}
        className={className}
        onViewChange={setActiveView}
      />
      {showDebug && (
        <div className="rounded-md border p-4 text-sm">
          <p className="font-medium">Active View:</p>
          <p className="text-muted-foreground">
            {activeView.name} ({activeView.type})
          </p>
        </div>
      )}
    </div>
  );
}

const meta: Meta<typeof ViewSwitcherWrapper> = {
  title: "composite/Datatable/ViewSwitcher",
  component: ViewSwitcherWrapper,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    showDebug: {
      control: "boolean",
      description: "Show debug output with active view",
    },
  },
  args: {
    showDebug: true,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default view switcher with all 5 views
 */
export const Default: Story = {};

/**
 * Only 3 views enabled (Table, Board, List)
 */
export const ThreeViews: Story = {
  args: {
    views: sampleViews.filter((v) => ["table", "board", "list"].includes(v.type)),
  },
};

/**
 * Only 2 views enabled (Table, Gallery)
 */
export const TwoViews: Story = {
  args: {
    views: sampleViews.filter((v) => ["table", "gallery"].includes(v.type)),
  },
};

/**
 * Single view (table only) - switcher should still render
 */
export const SingleView: Story = {
  args: {
    views: sampleViews.filter((v) => v.type === "table"),
  },
};

/**
 * Custom styling example
 */
export const CustomStyling: Story = {
  args: {
    className: "border-2 border-primary",
    showDebug: false,
  },
};

/**
 * All available views
 */
export const AllViews: Story = {};
