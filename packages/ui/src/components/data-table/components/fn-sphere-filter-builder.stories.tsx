import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import type { DataTableColumn } from "../types";
import { FnSphereFilterBuilder } from "./fn-sphere-filter-builder";

type SampleData = {
  id: string;
  name: string;
  email: string;
  age: number;
  createdAt: Date;
  isActive: boolean;
  department: string;
  salary: number;
};

const sampleColumns: DataTableColumn<SampleData>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Name",
    enableFiltering: true,
  },
  {
    id: "email",
    accessorKey: "email",
    header: "Email",
    enableFiltering: true,
  },
  {
    id: "age",
    accessorKey: "age",
    header: "Age",
    enableFiltering: true,
    meta: { filterType: "number" },
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Created At",
    enableFiltering: true,
    meta: { filterType: "date" },
  },
  {
    id: "isActive",
    accessorKey: "isActive",
    header: "Active",
    enableFiltering: true,
    meta: { filterType: "boolean" },
  },
  {
    id: "department",
    accessorKey: "department",
    header: "Department",
    enableFiltering: true,
  },
  {
    id: "salary",
    accessorKey: "salary",
    header: "Salary",
    enableFiltering: true,
    meta: { filterType: "number" },
  },
];

// Sample data for testing the filter
const sampleData: SampleData[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    age: 30,
    createdAt: new Date("2024-01-15"),
    isActive: true,
    department: "Engineering",
    salary: 85_000,
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    age: 28,
    createdAt: new Date("2024-02-20"),
    isActive: true,
    department: "Marketing",
    salary: 72_000,
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    age: 45,
    createdAt: new Date("2023-12-01"),
    isActive: false,
    department: "Engineering",
    salary: 95_000,
  },
  {
    id: "4",
    name: "Alice Brown",
    email: "alice@example.com",
    age: 35,
    createdAt: new Date("2024-03-10"),
    isActive: true,
    department: "Sales",
    salary: 68_000,
  },
];

const meta: Meta<typeof FnSphereFilterBuilder<SampleData>> = {
  title: "composite/Datatable/FnSphereFilterBuilder",
  component: FnSphereFilterBuilder<SampleData>,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic fn-sphere filter builder with all column types.
 * Shows filtering for string, number, date, and boolean fields.
 */
export const Default: Story = {
  args: {
    columns: sampleColumns,
  },
  render: (args) => {
    const [filteredData, setFilteredData] = useState(sampleData);

    const handleFilterChange = (predicate: (item: SampleData) => boolean) => {
      const filtered = sampleData.filter(predicate);
      setFilteredData(filtered);
      console.log("Filtered data:", filtered);
    };

    return (
      <div className="space-y-6">
        <div className="rounded-lg border p-4">
          <h3 className="mb-4 font-semibold">fn-sphere Filter Builder</h3>
          <FnSphereFilterBuilder {...args} onFilterChange={handleFilterChange} />
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="mb-4 font-semibold">
            Filtered Results ({filteredData.length} of {sampleData.length})
          </h3>
          <div className="space-y-2">
            {filteredData.map((item) => (
              <div className="flex items-center gap-4 rounded bg-muted p-2 text-sm" key={item.id}>
                <span className="font-medium">{item.name}</span>
                <span className="text-muted-foreground">{item.email}</span>
                <span>Age: {item.age}</span>
                <span>Dept: {item.department}</span>
                <span className={item.isActive ? "text-green-600" : "text-red-600"}>
                  {item.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
            {filteredData.length === 0 && (
              <div className="py-4 text-center text-muted-foreground">No matching records</div>
            )}
          </div>
        </div>
      </div>
    );
  },
};

/**
 * fn-sphere filter builder with custom styling.
 */
export const WithCustomClassName: Story = {
  args: {
    columns: sampleColumns,
    className: "rounded-lg border bg-muted/30 p-4",
  },
};

/**
 * fn-sphere filter builder showing type inference from column names.
 * Columns like "age" are inferred as numbers, "createdAt" as date, "isActive" as boolean.
 */
export const TypeInference: Story = {
  args: {
    columns: [
      { id: "name", accessorKey: "name", header: "Name", enableFiltering: true },
      { id: "age", accessorKey: "age", header: "Age", enableFiltering: true },
      { id: "createdAt", accessorKey: "createdAt", header: "Created At", enableFiltering: true },
      { id: "updatedAt", accessorKey: "updatedAt", header: "Updated At", enableFiltering: true },
      { id: "isActive", accessorKey: "isActive", header: "Active", enableFiltering: true },
      {
        id: "hasChildren",
        accessorKey: "hasChildren",
        header: "Has Children",
        enableFiltering: true,
      },
      { id: "price", accessorKey: "price", header: "Price", enableFiltering: true },
      { id: "quantity", accessorKey: "quantity", header: "Quantity", enableFiltering: true },
    ] as DataTableColumn<SampleData>[],
  },
};
