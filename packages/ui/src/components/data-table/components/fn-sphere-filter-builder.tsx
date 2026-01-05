"use client";

import {
  FilterBuilder,
  FilterSphereProvider,
  FilterThemeProvider,
  useFilterSphere,
} from "@fn-sphere/filter";
import { useMemo } from "react";
import { z } from "zod";
import { shadcnFilterTheme } from "../fn-sphere-theme";
import type { DataTableColumn } from "../types";

export type FnSphereFilterBuilderProps<TData> = {
  columns: DataTableColumn<TData>[];
  onFilterChange?: (predicate: (item: TData) => boolean) => void;
  className?: string;
};

/**
 * Infer the Zod type for a column based on explicit meta or naming conventions
 */
function inferZodType(
  key: string,
  explicitType: string | undefined,
): "date" | "number" | "boolean" | "string" {
  if (explicitType === "date" || inferIsDate(key)) {
    return "date";
  }
  if (explicitType === "number" || inferIsNumber(key)) {
    return "number";
  }
  if (explicitType === "boolean" || inferIsBoolean(key)) {
    return "boolean";
  }
  return "string";
}

/**
 * Create a Zod schema for the inferred type with description metadata
 */
function createZodSchemaForType(
  type: "date" | "number" | "boolean" | "string",
  label: string,
): z.ZodTypeAny {
  const schemas = {
    date: () => z.date().meta({ description: label }),
    number: () => z.number().meta({ description: label }),
    boolean: () => z.boolean().meta({ description: label }),
    string: () => z.string().meta({ description: label }),
  };
  return schemas[type]();
}

/**
 * Extract the field key from a column definition
 */
function getColumnKey<TData>(column: DataTableColumn<TData>): string {
  const accessorKey = "accessorKey" in column ? column.accessorKey : undefined;
  return (typeof accessorKey === "string" ? accessorKey : column.id) || "";
}

/**
 * Convert DataTableColumn to a Zod schema
 * fn-sphere uses Zod schemas to understand data types and generate appropriate filters
 */
export function columnsToZodSchema<TData>(
  columns: DataTableColumn<TData>[],
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const column of columns) {
    if (column.enableFiltering === false) {
      continue;
    }

    const key = getColumnKey(column);
    if (!key) {
      continue;
    }

    const explicitType = (column.meta as { filterType?: string })?.filterType;
    const zodType = inferZodType(key, explicitType);
    shape[key] = createZodSchemaForType(zodType, getColumnLabel(column));
  }

  return z.object(shape);
}

export function getColumnLabel<TData>(column: DataTableColumn<TData>): string {
  if (typeof column.header === "string") {
    return column.header;
  }
  return column.id;
}

export function inferIsDate(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return (
    lowerKey.includes("date") ||
    lowerKey.includes("time") ||
    lowerKey.includes("created") ||
    lowerKey.includes("updated") ||
    lowerKey.endsWith("at")
  );
}

export function inferIsNumber(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return (
    lowerKey.includes("age") ||
    lowerKey.includes("count") ||
    lowerKey.includes("price") ||
    lowerKey.includes("amount") ||
    lowerKey.includes("total") ||
    lowerKey.includes("quantity") ||
    lowerKey.includes("number") ||
    lowerKey.includes("mileage") ||
    lowerKey.includes("year")
  );
}

export function inferIsBoolean(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return (
    lowerKey.startsWith("is") ||
    lowerKey.startsWith("has") ||
    lowerKey.includes("active") ||
    lowerKey.includes("enabled")
  );
}

/**
 * FnSphereFilterBuilder - Advanced filter builder using fn-sphere library
 *
 * Features:
 * - Automatic schema inference from DataTable columns
 * - Shadcn-styled UI components
 * - Custom date picker with Calendar
 * - Nested filter groups with AND/OR logic
 * - Type-aware filter operators
 */
export function FnSphereFilterBuilder<TData>({
  columns,
  onFilterChange,
  className,
}: FnSphereFilterBuilderProps<TData>) {
  // Generate Zod schema from columns
  const schema = useMemo(() => columnsToZodSchema(columns), [columns]);

  // Initialize fn-sphere hook
  const { context } = useFilterSphere({
    schema,
    onRuleChange: ({ predicate }) => {
      onFilterChange?.(predicate as (item: TData) => boolean);
    },
  });

  return (
    <div className={className}>
      <FilterThemeProvider theme={shadcnFilterTheme}>
        <FilterSphereProvider context={context}>
          <FilterBuilder />
        </FilterSphereProvider>
      </FilterThemeProvider>
    </div>
  );
}
