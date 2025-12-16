import { assertType, describe, expect, expectTypeOf, test } from "vitest";
import type { z } from "zod";
import {
  columnsToZodSchema,
  type FnSphereFilterBuilderProps as FunctionSphereFilterBuilderProps,
  getColumnLabel,
  inferIsBoolean,
  inferIsDate,
  inferIsNumber,
} from "../components/fn-sphere-filter-builder";
import type { DataTableColumn } from "../types";

// ============================================
// Test Data Types
// ============================================
type TestVehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  hasWarranty: boolean;
  mileage: number;
  status: "available" | "sold";
};

// ============================================
// Runtime Tests - Type Inference Functions
// ============================================
describe("inferIsDate", () => {
  test("returns true for date-related keys", () => {
    expect(inferIsDate("date")).toBe(true);
    expect(inferIsDate("Date")).toBe(true);
    expect(inferIsDate("createdAt")).toBe(true);
    expect(inferIsDate("updatedAt")).toBe(true);
    expect(inferIsDate("timestamp")).toBe(true);
    expect(inferIsDate("birthDate")).toBe(true);
    expect(inferIsDate("purchaseDate")).toBe(true);
    expect(inferIsDate("startTime")).toBe(true);
    expect(inferIsDate("endTime")).toBe(true);
    expect(inferIsDate("soldAt")).toBe(true);
  });

  test("returns false for non-date keys", () => {
    expect(inferIsDate("name")).toBe(false);
    expect(inferIsDate("email")).toBe(false);
    expect(inferIsDate("price")).toBe(false);
    expect(inferIsDate("status")).toBe(false);
    expect(inferIsDate("id")).toBe(false);
    expect(inferIsDate("category")).toBe(false);
  });

  test("handles edge cases", () => {
    expect(inferIsDate("")).toBe(false);
    expect(inferIsDate("dated")).toBe(true); // contains "date"
    expect(inferIsDate("datingApp")).toBe(false); // doesn't match any date patterns
    expect(inferIsDate("datetime")).toBe(true); // contains "date" AND "time"
  });
});

describe("inferIsNumber", () => {
  test("returns true for number-related keys", () => {
    expect(inferIsNumber("age")).toBe(true);
    expect(inferIsNumber("count")).toBe(true);
    expect(inferIsNumber("price")).toBe(true);
    expect(inferIsNumber("amount")).toBe(true);
    expect(inferIsNumber("total")).toBe(true);
    expect(inferIsNumber("quantity")).toBe(true);
    expect(inferIsNumber("number")).toBe(true);
    expect(inferIsNumber("mileage")).toBe(true);
    expect(inferIsNumber("year")).toBe(true);
    expect(inferIsNumber("itemCount")).toBe(true);
    expect(inferIsNumber("totalPrice")).toBe(true);
    expect(inferIsNumber("userAge")).toBe(true);
  });

  test("returns false for non-number keys", () => {
    expect(inferIsNumber("name")).toBe(false);
    expect(inferIsNumber("email")).toBe(false);
    expect(inferIsNumber("status")).toBe(false);
    expect(inferIsNumber("id")).toBe(false);
    expect(inferIsNumber("description")).toBe(false);
    expect(inferIsNumber("isActive")).toBe(false);
  });

  test("handles edge cases", () => {
    expect(inferIsNumber("")).toBe(false);
    expect(inferIsNumber("Age")).toBe(true); // case insensitive
    expect(inferIsNumber("PRICE")).toBe(true); // case insensitive
  });
});

describe("inferIsBoolean", () => {
  test("returns true for boolean-related keys starting with is/has", () => {
    expect(inferIsBoolean("isActive")).toBe(true);
    expect(inferIsBoolean("isEnabled")).toBe(true);
    expect(inferIsBoolean("isVerified")).toBe(true);
    expect(inferIsBoolean("hasChildren")).toBe(true);
    expect(inferIsBoolean("hasWarranty")).toBe(true);
    expect(inferIsBoolean("hasPermission")).toBe(true);
  });

  test("returns true for keys containing active/enabled", () => {
    expect(inferIsBoolean("active")).toBe(true);
    expect(inferIsBoolean("enabled")).toBe(true);
    expect(inferIsBoolean("userActive")).toBe(true);
    expect(inferIsBoolean("featureEnabled")).toBe(true);
  });

  test("returns false for non-boolean keys", () => {
    expect(inferIsBoolean("name")).toBe(false);
    expect(inferIsBoolean("email")).toBe(false);
    expect(inferIsBoolean("status")).toBe(false);
    expect(inferIsBoolean("count")).toBe(false);
    expect(inferIsBoolean("date")).toBe(false);
  });

  test("handles edge cases", () => {
    expect(inferIsBoolean("")).toBe(false);
    expect(inferIsBoolean("IsActive")).toBe(true); // case insensitive
    expect(inferIsBoolean("HAS_ITEMS")).toBe(true); // uppercase with underscore
  });
});

describe("getColumnLabel", () => {
  test("returns header string when header is a string", () => {
    const column: DataTableColumn<TestVehicle> = {
      id: "make",
      accessorKey: "make",
      header: "Vehicle Make",
    };
    expect(getColumnLabel(column)).toBe("Vehicle Make");
  });

  test("returns column id when header is not a string", () => {
    const column: DataTableColumn<TestVehicle> = {
      id: "make",
      accessorKey: "make",
      header: () => "Function Header",
    };
    expect(getColumnLabel(column)).toBe("make");
  });

  test("returns column id when header is undefined", () => {
    const column: DataTableColumn<TestVehicle> = {
      id: "price",
      accessorKey: "price",
    };
    expect(getColumnLabel(column)).toBe("price");
  });
});

// ============================================
// Runtime Tests - columnsToZodSchema
// ============================================
describe("columnsToZodSchema", () => {
  test("creates schema with string fields by default", () => {
    const columns: DataTableColumn<TestVehicle>[] = [
      { id: "make", accessorKey: "make", header: "Make", enableFiltering: true },
      { id: "model", accessorKey: "model", header: "Model", enableFiltering: true },
    ];

    const schema = columnsToZodSchema(columns);
    const shape = schema.shape;

    expect(shape.make).toBeDefined();
    expect(shape.model).toBeDefined();

    // Verify it's a string schema
    const makeResult = shape.make.safeParse("Toyota");
    expect(makeResult.success).toBe(true);
  });

  test("infers number type from key names", () => {
    const columns: DataTableColumn<TestVehicle>[] = [
      { id: "year", accessorKey: "year", header: "Year", enableFiltering: true },
      { id: "price", accessorKey: "price", header: "Price", enableFiltering: true },
      { id: "mileage", accessorKey: "mileage", header: "Mileage", enableFiltering: true },
    ];

    const schema = columnsToZodSchema(columns);
    const shape = schema.shape;

    // Should be number schemas
    expect(shape.year.safeParse(2024).success).toBe(true);
    expect(shape.year.safeParse("2024").success).toBe(false);

    expect(shape.price.safeParse(50_000).success).toBe(true);
    expect(shape.mileage.safeParse(10_000).success).toBe(true);
  });

  test("infers date type from key names", () => {
    const columns: DataTableColumn<TestVehicle>[] = [
      { id: "createdAt", accessorKey: "createdAt", header: "Created", enableFiltering: true },
      { id: "updatedAt", accessorKey: "updatedAt", header: "Updated", enableFiltering: true },
    ];

    const schema = columnsToZodSchema(columns);
    const shape = schema.shape;

    // Should be date schemas
    expect(shape.createdAt.safeParse(new Date()).success).toBe(true);
    expect(shape.createdAt.safeParse("2024-01-01").success).toBe(false);

    expect(shape.updatedAt.safeParse(new Date()).success).toBe(true);
  });

  test("infers boolean type from key names", () => {
    const columns: DataTableColumn<TestVehicle>[] = [
      { id: "isActive", accessorKey: "isActive", header: "Active", enableFiltering: true },
      { id: "hasWarranty", accessorKey: "hasWarranty", header: "Warranty", enableFiltering: true },
    ];

    const schema = columnsToZodSchema(columns);
    const shape = schema.shape;

    // Should be boolean schemas
    expect(shape.isActive.safeParse(true).success).toBe(true);
    expect(shape.isActive.safeParse(false).success).toBe(true);
    expect(shape.isActive.safeParse("true").success).toBe(false);

    expect(shape.hasWarranty.safeParse(true).success).toBe(true);
  });

  test("respects explicit filterType in column meta", () => {
    const columns: DataTableColumn<TestVehicle>[] = [
      {
        id: "status",
        accessorKey: "status",
        header: "Status",
        enableFiltering: true,
        meta: { filterType: "string" },
      },
      {
        id: "rating",
        accessorKey: "rating" as keyof TestVehicle,
        header: "Rating",
        enableFiltering: true,
        meta: { filterType: "number" },
      },
      {
        id: "purchaseDate",
        accessorKey: "purchaseDate" as keyof TestVehicle,
        header: "Purchase Date",
        enableFiltering: true,
        meta: { filterType: "date" },
      },
      {
        id: "verified",
        accessorKey: "verified" as keyof TestVehicle,
        header: "Verified",
        enableFiltering: true,
        meta: { filterType: "boolean" },
      },
    ];

    const schema = columnsToZodSchema(columns);
    const shape = schema.shape;

    expect(shape.status.safeParse("available").success).toBe(true);
    expect(shape.rating.safeParse(5).success).toBe(true);
    expect(shape.rating.safeParse("5").success).toBe(false);
    expect(shape.purchaseDate.safeParse(new Date()).success).toBe(true);
    expect(shape.verified.safeParse(true).success).toBe(true);
  });

  test("skips columns with enableFiltering: false", () => {
    const columns: DataTableColumn<TestVehicle>[] = [
      { id: "make", accessorKey: "make", header: "Make", enableFiltering: true },
      { id: "model", accessorKey: "model", header: "Model", enableFiltering: false },
      { id: "year", accessorKey: "year", header: "Year" }, // undefined enableFiltering
    ];

    const schema = columnsToZodSchema(columns);
    const shape = schema.shape;

    expect(shape.make).toBeDefined();
    expect(shape.model).toBeUndefined();
    expect(shape.year).toBeDefined(); // undefined is not false
  });

  test("uses accessorKey as field name when present", () => {
    const columns: DataTableColumn<TestVehicle>[] = [
      { id: "vehicleMake", accessorKey: "make", header: "Make", enableFiltering: true },
    ];

    const schema = columnsToZodSchema(columns);
    const shape = schema.shape;

    // Should use accessorKey "make" not id "vehicleMake"
    expect(shape.make).toBeDefined();
    expect(shape.vehicleMake).toBeUndefined();
  });

  test("uses column id when accessorKey is not present", () => {
    const columns: DataTableColumn<TestVehicle>[] = [
      { id: "customField", header: "Custom", enableFiltering: true },
    ];

    const schema = columnsToZodSchema(columns);
    const shape = schema.shape;

    expect(shape.customField).toBeDefined();
  });

  test("skips columns without id or accessorKey", () => {
    const columns: DataTableColumn<TestVehicle>[] = [
      { id: "", header: "Empty ID", enableFiltering: true },
    ];

    const schema = columnsToZodSchema(columns);
    const keys = Object.keys(schema.shape);

    expect(keys.length).toBe(0);
  });

  test("adds description from header to zod schema", () => {
    const columns: DataTableColumn<TestVehicle>[] = [
      { id: "make", accessorKey: "make", header: "Vehicle Make", enableFiltering: true },
    ];

    const schema = columnsToZodSchema(columns);
    const shape = schema.shape;

    // The description is set via .meta({ description }) which sets the .description property
    expect((shape.make as unknown as { description?: string }).description).toBe("Vehicle Make");
  });

  test("handles empty columns array", () => {
    const columns: DataTableColumn<TestVehicle>[] = [];

    const schema = columnsToZodSchema(columns);
    const keys = Object.keys(schema.shape);

    expect(keys.length).toBe(0);
    expect(schema.safeParse({}).success).toBe(true);
  });

  test("creates valid composite schema", () => {
    const columns: DataTableColumn<TestVehicle>[] = [
      { id: "make", accessorKey: "make", header: "Make", enableFiltering: true },
      { id: "year", accessorKey: "year", header: "Year", enableFiltering: true },
      { id: "isActive", accessorKey: "isActive", header: "Active", enableFiltering: true },
      { id: "createdAt", accessorKey: "createdAt", header: "Created", enableFiltering: true },
    ];

    const schema = columnsToZodSchema(columns);

    // Test parsing a complete object
    const validData = {
      make: "Toyota",
      year: 2024,
      isActive: true,
      createdAt: new Date(),
    };

    expect(schema.safeParse(validData).success).toBe(true);

    // Test with invalid types
    const invalidData = {
      make: 123, // should be string
      year: "2024", // should be number
      isActive: "true", // should be boolean
      createdAt: "2024-01-01", // should be Date
    };

    expect(schema.safeParse(invalidData).success).toBe(false);
  });
});

// ============================================
// Type-Safety Tests using Vitest expectTypeOf
// ============================================
describe("Type utilities - FnSphereFilterBuilderProps", () => {
  test("columns property accepts DataTableColumn array", () => {
    type Props = FunctionSphereFilterBuilderProps<TestVehicle>;

    expectTypeOf<Props["columns"]>().toEqualTypeOf<DataTableColumn<TestVehicle>[]>();
  });

  test("onFilterChange callback receives predicate function", () => {
    type Props = FunctionSphereFilterBuilderProps<TestVehicle>;
    type OnFilterChange = Props["onFilterChange"];

    // onFilterChange should be optional
    expectTypeOf<OnFilterChange>().toBeNullable();

    // When defined, it should accept a predicate
    type Predicate = (item: TestVehicle) => boolean;
    expectTypeOf<(predicate: Predicate) => void>().toMatchTypeOf<NonNullable<OnFilterChange>>();
  });

  test("className property is optional string", () => {
    type Props = FunctionSphereFilterBuilderProps<TestVehicle>;

    expectTypeOf<Props["className"]>().toEqualTypeOf<string | undefined>();
  });
});

describe("Type utilities - DataTableColumn for filtering", () => {
  test("accessorKey can be a key of TData", () => {
    type Column = DataTableColumn<TestVehicle>;

    // Valid accessor keys
    const validColumn: Column = {
      id: "make",
      accessorKey: "make",
    };
    assertType<Column>(validColumn);

    const anotherValidColumn: Column = {
      id: "price",
      accessorKey: "price",
    };
    assertType<Column>(anotherValidColumn);
  });

  test("enableFiltering is optional boolean", () => {
    type Column = DataTableColumn<TestVehicle>;

    expectTypeOf<Column["enableFiltering"]>().toEqualTypeOf<boolean | undefined>();
  });

  test("meta.filterType accepts specific string values", () => {
    // This tests that the implementation correctly reads meta.filterType
    const columnWithMeta: DataTableColumn<TestVehicle> = {
      id: "status",
      accessorKey: "status",
      meta: { filterType: "string" },
    };

    assertType<DataTableColumn<TestVehicle>>(columnWithMeta);
  });
});

describe("Type utilities - columnsToZodSchema return type", () => {
  test("returns ZodObject with ZodTypeAny values", () => {
    const columns: DataTableColumn<TestVehicle>[] = [];
    const result = columnsToZodSchema(columns);

    expectTypeOf(result).toMatchTypeOf<z.ZodObject<Record<string, z.ZodTypeAny>>>();
  });

  test("schema shape has string keys", () => {
    const columns: DataTableColumn<TestVehicle>[] = [];
    const result = columnsToZodSchema(columns);

    expectTypeOf(result.shape).toMatchTypeOf<Record<string, z.ZodTypeAny>>();
  });
});

describe("Type utilities - inference functions", () => {
  test("inferIsDate accepts string and returns boolean", () => {
    expectTypeOf(inferIsDate).toBeFunction();
    expectTypeOf(inferIsDate).parameters.toEqualTypeOf<[string]>();
    expectTypeOf(inferIsDate).returns.toBeBoolean();
  });

  test("inferIsNumber accepts string and returns boolean", () => {
    expectTypeOf(inferIsNumber).toBeFunction();
    expectTypeOf(inferIsNumber).parameters.toEqualTypeOf<[string]>();
    expectTypeOf(inferIsNumber).returns.toBeBoolean();
  });

  test("inferIsBoolean accepts string and returns boolean", () => {
    expectTypeOf(inferIsBoolean).toBeFunction();
    expectTypeOf(inferIsBoolean).parameters.toEqualTypeOf<[string]>();
    expectTypeOf(inferIsBoolean).returns.toBeBoolean();
  });

  test("getColumnLabel accepts DataTableColumn and returns string", () => {
    expectTypeOf(getColumnLabel<TestVehicle>).toBeFunction();
    expectTypeOf(getColumnLabel<TestVehicle>).returns.toBeString();
  });
});
