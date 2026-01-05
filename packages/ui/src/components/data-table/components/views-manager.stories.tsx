import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { useSavedViews } from "../hooks/use-saved-views";
import { ViewsManager } from "./views-manager";

const meta: Meta<typeof ViewsManager> = {
  title: "composite/Datatable/ViewsManager",
  component: ViewsManager,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Interactive example showing how ViewsManager works with the useSavedViews hook
 */
export const Interactive: Story = {
  render: () => {
    const {
      views,
      activeViewId,
      createView,
      deleteView,
      duplicateView,
      setDefaultView,
      applyView,
    } = useSavedViews({
      storageKey: "storybook-views",
      enablePersistence: false, // Disable for Storybook
    });

    const [currentState] = useState({
      filters: [{ logic: "AND" as const, filters: [] }],
      sorting: [],
      columnVisibility: {},
      viewType: "table" as const,
    });

    return (
      <div className="w-full space-y-4">
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-2 font-semibold text-sm">Views Manager</h3>
          <ViewsManager
            activeViewId={activeViewId}
            onApplyView={(viewId) => {
              const state = applyView(viewId);
              console.log("Applied view:", state);
            }}
            onCreateView={(name, description) => {
              createView(name, currentState, { description });
            }}
            onDeleteView={deleteView}
            onDuplicateView={duplicateView}
            onSetDefaultView={setDefaultView}
            views={views}
          />
        </div>

        <div className="rounded-lg border bg-muted p-4">
          <h4 className="mb-2 font-medium text-sm">Views ({views.length})</h4>
          {views.length === 0 ? (
            <p className="text-muted-foreground text-xs">
              No views yet. Click "Views" and create one!
            </p>
          ) : (
            <div className="space-y-2 text-xs">
              {views.map((view) => (
                <div className="flex items-center gap-2" key={view.id}>
                  <span className="font-mono">{view.id}</span>
                  <span className="font-medium">{view.name}</span>
                  {view.isDefault && <span className="text-yellow-600">★ Default</span>}
                  {activeViewId === view.id && <span className="text-green-600">✓ Active</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  },
};

/**
 * ViewsManager with pre-populated views
 */
export const WithViews: Story = {
  render: () => {
    const initialViews = [
      {
        id: "view-1",
        name: "Active Users",
        description: "Shows only active users",
        isDefault: true,
        createdAt: Date.now() - 86_400_000,
        updatedAt: Date.now() - 86_400_000,
        filters: [{ logic: "AND" as const, filters: [] }],
        sorting: [],
        columnVisibility: {},
        viewType: "table" as const,
      },
      {
        id: "view-2",
        name: "Admins Only",
        description: "Filtered to show administrators",
        isDefault: false,
        createdAt: Date.now() - 7_200_000,
        updatedAt: Date.now() - 3_600_000,
        filters: [{ logic: "AND" as const, filters: [] }],
        sorting: [],
        columnVisibility: {},
        viewType: "table" as const,
      },
      {
        id: "view-3",
        name: "Recent Signups",
        isDefault: false,
        createdAt: Date.now() - 3_600_000,
        updatedAt: Date.now() - 3_600_000,
        filters: [{ logic: "AND" as const, filters: [] }],
        sorting: [{ id: "createdAt", desc: true }],
        columnVisibility: {},
        viewType: "list" as const,
      },
    ];

    const {
      views,
      activeViewId,
      createView,
      deleteView,
      duplicateView,
      setDefaultView,
      applyView,
    } = useSavedViews({
      storageKey: "storybook-with-views",
      enablePersistence: false,
      initialViews,
    });

    const [currentState] = useState({
      filters: [{ logic: "AND" as const, filters: [] }],
      sorting: [],
      columnVisibility: {},
      viewType: "table" as const,
    });

    return (
      <div className="w-full space-y-4">
        <ViewsManager
          activeViewId={activeViewId}
          onApplyView={(viewId) => {
            const state = applyView(viewId);
            console.log("Applied view:", state);
          }}
          onCreateView={(name, description) => {
            createView(name, currentState, { description });
          }}
          onDeleteView={deleteView}
          onDuplicateView={duplicateView}
          onSetDefaultView={setDefaultView}
          views={views}
        />

        <div className="rounded-lg border bg-muted p-4">
          <h4 className="mb-2 font-medium text-sm">Debug Info</h4>
          <pre className="text-xs">
            {JSON.stringify({ activeViewId, viewCount: views.length }, null, 2)}
          </pre>
        </div>
      </div>
    );
  },
};

/**
 * Empty state - no views
 */
export const EmptyState: Story = {
  render: () => {
    const {
      views,
      activeViewId,
      createView,
      deleteView,
      duplicateView,
      setDefaultView,
      applyView,
    } = useSavedViews({
      storageKey: "storybook-empty",
      enablePersistence: false,
    });

    const [currentState] = useState({
      filters: [{ logic: "AND" as const, filters: [] }],
      sorting: [],
      columnVisibility: {},
      viewType: "table" as const,
    });

    return (
      <ViewsManager
        activeViewId={activeViewId}
        onApplyView={(viewId) => {
          const state = applyView(viewId);
          console.log("Applied view:", state);
        }}
        onCreateView={(name, description) => {
          createView(name, currentState, { description });
        }}
        onDeleteView={deleteView}
        onDuplicateView={duplicateView}
        onSetDefaultView={setDefaultView}
        views={views}
      />
    );
  },
};
