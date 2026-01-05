"use client";

import type { SortingState, VisibilityState } from "@tanstack/react-table";
import { useCallback, useEffect, useState } from "react";
import type { FilterGroup, ViewType } from "../types";

/**
 * Saved view configuration
 * Captures complete table state including filters, sorting, columns, and view type
 */
export type SavedView = {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  createdAt: number;
  updatedAt: number;
  // Table state
  filters: FilterGroup[];
  sorting: SortingState;
  columnVisibility: VisibilityState;
  viewType: ViewType;
};

export type UseSavedViewsOptions = {
  /** Storage key prefix for localStorage */
  storageKey?: string;
  /** Enable persistence to localStorage */
  enablePersistence?: boolean;
  /** Initial views to load */
  initialViews?: SavedView[];
};

/**
 * Hook for managing saved views
 * Features:
 * - Create/update/delete views
 * - Set default view
 * - Persist to localStorage
 * - Apply view state to table
 *
 * @example
 * const {
 *   views,
 *   activeViewId,
 *   createView,
 *   applyView,
 *   deleteView,
 *   setDefaultView,
 * } = useSavedViews({
 *   storageKey: 'my-table-views',
 *   enablePersistence: true,
 * });
 */
export function useSavedViews(options: UseSavedViewsOptions = {}) {
  const { storageKey = "data-table-views", enablePersistence = true, initialViews = [] } = options;

  const [views, setViews] = useState<SavedView[]>(initialViews);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);

  // Load views from localStorage on mount
  useEffect(() => {
    if (!enablePersistence) {
      return;
    }

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as SavedView[];
        setViews(parsed);

        // Set active view to default if exists
        const defaultView = parsed.find((v) => v.isDefault);
        if (defaultView) {
          setActiveViewId(defaultView.id);
        }
      }
    } catch (error) {
      console.error("Failed to load saved views:", error);
    }
  }, [storageKey, enablePersistence]);

  // Save views to localStorage whenever they change
  useEffect(() => {
    if (!enablePersistence) {
      return;
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(views));
    } catch (error) {
      console.error("Failed to save views:", error);
    }
  }, [views, storageKey, enablePersistence]);

  /**
   * Create a new saved view
   */
  const createView = useCallback(
    (
      name: string,
      state: {
        filters: FilterGroup[];
        sorting: SortingState;
        columnVisibility: VisibilityState;
        viewType: ViewType;
      },
      viewOptions?: {
        description?: string;
        setAsDefault?: boolean;
      },
    ): SavedView => {
      const now = Date.now();
      const newView: SavedView = {
        id: `view-${now}`,
        name,
        description: viewOptions?.description,
        isDefault: viewOptions?.setAsDefault ?? false,
        createdAt: now,
        updatedAt: now,
        filters: state.filters,
        sorting: state.sorting,
        columnVisibility: state.columnVisibility,
        viewType: state.viewType,
      };

      setViews((prev) => {
        // If setting as default, unset all other defaults
        const updated = viewOptions?.setAsDefault
          ? prev.map((v) => ({ ...v, isDefault: false }))
          : prev;
        return [...updated, newView];
      });

      return newView;
    },
    [],
  );

  /**
   * Update an existing view
   */
  const updateView = useCallback((viewId: string, updates: Partial<SavedView>) => {
    setViews((prev) =>
      prev.map((view) =>
        view.id === viewId
          ? {
              ...view,
              ...updates,
              updatedAt: Date.now(),
            }
          : view,
      ),
    );
  }, []);

  /**
   * Delete a view
   */
  const deleteView = useCallback((viewId: string) => {
    setViews((prev) => prev.filter((view) => view.id !== viewId));
    setActiveViewId((current) => (current === viewId ? null : current));
  }, []);

  /**
   * Set a view as default
   */
  const setDefaultView = useCallback((viewId: string | null) => {
    setViews((prev) =>
      prev.map((view) => ({
        ...view,
        isDefault: view.id === viewId,
      })),
    );
  }, []);

  /**
   * Apply a saved view (returns the view state to apply to table)
   */
  const applyView = useCallback(
    (viewId: string) => {
      const view = views.find((v) => v.id === viewId);
      if (view) {
        setActiveViewId(viewId);
        return {
          filters: view.filters,
          sorting: view.sorting,
          columnVisibility: view.columnVisibility,
          viewType: view.viewType,
        };
      }
      return null;
    },
    [views],
  );

  /**
   * Get active view
   */
  const activeView = views.find((v) => v.id === activeViewId) || null;

  /**
   * Get default view
   */
  const defaultView = views.find((v) => v.isDefault) || null;

  /**
   * Clear active view (reset to no view)
   */
  const clearActiveView = useCallback(() => {
    setActiveViewId(null);
  }, []);

  /**
   * Duplicate a view
   */
  const duplicateView = useCallback(
    (viewId: string, newName?: string) => {
      const view = views.find((v) => v.id === viewId);
      if (view) {
        const now = Date.now();
        const duplicated: SavedView = {
          ...view,
          id: `view-${now}`,
          name: newName || `${view.name} (copy)`,
          isDefault: false,
          createdAt: now,
          updatedAt: now,
        };
        setViews((prev) => [...prev, duplicated]);
        return duplicated;
      }
      return null;
    },
    [views],
  );

  /**
   * Check if current state matches a saved view
   */
  const findMatchingView = useCallback(
    (state: {
      filters: FilterGroup[];
      sorting: SortingState;
      columnVisibility: VisibilityState;
      viewType: ViewType;
    }) =>
      views.find((view) => {
        const filtersMatch = JSON.stringify(view.filters) === JSON.stringify(state.filters);
        const sortingMatch = JSON.stringify(view.sorting) === JSON.stringify(state.sorting);
        const visibilityMatch =
          JSON.stringify(view.columnVisibility) === JSON.stringify(state.columnVisibility);
        const viewTypeMatch = view.viewType === state.viewType;

        return filtersMatch && sortingMatch && visibilityMatch && viewTypeMatch;
      }),
    [views],
  );

  return {
    // State
    views,
    activeView,
    activeViewId,
    defaultView,

    // Actions
    createView,
    updateView,
    deleteView,
    setDefaultView,
    applyView,
    clearActiveView,
    duplicateView,
    findMatchingView,
  };
}
