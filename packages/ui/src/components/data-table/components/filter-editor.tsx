"use client";

import { assertNever } from "@starter-saas/shared/assert-never";
import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "../../../utils";
import { Button } from "../../button";
import { Input } from "../../input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../select";
import { FILTER_OPERATORS } from "../constants";
import type { DataTableLabels } from "../labels";
import { defaultDataTableLabels } from "../labels";
import type { DataTableColumn, Filter, FilterOperator } from "../types";

export type FilterEditorProps<TData> = {
  filter: Filter;
  columns: DataTableColumn<TData>[];
  onChange: (filter: Filter) => void;
  onRemove: () => void;
  className?: string;
  labels?: DataTableLabels;
};

/**
 * Infer data type from column
 * Priority: explicit meta.filterType > accessorKey analysis > default to string
 */
function inferColumnType<TData>(
  column: DataTableColumn<TData>,
): "string" | "number" | "date" | "boolean" {
  // Check if column has explicit type metadata
  const explicitType = (column.meta as { filterType?: string })?.filterType;
  if (explicitType && ["string", "number", "date", "boolean"].includes(explicitType)) {
    return explicitType as "string" | "number" | "date" | "boolean";
  }

  // Infer from accessorKey or id
  // TanStack Table columns can have either accessorKey or accessorFn, so we need to check
  const accessorKey = "accessorKey" in column ? column.accessorKey : undefined;
  const key = (typeof accessorKey === "string" ? accessorKey : column.id) || "";
  const lowerKey = key.toLowerCase();

  // Date indicators
  if (
    lowerKey.includes("date") ||
    lowerKey.includes("time") ||
    lowerKey.includes("created") ||
    lowerKey.includes("updated") ||
    lowerKey.endsWith("at")
  ) {
    return "date";
  }

  // Number indicators
  if (
    lowerKey.includes("age") ||
    lowerKey.includes("count") ||
    lowerKey.includes("price") ||
    lowerKey.includes("amount") ||
    lowerKey.includes("total") ||
    lowerKey.includes("quantity") ||
    lowerKey.includes("number") ||
    lowerKey.includes("id")
  ) {
    return "number";
  }

  // Boolean indicators
  if (
    lowerKey.startsWith("is") ||
    lowerKey.startsWith("has") ||
    lowerKey.includes("active") ||
    lowerKey.includes("enabled")
  ) {
    return "boolean";
  }

  // Default to string
  return "string";
}

/**
 * Get unique values for a column for multi-select filters
 * In a real app, this would come from the data or API
 */
function getColumnOptions<TData>(
  _column: DataTableColumn<TData>,
  _columns: DataTableColumn<TData>[],
): Array<{ value: string; label: string }> {
  // For now, return empty array - in real implementation, this would fetch unique values
  // from the actual data
  return [];
}

/**
 * FilterEditor - Individual filter editing component
 * Allows editing column, operator, and value for a single filter
 *
 * Features:
 * - Type-aware operator selection (only show relevant operators for column type)
 * - Dynamic value input based on operator inputType:
 *   - text: Input field
 *   - number: Number input
 *   - date: Date input
 *   - select: Single select dropdown
 *   - multiselect: Multiple selection
 *   - none: No input (isEmpty, isNotEmpty, etc.)
 * - Column type inference from accessorKey or explicit meta.filterType
 */
export function FilterEditor<TData>({
  filter,
  columns,
  onChange,
  onRemove,
  className,
  labels,
}: FilterEditorProps<TData>) {
  const [localValue, setLocalValue] = useState(String(filter.value || ""));
  const mergedLabels = { ...defaultDataTableLabels, ...labels };

  // Get selected column
  const selectedColumn = useMemo(
    () => columns.find((col) => col.id === filter.column),
    [columns, filter.column],
  );

  // Infer column type
  const columnType = useMemo(
    () => (selectedColumn ? inferColumnType(selectedColumn) : "string"),
    [selectedColumn],
  );

  // Get operators for this column type
  const availableOperators = useMemo(
    () => FILTER_OPERATORS.filter((op) => op.availableFor.includes(columnType)),
    [columnType],
  );

  // Get current operator config
  const currentOperator = useMemo(
    () => FILTER_OPERATORS.find((op) => op.value === filter.operator),
    [filter.operator],
  );

  // Handle column change
  const handleColumnChange = (columnId: string | null) => {
    if (columnId === null) return;
    const newColumn = columns.find((col) => col.id === columnId);
    if (!newColumn) {
      return;
    }

    const newColumnType = inferColumnType(newColumn);
    const newOperator_ = FILTER_OPERATORS.find((op) => op.availableFor.includes(newColumnType));

    // Reset to first available operator for new column type
    const newOperator = newOperator_?.value || "equals";

    onChange({
      ...filter,
      column: columnId,
      operator: newOperator as FilterOperator,
      value: "",
    });
    setLocalValue("");
  };

  // Handle operator change
  const handleOperatorChange = (operatorValue: string | null) => {
    if (operatorValue === null) return;
    const newOperator = FILTER_OPERATORS.find((op) => op.value === operatorValue);
    if (!newOperator) {
      return;
    }

    // Reset value if switching to/from "none" inputType
    const shouldResetValue =
      newOperator.inputType === "none" || currentOperator?.inputType === "none";

    onChange({
      ...filter,
      operator: operatorValue as FilterOperator,
      value: shouldResetValue ? "" : filter.value,
    });

    if (shouldResetValue) {
      setLocalValue("");
    }
  };

  // Handle value change
  const handleValueChange = (value: string | string[] | null) => {
    if (value === null) return;
    onChange({
      ...filter,
      value,
    });
    setLocalValue(Array.isArray(value) ? value.join(", ") : value);
  };

  // Render value input based on operator inputType
  const renderValueInput = () => {
    if (!currentOperator || currentOperator.inputType === "none") {
      return null;
    }

    switch (currentOperator.inputType) {
      case "text": {
        return (
          <Input
            className="flex-1"
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={mergedLabels.enterValue}
            type="text"
            value={localValue}
          />
        );
      }

      case "number": {
        return (
          <Input
            className="flex-1"
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={mergedLabels.enterNumber}
            type="number"
            value={localValue}
          />
        );
      }

      case "date": {
        return (
          <Input
            className="flex-1"
            onChange={(e) => handleValueChange(e.target.value)}
            type="date"
            value={localValue}
          />
        );
      }

      case "select": {
        const options = getColumnOptions(selectedColumn!, columns);
        return (
          <Select onValueChange={handleValueChange} value={String(filter.value || "")}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={mergedLabels.selectValue} />
            </SelectTrigger>
            <SelectContent>
              {options.length === 0 ? (
                <SelectItem disabled value="">
                  {mergedLabels.noOptionsAvailable}
                </SelectItem>
              ) : (
                options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        );
      }

      case "multiselect": {
        const options = getColumnOptions(selectedColumn!, columns);
        return (
          <Select
            onValueChange={(value) => {
              // In a real implementation, this would handle multiple selections
              // For now, treating as single select
              handleValueChange(value);
            }}
            value={String(filter.value || "")}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={mergedLabels.selectValues} />
            </SelectTrigger>
            <SelectContent>
              {options.length === 0 ? (
                <SelectItem disabled value="">
                  {mergedLabels.noOptionsAvailable}
                </SelectItem>
              ) : (
                options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        );
      }

      default: {
        assertNever(currentOperator.inputType);
      }
    }
  };

  return (
    <div className={cn("flex flex-col gap-2 rounded-md border bg-muted/50 p-3", className)}>
      {/* Row 1: Column and Operator */}
      <div className="flex gap-2">
        {/* Column selector */}
        <Select onValueChange={handleColumnChange} value={filter.column}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={mergedLabels.selectColumn} />
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
        <Select onValueChange={handleOperatorChange} value={filter.operator}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={mergedLabels.selectOperator} />
          </SelectTrigger>
          <SelectContent>
            {availableOperators.map((operator) => (
              <SelectItem key={operator.value} value={operator.value}>
                {operator.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Remove button */}
        <Button
          aria-label={mergedLabels.removeFilter}
          onClick={onRemove}
          size="sm"
          type="button"
          variant="ghost"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Row 2: Value input (if needed) */}
      {currentOperator && currentOperator.inputType !== "none" && (
        <div className="flex gap-2">{renderValueInput()}</div>
      )}
    </div>
  );
}
