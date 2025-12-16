"use client";

import { cn } from "@starter-saas/ui/utils";
import type { ViewConfig } from "../types";

export type ViewSwitcherProps = {
  activeView: ViewConfig;
  availableViews: ViewConfig[];
  onViewChange: (view: ViewConfig) => void;
  className?: string;
};

/**
 * ViewSwitcher - Tab-based interface for switching between data table views
 * Inspired by Notion's view tabs UI
 *
 * @example
 * <ViewSwitcher
 *   activeView={currentView}
 *   availableViews={allViews}
 *   onViewChange={handleViewChange}
 * />
 */
export function ViewSwitcher({
  activeView,
  availableViews,
  onViewChange,
  className,
}: ViewSwitcherProps) {
  return (
    <div
      aria-label="Data table views"
      className={cn("inline-flex h-9 items-center gap-1 rounded-lg bg-muted p-1", className)}
      role="tablist"
    >
      {availableViews.map((view) => {
        const Icon = view.icon;
        const isActive = view.id === activeView.id;

        return (
          <button
            aria-controls={`view-${view.id}`}
            aria-selected={isActive}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-md px-3 py-1.5",
              "font-medium text-sm ring-offset-background transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:pointer-events-none disabled:opacity-50",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/50 hover:text-foreground",
            )}
            key={view.id}
            onClick={() => onViewChange(view)}
            role="tab"
            type="button"
          >
            <Icon aria-hidden="true" className="size-4" />
            <span>{view.name}</span>
          </button>
        );
      })}
    </div>
  );
}
