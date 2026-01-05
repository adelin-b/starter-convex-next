"use client";

import { assertNever } from "@starter-saas/shared/assert-never";
import { FolderPlus, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "../../../utils";
import { Button } from "../../button";
import { Input } from "../../input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../select";
import { FILTER_OPERATORS } from "../constants";
import type { DataTableLabels } from "../labels";
import { defaultDataTableLabels } from "../labels";
import type {
  AdvancedFilterGroup,
  AdvancedFilterNode,
  AdvancedFilterRule,
  DataTableColumn,
  FilterLogic,
  FilterOperator,
} from "../types";

export type AdvancedFilterBuilderProps<TData> = {
  columns: DataTableColumn<TData>[];
  filterState: AdvancedFilterGroup;
  onFilterChange: (state: AdvancedFilterGroup) => void;
  labels?: DataTableLabels;
  className?: string;
};

/**
 * Generate a unique ID for filter nodes
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Create an empty filter rule
 */
function createEmptyRule<TData>(columns: DataTableColumn<TData>[]): AdvancedFilterRule {
  const firstColumn = columns.find((col) => col.enableFiltering !== false);
  return {
    type: "rule",
    id: generateId(),
    field: firstColumn?.id || "",
    operator: "contains",
    value: "",
  };
}

/**
 * Create an empty filter group
 */
function createEmptyGroup<TData>(columns: DataTableColumn<TData>[]): AdvancedFilterGroup {
  return {
    type: "group",
    id: generateId(),
    logic: "AND",
    children: [createEmptyRule(columns)],
  };
}

/**
 * Infer data type from column
 */
function inferColumnType<TData>(
  column: DataTableColumn<TData>,
): "string" | "number" | "date" | "boolean" {
  const explicitType = (column.meta as { filterType?: string })?.filterType;
  if (explicitType && ["string", "number", "date", "boolean"].includes(explicitType)) {
    return explicitType as "string" | "number" | "date" | "boolean";
  }

  const accessorKey = "accessorKey" in column ? column.accessorKey : undefined;
  const key = (typeof accessorKey === "string" ? accessorKey : column.id) || "";
  const lowerKey = key.toLowerCase();

  if (
    lowerKey.includes("date") ||
    lowerKey.includes("time") ||
    lowerKey.includes("created") ||
    lowerKey.includes("updated") ||
    lowerKey.endsWith("at")
  ) {
    return "date";
  }

  if (
    lowerKey.includes("age") ||
    lowerKey.includes("count") ||
    lowerKey.includes("price") ||
    lowerKey.includes("amount") ||
    lowerKey.includes("total") ||
    lowerKey.includes("quantity") ||
    lowerKey.includes("number")
  ) {
    return "number";
  }

  if (
    lowerKey.startsWith("is") ||
    lowerKey.startsWith("has") ||
    lowerKey.includes("active") ||
    lowerKey.includes("enabled")
  ) {
    return "boolean";
  }

  return "string";
}

/**
 * LogicToggle - Toggle between AND/OR for a group
 */
function LogicToggle({
  logic,
  onChange,
  labels,
}: {
  logic: FilterLogic;
  onChange: (logic: FilterLogic) => void;
  labels: DataTableLabels;
}) {
  return (
    <div className="inline-flex items-center rounded-md border bg-muted p-0.5">
      <button
        aria-pressed={logic === "AND"}
        className={cn(
          "rounded px-2 py-0.5 font-medium text-xs transition-colors",
          logic === "AND" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
        )}
        onClick={() => onChange("AND")}
        type="button"
      >
        {labels.and}
      </button>
      <button
        aria-pressed={logic === "OR"}
        className={cn(
          "rounded px-2 py-0.5 font-medium text-xs transition-colors",
          logic === "OR" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
        )}
        onClick={() => onChange("OR")}
        type="button"
      >
        {labels.or}
      </button>
    </div>
  );
}

/**
 * RuleJoiner - Visual connector between rules showing AND/OR
 */
function RuleJoiner({ logic, labels }: { logic: FilterLogic; labels: DataTableLabels }) {
  return (
    <div className="flex items-center gap-2 py-1 pl-4">
      <div className="h-4 w-px bg-border" />
      <span className="text-muted-foreground text-xs uppercase">
        {labels[logic.toLowerCase() as "and" | "or"]}
      </span>
      <div className="h-4 w-px bg-border" />
    </div>
  );
}

/**
 * SingleFilterRule - Individual filter rule editor
 */
function SingleFilterRule<TData>({
  rule,
  columns,
  onChange,
  onRemove,
  labels,
  showRemove = true,
}: {
  rule: AdvancedFilterRule;
  columns: DataTableColumn<TData>[];
  onChange: (rule: AdvancedFilterRule) => void;
  onRemove: () => void;
  labels: DataTableLabels;
  showRemove?: boolean;
}) {
  const [localValue, setLocalValue] = useState(String(rule.value || ""));

  // Sync localValue when rule.value changes externally (e.g., "Clear all" or undo)
  useEffect(() => {
    setLocalValue(String(rule.value || ""));
  }, [rule.value]);

  const selectedColumn = useMemo(
    () => columns.find((col) => col.id === rule.field),
    [columns, rule.field],
  );

  const columnType = useMemo(
    () => (selectedColumn ? inferColumnType(selectedColumn) : "string"),
    [selectedColumn],
  );

  const availableOperators = useMemo(
    () => FILTER_OPERATORS.filter((op) => op.availableFor.includes(columnType)),
    [columnType],
  );

  const currentOperator = useMemo(
    () => FILTER_OPERATORS.find((op) => op.value === rule.operator),
    [rule.operator],
  );

  const handleFieldChange = (fieldId: string) => {
    const newColumn = columns.find((col) => col.id === fieldId);
    if (!newColumn) {
      return;
    }

    const newColumnType = inferColumnType(newColumn);
    const newOperator_ = FILTER_OPERATORS.find((op) => op.availableFor.includes(newColumnType));
    const newOperator = newOperator_?.value || "equals";

    onChange({
      ...rule,
      field: fieldId,
      operator: newOperator as FilterOperator,
      value: "",
    });
    setLocalValue("");
  };

  const handleOperatorChange = (operatorValue: string) => {
    const newOperator = FILTER_OPERATORS.find((op) => op.value === operatorValue);
    if (!newOperator) {
      return;
    }

    const shouldResetValue =
      newOperator.inputType === "none" || currentOperator?.inputType === "none";

    onChange({
      ...rule,
      operator: operatorValue as FilterOperator,
      value: shouldResetValue ? "" : rule.value,
    });

    if (shouldResetValue) {
      setLocalValue("");
    }
  };

  const handleValueChange = (value: string) => {
    setLocalValue(value);
    onChange({
      ...rule,
      value,
    });
  };

  const renderValueInput = () => {
    if (!currentOperator || currentOperator.inputType === "none") {
      return null;
    }

    switch (currentOperator.inputType) {
      case "text": {
        return (
          <Input
            className="h-8 w-32 text-sm"
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={labels.enterValue}
            type="text"
            value={localValue}
          />
        );
      }

      case "number": {
        return (
          <Input
            className="h-8 w-24 text-sm"
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={labels.enterNumber}
            type="number"
            value={localValue}
          />
        );
      }

      case "date": {
        return (
          <Input
            className="h-8 w-36 text-sm"
            onChange={(e) => handleValueChange(e.target.value)}
            type="date"
            value={localValue}
          />
        );
      }

      case "select":
      case "multiselect": {
        return (
          <Input
            className="h-8 w-32 text-sm"
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={labels.enterValue}
            type="text"
            value={localValue}
          />
        );
      }

      default: {
        assertNever(currentOperator.inputType);
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Field selector */}
      <Select onValueChange={handleFieldChange} value={rule.field}>
        <SelectTrigger className="h-8 w-32 text-sm">
          <SelectValue placeholder={labels.selectColumn} />
        </SelectTrigger>
        <SelectContent>
          {columns
            .filter((col) => col.enableFiltering !== false)
            .map((column) => (
              <SelectItem key={column.id} value={column.id}>
                {typeof column.header === "string" ? column.header : column.id}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {/* Operator selector */}
      <Select onValueChange={handleOperatorChange} value={rule.operator}>
        <SelectTrigger className="h-8 w-36 text-sm">
          <SelectValue placeholder={labels.selectOperator} />
        </SelectTrigger>
        <SelectContent>
          {availableOperators.map((operator) => (
            <SelectItem key={operator.value} value={operator.value}>
              {operator.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Value input */}
      {renderValueInput()}

      {/* Remove button */}
      {showRemove && (
        <Button
          aria-label={labels.removeFilter}
          className="size-8 p-0"
          onClick={onRemove}
          size="sm"
          type="button"
          variant="ghost"
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}

/**
 * FilterGroupContainer - Container for a group of filters
 */
function FilterGroupContainer<TData>({
  group,
  columns,
  onChange,
  onRemove,
  labels,
  isRoot = false,
  depth = 0,
}: {
  group: AdvancedFilterGroup;
  columns: DataTableColumn<TData>[];
  onChange: (group: AdvancedFilterGroup) => void;
  onRemove?: () => void;
  labels: DataTableLabels;
  isRoot?: boolean;
  depth?: number;
}) {
  const handleLogicChange = (logic: FilterLogic) => {
    onChange({ ...group, logic });
  };

  const handleChildChange = (index: number, child: AdvancedFilterNode) => {
    const newChildren = [...group.children];
    newChildren[index] = child;
    onChange({ ...group, children: newChildren });
  };

  const handleChildRemove = (index: number) => {
    const newChildren = group.children.filter((_, i) => i !== index);
    onChange({ ...group, children: newChildren });
  };

  const handleAddRule = () => {
    onChange({
      ...group,
      children: [...group.children, createEmptyRule(columns)],
    });
  };

  const handleAddGroup = () => {
    onChange({
      ...group,
      children: [...group.children, createEmptyGroup(columns)],
    });
  };

  const handleClearAll = () => {
    onChange({
      ...group,
      children: [],
    });
  };

  const maxDepth = 3;
  const canAddGroup = depth < maxDepth;

  return (
    <div
      className={cn(
        "rounded-lg border",
        !isRoot && "ml-4 border-dashed bg-muted/30",
        isRoot && "bg-muted/50",
      )}
    >
      {/* Group header */}
      <div className="flex items-center justify-between gap-2 border-b p-2">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">{labels.where}</span>
          <LogicToggle labels={labels} logic={group.logic} onChange={handleLogicChange} />
          <span className="text-muted-foreground text-sm">
            {group.logic === "AND" ? labels.matchAll : labels.matchAny}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {!isRoot && onRemove && (
            <Button
              aria-label={labels.removeGroup}
              className="size-7 p-0"
              onClick={onRemove}
              size="sm"
              type="button"
              variant="ghost"
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Rules and nested groups */}
      <div className="space-y-0 p-3">
        {group.children.length === 0 ? (
          <div className="py-4 text-center text-muted-foreground text-sm">
            {labels.noAdvancedFiltersApplied}
          </div>
        ) : (
          group.children.map((child, index) => (
            <div key={child.id}>
              {/* Joiner between rules */}
              {index > 0 && <RuleJoiner labels={labels} logic={group.logic} />}

              {child.type === "rule" ? (
                <SingleFilterRule
                  columns={columns}
                  labels={labels}
                  onChange={(updatedRule) => handleChildChange(index, updatedRule)}
                  onRemove={() => handleChildRemove(index)}
                  rule={child}
                  showRemove={group.children.length > 1 || !isRoot}
                />
              ) : (
                <FilterGroupContainer
                  columns={columns}
                  depth={depth + 1}
                  group={child}
                  labels={labels}
                  onChange={(updatedGroup) => handleChildChange(index, updatedGroup)}
                  onRemove={() => handleChildRemove(index)}
                />
              )}
            </div>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 border-t p-2">
        <div className="flex items-center gap-2">
          <Button className="h-7 gap-1 text-xs" onClick={handleAddRule} size="sm" variant="outline">
            <Plus className="size-3" />
            {labels.addRule}
          </Button>
          {canAddGroup && (
            <Button
              className="h-7 gap-1 text-xs"
              onClick={handleAddGroup}
              size="sm"
              variant="outline"
            >
              <FolderPlus className="size-3" />
              {labels.addGroup}
            </Button>
          )}
        </div>
        {isRoot && group.children.length > 0 && (
          <Button className="h-7 text-xs" onClick={handleClearAll} size="sm" variant="ghost">
            {labels.clearAll}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * AdvancedFilterBuilder - Main filter builder component
 * Features:
 * - Nested filter groups with AND/OR logic
 * - Visual rule builder with joiners
 * - Add rule/group buttons
 * - Clear all functionality
 */
export function AdvancedFilterBuilder<TData>({
  columns,
  filterState,
  onFilterChange,
  labels,
  className,
}: AdvancedFilterBuilderProps<TData>) {
  const mergedLabels = { ...defaultDataTableLabels, ...labels };

  return (
    <div className={cn("space-y-4", className)}>
      <FilterGroupContainer
        columns={columns}
        group={filterState}
        isRoot
        labels={mergedLabels}
        onChange={onFilterChange}
      />
    </div>
  );
}
