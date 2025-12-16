"use client";

import { ExternalLink, X } from "lucide-react";
import { cn } from "../../../utils";
import { Badge } from "../../badge";
import { Button } from "../../button";
import type { DataTableLabels } from "../labels";
import { defaultDataTableLabels } from "../labels";
import type { RelationConfig } from "../types";

export type RelationCellProps = {
  /**
   * Relation value (ID or array of IDs)
   */
  value: string | string[] | null | undefined;

  /**
   * Resolved relation data
   */
  resolvedData?: Record<string, unknown>[];

  /**
   * Relation configuration
   */
  config: RelationConfig;

  /**
   * Callback when relation is clicked
   */
  onRelationClick?: (id: string, data?: Record<string, unknown>) => void;

  /**
   * Callback when relation is removed (for editing)
   */
  onRemove?: (id: string) => void;

  /**
   * Whether the cell is in edit mode
   */
  isEditing?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Maximum number of relations to display before showing "+N more"
   */
  maxDisplay?: number;

  /**
   * Translatable labels
   */
  labels?: DataTableLabels;
};

/**
 * RelationCell - Display relation/reference field values
 *
 * Features:
 * - Single and multi-select relations
 * - Badge display with relation names
 * - Click to navigate to related record
 * - Remove relations in edit mode
 * - Truncate with "+N more" for many relations
 * - Loading state while resolving
 *
 * @example
 * <RelationCell
 *   value={["id1", "id2"]}
 *   resolvedData={[{ id: "id1", name: "Item 1" }, { id: "id2", name: "Item 2" }]}
 *   config={{ targetTable: "items", displayField: "name", multiple: true }}
 *   onRelationClick={(id) => router.push(`/items/${id}`)}
 * />
 */
export function RelationCell({
  value,
  resolvedData,
  config,
  onRelationClick,
  onRemove,
  isEditing = false,
  className,
  maxDisplay = 3,
  labels,
}: RelationCellProps) {
  const mergedLabels = { ...defaultDataTableLabels, ...labels };
  // Normalize value to array
  let ids: string[];
  if (Array.isArray(value)) {
    ids = value;
  } else if (value) {
    ids = [value];
  } else {
    ids = [];
  }

  // Empty state
  if (ids.length === 0) {
    return (
      <div className={cn("text-muted-foreground text-sm", className)} data-slot="relation-cell">
        {isEditing ? mergedLabels.addRelation : mergedLabels.noRelations}
      </div>
    );
  }

  // Create a map of resolved data for quick lookup
  const dataMap = new Map(resolvedData?.map((item) => [String(item.id), item]) || []);

  // Get display values
  const displayItems = ids.slice(0, maxDisplay).map((id) => {
    const data = dataMap.get(id);
    const displayValue = data ? String(data[config.displayField] ?? id) : id;
    return { id, displayValue, data };
  });

  const remainingCount = ids.length - maxDisplay;

  // Format remaining count text
  const remainingCountText =
    mergedLabels.formatMoreRelations?.(remainingCount) ??
    `+${remainingCount} ${mergedLabels.moreRelations}`;

  // Loading state
  if (!resolvedData && ids.length > 0) {
    return (
      <div className={cn("flex items-center gap-2", className)} data-slot="relation-cell">
        <div
          aria-label={mergedLabels.loadingRelations}
          className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
          role="status"
        />
        <span className="text-muted-foreground text-sm">{mergedLabels.loading}</span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)} data-slot="relation-cell">
      {displayItems.map(({ id, displayValue, data }) => (
        <Badge
          className={cn(
            "group/relation flex items-center gap-1 transition-colors",
            onRelationClick && "cursor-pointer hover:bg-accent",
          )}
          key={id}
          variant="secondary"
        >
          {onRelationClick ? (
            <button
              className="max-w-[200px] truncate bg-transparent p-0 text-inherit hover:underline"
              onClick={() => onRelationClick(id, data)}
              type="button"
            >
              {displayValue}
            </button>
          ) : (
            <span className="max-w-[200px] truncate">{displayValue}</span>
          )}

          {onRelationClick && !isEditing && (
            <ExternalLink className="hidden size-3 opacity-70 group-hover/relation:inline-block" />
          )}

          {isEditing && onRemove && (
            <Button
              aria-label={`Remove ${displayValue}`}
              className="-mr-1 size-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(id);
              }}
              size="icon-sm"
              variant="ghost"
            >
              <X className="size-3" />
            </Button>
          )}
        </Badge>
      ))}

      {remainingCount > 0 && (
        <Badge className="text-muted-foreground text-xs" variant="outline">
          {remainingCountText}
        </Badge>
      )}
    </div>
  );
}
