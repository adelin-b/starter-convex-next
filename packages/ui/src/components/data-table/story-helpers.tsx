import type { DataTableColumn } from "./types";

/**
 * Shared utilities for DataTable component stories
 */

// Common sample columns for stories
export const sampleUserColumns: DataTableColumn<{
  name: string;
  email: string;
  role: string;
  status: string;
  age: number;
}>[] = [
  {
    id: "name",
    header: "Name",
    accessorKey: "name",
    enableSorting: true,
    enableFiltering: true,
  },
  {
    id: "email",
    header: "Email",
    accessorKey: "email",
    enableSorting: true,
    enableFiltering: true,
  },
  {
    id: "role",
    header: "Role",
    accessorKey: "role",
    enableSorting: true,
    enableFiltering: true,
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    enableFiltering: true,
  },
  {
    id: "age",
    header: "Age",
    accessorKey: "age",
    enableSorting: true,
  },
];

// Generate many columns for scroll/overflow tests
export function generateManyColumns(count: number): DataTableColumn<Record<string, string>>[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `column-${i}`,
    header: `Column ${i + 1}`,
    accessorKey: `field${i}`,
    enableSorting: true,
    enableFiltering: true,
  }));
}

/**
 * Debug output component for showing state in stories
 */
export function StoryDebugOutput({ label, data }: { label: string; data: unknown }) {
  return (
    <div className="w-64 rounded-md border p-2 text-xs">
      <div className="font-medium">{label}:</div>
      <pre className="mt-1 overflow-auto">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

/**
 * Selected value display component for relation selector stories
 */
export function SelectedValueDisplay({
  selected,
  label = "Selected",
}: {
  selected: unknown;
  label?: string;
}) {
  return (
    <div className="mt-4 rounded-md border bg-muted/50 p-3 text-sm">
      <div className="font-semibold">{label}:</div>
      <code className="text-xs">{JSON.stringify(selected)}</code>
    </div>
  );
}

/**
 * Story wrapper component for relation selector examples
 */
export function RelationSelectorStoryWrapper({
  children,
  width = "w-[400px]",
}: {
  children: React.ReactNode;
  width?: string;
}) {
  return <div className={width}>{children}</div>;
}
