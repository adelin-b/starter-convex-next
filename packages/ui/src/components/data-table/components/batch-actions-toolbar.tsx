"use client";

import { Download, Edit, Loader2, Trash2, X } from "lucide-react";
import { useState } from "react";
import { env } from "../../../env";
import { useToast } from "../../../hooks/use-toast";
import { cn } from "../../../utils";
import { Button } from "../../button";
import type { DataTableLabels } from "../labels";
import { defaultDataTableLabels } from "../labels";
import type { BatchAction } from "../types";

export type BatchActionsToolbarProps<TData> = {
  /**
   * Number of selected rows
   */
  selectedCount: number;

  /**
   * Total number of available rows
   */
  totalCount: number;

  /**
   * Selected row data
   */
  selectedRows: TData[];

  /**
   * Callback to clear selection
   */
  onClearSelection: () => void;

  /**
   * Optional callback to select all rows (including paginated)
   */
  onSelectAll?: () => void;

  /**
   * Custom batch actions to display
   */
  batchActions?: BatchAction<TData>[];

  /**
   * Show default actions (Delete, Export, Bulk Edit)
   */
  showDefaultActions?: boolean;

  /**
   * Callback for default delete action
   */
  onDelete?: (selectedRows: TData[]) => void | Promise<void>;

  /**
   * Callback for default export action
   */
  onExport?: (selectedRows: TData[]) => void | Promise<void>;

  /**
   * Callback for default bulk edit action
   */
  onBulkEdit?: (selectedRows: TData[]) => void | Promise<void>;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Translatable labels
   */
  labels?: DataTableLabels;
};

/**
 * BatchActionsToolbar - Floating toolbar for batch operations on selected rows
 *
 * Features:
 * - Shows selected count with clear action
 * - Displays batch action buttons
 * - Smooth slide-up animation when selections exist
 * - Supports custom batch actions with icons
 * - Optional default actions (Delete, Export, Bulk Edit)
 * - Keyboard accessible
 * - Screen reader friendly announcements
 *
 * @example
 * <BatchActionsToolbar
 *   selectedCount={5}
 *   totalCount={100}
 *   selectedRows={selectedData}
 *   onClearSelection={() => table.resetRowSelection()}
 *   batchActions={[
 *     {
 *       action: "archive",
 *       label: "Archive",
 *       icon: Archive,
 *       onClick: (rows) => archiveRows(rows)
 *     }
 *   ]}
 * />
 */
export function BatchActionsToolbar<TData>({
  selectedCount,
  totalCount,
  selectedRows,
  onClearSelection,
  onSelectAll,
  batchActions = [],
  showDefaultActions = true,
  onDelete,
  onExport,
  onBulkEdit,
  className,
  labels,
}: BatchActionsToolbarProps<TData>) {
  // Hooks must be called at the top level, before any early returns
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const mergedLabels = { ...defaultDataTableLabels, ...labels };
  const isAllSelected = selectedCount === totalCount;

  // Format selected count text
  const selectedCountText =
    mergedLabels.formatSelectedCount?.(selectedCount, selectedCount !== 1) ??
    `${selectedCount} ${selectedCount === 1 ? mergedLabels.rowSelected : mergedLabels.rowsSelected} ${mergedLabels.selected}`;

  // Don't render if no selection
  if (selectedCount === 0) {
    return null;
  }

  // Helper: Set action loading state
  const setActionLoading = (actionId: string) => {
    setLoadingActions((prev) => new Set([...prev, actionId]));
  };

  // Helper: Clear action loading state
  const clearActionLoading = (actionId: string) => {
    setLoadingActions((prev) => {
      const next = new Set(prev);
      next.delete(actionId);
      return next;
    });
  };

  // Helper: Show loading toast
  const showLoadingToast = (loadingText?: string) => {
    if (loadingText) {
      toast({ title: loadingText, variant: "default" });
    }
  };

  // Helper: Show success toast
  const showSuccessToast = (successMessage?: string) => {
    if (successMessage) {
      toast({
        title: mergedLabels.success,
        description: successMessage,
        variant: "default",
      });
    }
  };

  // Helper: Handle action error
  const handleActionError = (error: unknown, action: BatchAction<TData>) => {
    if (action.onError) {
      action.onError(error, selectedRows);
      return;
    }

    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    toast({
      title: mergedLabels.actionFailed,
      description: `${mergedLabels.failedTo} ${action.label.toLowerCase()}: ${errorMessage}`,
      variant: "destructive",
    });

    if (env.NODE_ENV !== "production") {
      console.error(`Batch action "${action.action}" failed:`, error);
    }
  };

  /**
   * Handle batch action execution with error handling and loading states
   */
  const handleActionClick = async (action: BatchAction<TData>) => {
    const actionId = action.action;

    try {
      setActionLoading(actionId);
      showLoadingToast(action.loadingText);
      await action.onClick(selectedRows);
      showSuccessToast(action.successMessage);
    } catch (error) {
      handleActionError(error, action);
    } finally {
      clearActionLoading(actionId);
    }
  };

  // Default actions
  const defaultActions: BatchAction<TData>[] = [];

  if (showDefaultActions) {
    if (onDelete) {
      defaultActions.push({
        action: "delete",
        label: mergedLabels.delete ?? "Delete",
        icon: Trash2,
        variant: "destructive",
        onClick: onDelete,
      });
    }

    if (onExport) {
      defaultActions.push({
        action: "export",
        label: mergedLabels.export ?? "Export",
        icon: Download,
        variant: "outline",
        onClick: onExport,
      });
    }

    if (onBulkEdit) {
      defaultActions.push({
        action: "bulk-edit",
        label: mergedLabels.bulkEdit ?? "Bulk Edit",
        icon: Edit,
        variant: "outline",
        onClick: onBulkEdit,
      });
    }
  }

  const allActions = [...defaultActions, ...batchActions];

  return (
    <div
      aria-label="Batch actions"
      className={cn(
        "slide-in-from-bottom-2 fade-in-0 animate-in duration-300",
        "flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3 shadow-lg",
        className,
      )}
      role="toolbar"
    >
      {/* Left side: Selection info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span aria-atomic="true" aria-live="polite" className="font-medium text-sm" role="status">
            {selectedCountText}
          </span>

          <Button
            aria-label={mergedLabels.clearSelection}
            onClick={onClearSelection}
            size="icon-sm"
            title={mergedLabels.clearSelection}
            variant="ghost"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Select all rows option (for pagination) */}
        {!isAllSelected && onSelectAll && totalCount > selectedCount && (
          <Button className="h-auto p-0 text-xs" onClick={onSelectAll} size="sm" variant="link">
            {mergedLabels.selectAll} {totalCount} {mergedLabels.rows}
          </Button>
        )}
      </div>

      {/* Right side: Action buttons */}
      {allActions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {allActions.map((action) => {
            const Icon = action.icon;
            const isLoading = loadingActions.has(action.action);
            const isDisabled = action.isDisabled?.(selectedRows) ?? false;

            return (
              <Button
                aria-busy={isLoading}
                aria-label={action.label}
                disabled={isDisabled || isLoading}
                key={action.action}
                onClick={() => handleActionClick(action)}
                size="sm"
                variant={action.variant || "default"}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : Icon && <Icon />}
                {action.label}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
