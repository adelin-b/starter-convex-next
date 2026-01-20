// Server-only enforcement handled by package.json exports

import { assertNever } from "@starter-saas/shared/assert-never";
import {
  type DataModelFromSchemaDefinition,
  type DocumentByName,
  type FunctionVisibility,
  type GenericSchema,
  type Indexes,
  internalMutationGeneric,
  internalQueryGeneric,
  type MutationBuilder,
  type NamedTableInfo,
  type PaginationResult,
  paginationOptsValidator,
  type QueryBuilder,
  type RegisteredMutation,
  type RegisteredQuery,
  type SchemaDefinition,
  type TableNamesInDataModel,
  type WithoutSystemFields,
} from "convex/server";
import { type GenericId, type Infer, v } from "convex/values";
import { partial } from "convex-helpers/validators";
import { AppErrors } from "../lib/errors";

// biome-ignore lint/performance/noBarrelFile: Re-export convex-helpers for unified CRUD imports
export { filter } from "convex-helpers/server/filter";
export {
  getManyFrom,
  getManyVia,
  getManyViaOrThrow,
  getOneFrom,
  getOneFromOrThrow,
} from "convex-helpers/server/relationships";

const DEFAULT_LIMIT = 1000;

// ============================================
// Type utilities for type-safe field paths
// ============================================

/**
 * Recursively extract all valid field paths from a type including nested paths.
 * Supports dot notation like "specs.engine.type"
 *
 * @example
 * type Doc = { name: string; specs: { engine: { type: string } } }
 * type Paths = FieldPaths<Doc>; // "name" | "specs" | "specs.engine" | "specs.engine.type"
 */
export type FieldPaths<T, Prefix extends string = ""> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ?
            | (Prefix extends "" ? K : `${Prefix}.${K}`)
            | FieldPaths<T[K], Prefix extends "" ? K : `${Prefix}.${K}`>
        : Prefix extends ""
          ? K
          : `${Prefix}.${K}`;
    }[keyof T & string]
  : never;

/**
 * Get the type of a nested field using dot notation path
 *
 * @example
 * type Doc = { specs: { engine: { hp: number } } }
 * type HP = FieldType<Doc, "specs.engine.hp">; // number
 */
export type FieldType<T, Path extends string> = Path extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? FieldType<T[K], Rest>
    : never
  : Path extends keyof T
    ? T[Path]
    : never;

/**
 * Extract all index names from a table in the DataModel.
 * Uses Convex's built-in Indexes type to get the index map, then extracts keys.
 *
 * @example
 * type VehicleIndexNames = IndexNames<DataModel, "vehicles">;
 * // => "by_status" | "by_make" | "by_license_plate"
 */
export type IndexNames<
  DataModel,
  TableName extends keyof DataModel,
> = DataModel[TableName] extends { indexes: infer I } ? keyof I & string : never;

/**
 * Extract the field names from a specific index.
 * Convex indexes are stored as arrays of field names.
 *
 * @example
 * type StatusIndexFields = IndexFields<DataModel, "vehicles", "by_status">;
 * // => "status"
 *
 * type ChannelUserFields = IndexFields<DataModel, "messages", "by_channel_user">;
 * // => "channel" | "user"
 */
export type IndexFields<
  DataModel,
  TableName extends keyof DataModel,
  IndexName extends IndexNames<DataModel, TableName>,
> = DataModel[TableName] extends { indexes: infer I }
  ? IndexName extends keyof I
    ? I[IndexName] extends readonly (infer F)[]
      ? F extends string
        ? F
        : never
      : never
    : never
  : never;

/**
 * Extract the value type for a given field from a document type.
 * Handles nested paths via dot notation (e.g., "specs.engine.type").
 */
type FieldValueType<Document, Field extends string> = Field extends keyof Document
  ? Document[Field]
  : Field extends `${infer Parent}.${infer Rest}`
    ? Parent extends keyof Document
      ? Document[Parent] extends object
        ? FieldValueType<Document[Parent], Rest>
        : never
      : never
    : never;

/**
 * Value type based on operator:
 * - "in" expects an array of the field type
 * - "between" expects a [min, max] tuple
 * - Others expect the field type directly
 */
type OperatorValueType<T, Op extends FilterOperator> = Op extends "in"
  ? T[]
  : Op extends "between"
    ? [T, T]
    : T;

/**
 * Type-safe filter condition for a specific field.
 * Creates proper value types based on field and operator.
 */
type TypedFilterForField<Document, Field extends string> = {
  [Op in FilterOperator]: {
    field: Field;
    operator: Op;
    value: OperatorValueType<FieldValueType<Document, Field>, Op>;
  };
}[FilterOperator];

/**
 * Filter condition restricted to fields in a specific index with type-safe values.
 * Creates a discriminated union where each field has its correct value type.
 *
 * @example
 * // For by_status index on vehicles table:
 * type StatusFilter = IndexFieldFilter<DataModel, "vehicles", "by_status">;
 * // field: "status" | "_creationTime"
 * // If field is "status", value autocompletes to "available" | "reserved" | "sold"
 */
export type IndexFieldFilter<
  DataModel,
  TableName extends keyof DataModel,
  IndexName extends IndexNames<DataModel, TableName>,
  Document = DataModel[TableName] extends { document: infer D } ? D : never,
> = {
  [F in IndexFields<DataModel, TableName, IndexName>]: TypedFilterForField<Document, F>;
}[IndexFields<DataModel, TableName, IndexName>];

/**
 * Filter operator types for advanced querying
 * - eq: Equality (uses index when available)
 * - neq: Not equal (post-filter)
 * - gt/gte/lt/lte: Range operators (use index when available)
 * - in: Value in array (JS filter)
 * - contains: String contains, case-insensitive (JS filter)
 * - startsWith: String prefix match, case-insensitive (JS filter)
 * - endsWith: String suffix match, case-insensitive (JS filter)
 * - before: Date/timestamp less than (post-filter, alias for lt)
 * - after: Date/timestamp greater than (post-filter, alias for gt)
 * - between: Range inclusive [start, end] (JS filter)
 */
export type FilterOperator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "in"
  | "contains"
  | "startsWith"
  | "endsWith"
  | "before"
  | "after"
  | "between";

/**
 * A single field filter condition (runtime type - used by validators)
 */
type FieldFilter = {
  field: string;
  operator: FilterOperator;
  value: unknown;
};

/**
 * Type-safe field filter condition with typed values.
 * Creates a discriminated union where each field has its correct value type.
 *
 * @example
 * type VehicleFilter = TypedFieldFilter<Vehicle>;
 * // When field is "status", value autocompletes to "available" | "reserved" | "sold"
 * // When field is "price", value must be number
 * // When operator is "in" and field is "status", value must be ("available" | "reserved" | "sold")[]
 */
export type TypedFieldFilter<T> = {
  [F in FieldPaths<T>]: TypedFilterForField<T, F>;
}[FieldPaths<T>];

/**
 * Type-safe advanced filter configuration.
 * Restricts field names to valid paths from the document type.
 */
export type TypedAdvancedFilter<T> = {
  indexName?: string;
  indexConditions?: TypedFieldFilter<T>[];
  postFilters?: TypedFieldFilter<T>[];
};

/**
 * Filter configuration for a specific index.
 * indexConditions.field is restricted to only the fields in the index.
 */
type FilterForIndex<
  DM,
  TableName extends keyof DM,
  IndexName extends IndexNames<DM, TableName>,
  Document,
> = {
  indexName: IndexName;
  indexConditions?: IndexFieldFilter<DM, TableName, IndexName>[];
  postFilters?: TypedFieldFilter<Document>[];
};

/**
 * Fully type-safe advanced filter with index name AND field validation.
 * Creates a discriminated union where each indexName variant constrains
 * indexConditions.field to only the fields in that specific index.
 *
 * @example
 * type VehicleFilter = TypedAdvancedFilterWithIndex<DataModel, "vehicles">;
 *
 * // ✅ Valid: by_status index uses "status" field
 * const filter1: VehicleFilter = {
 *   indexName: "by_status",
 *   indexConditions: [{ field: "status", operator: "eq", value: "available" }]
 * };
 *
 * // ❌ Type error: by_make index cannot use "status" field
 * const filter2: VehicleFilter = {
 *   indexName: "by_make",
 *   indexConditions: [{ field: "status", operator: "eq", value: "available" }] // Error!
 * };
 *
 * // ✅ Valid: no index = no indexConditions, just postFilters
 * const filter3: VehicleFilter = {
 *   postFilters: [{ field: "make", operator: "contains", value: "Toyota" }]
 * };
 */
export type TypedAdvancedFilterWithIndex<
  DM,
  TableName extends keyof DM,
  Document = DM[TableName] extends { document: infer D } ? D : never,
> = // No index specified - only postFilters allowed
| { indexName?: undefined; indexConditions?: undefined; postFilters?: TypedFieldFilter<Document>[] }
// Union of all valid index configurations
| {
    [K in IndexNames<DM, TableName>]: FilterForIndex<DM, TableName, K, Document>;
  }[IndexNames<DM, TableName>];

/**
 * Apply index conditions to a query builder
 * Handles the chaining of eq -> range operators in correct order
 */
function applyIndexConditions(
  queryBuilder: any,
  indexName: string,
  conditions: FieldFilter[],
): any {
  if (conditions.length === 0) {
    return queryBuilder.withIndex(indexName);
  }

  return queryBuilder.withIndex(indexName, (q: any) => {
    let builder = q;
    for (const condition of conditions) {
      switch (condition.operator) {
        case "eq": {
          builder = builder.eq(condition.field, condition.value);
          break;
        }
        case "gt": {
          builder = builder.gt(condition.field, condition.value);
          break;
        }
        case "gte": {
          builder = builder.gte(condition.field, condition.value);
          break;
        }
        case "lt": {
          builder = builder.lt(condition.field, condition.value);
          break;
        }
        case "lte": {
          builder = builder.lte(condition.field, condition.value);
          break;
        }
        // Operators not supported by Convex index builder - handled by post-query filtering
        case "neq":
        case "in":
        case "contains":
        case "startsWith":
        case "endsWith":
        case "before":
        case "after":
        case "between": {
          break;
        }
        default: {
          assertNever(condition.operator);
        }
      }
    }
    return builder;
  });
}

/**
 * Operators that require JS-level filtering (not supported by Convex filter API).
 * Defined as const array for type safety - TypeScript ensures each element is a valid FilterOperator.
 */
const jsFilterOperatorsList = [
  "in",
  "contains",
  "startsWith",
  "endsWith",
  "between",
] as const satisfies readonly FilterOperator[];

/** Type representing JS-level filter operators only */
export type JsFilterOperator = (typeof jsFilterOperatorsList)[number];

/** Set of operators requiring JS-level filtering */
const JS_FILTER_OPERATORS: ReadonlySet<FilterOperator> = new Set(jsFilterOperatorsList);

/**
 * Apply post-query filters using Convex filter API
 */
function applyPostFilters(queryBuilder: any, filters: FieldFilter[]): any {
  if (filters.length === 0) {
    return queryBuilder;
  }

  return queryBuilder.filter((q: any) => {
    const conditions = filters
      .map((filter) => {
        const field = q.field(filter.field);
        switch (filter.operator) {
          case "eq": {
            return q.eq(field, filter.value);
          }
          case "neq": {
            return q.neq(field, filter.value);
          }
          case "gt": {
            return q.gt(field, filter.value);
          }
          case "gte": {
            return q.gte(field, filter.value);
          }
          case "lt": {
            return q.lt(field, filter.value);
          }
          case "lte": {
            return q.lte(field, filter.value);
          }
          // Date-specific operators (aliases for lt/gt)
          case "before": {
            return q.lt(field, filter.value);
          }
          case "after": {
            return q.gt(field, filter.value);
          }
          // Operators handled via JS filter - return null to skip
          case "in":
          case "contains":
          case "startsWith":
          case "endsWith":
          case "between": {
            return null;
          }
          default: {
            return assertNever(filter.operator);
          }
        }
      })
      .filter(Boolean);

    if (conditions.length === 0) {
      return true;
    }
    if (conditions.length === 1) {
      return conditions[0];
    }
    return q.and(...conditions);
  });
}

/**
 * Get nested field value using dot notation path (e.g., "specs.engine.type")
 * Returns undefined if path doesn't exist
 */
function getNestedValue(object: Record<string, unknown>, path: string): unknown {
  if (!path.includes(".")) {
    return object[path];
  }
  const parts = path.split(".");
  let current: unknown = object;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== "object") {
      return;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/**
 * Apply JavaScript-level filters for operators not supported by Convex filter API
 * (in, contains, startsWith, endsWith, between)
 * Supports nested field access via dot notation (e.g., "specs.engine.type")
 */
function applyJsFilters<T extends Record<string, unknown>>(docs: T[], filters: FieldFilter[]): T[] {
  const jsFilters = filters.filter((f) => JS_FILTER_OPERATORS.has(f.operator));
  if (jsFilters.length === 0) {
    return docs;
  }

  /* eslint-disable sonarjs/cyclomatic-complexity -- exhaustive filter operator switch (13 cases) */
  return docs.filter((document) =>
    jsFilters.every((filter) => {
      const value = getNestedValue(document, filter.field);
      switch (filter.operator) {
        case "in": {
          return Array.isArray(filter.value) && filter.value.includes(value);
        }
        case "contains": {
          return (
            typeof value === "string" &&
            typeof filter.value === "string" &&
            value.toLowerCase().includes(filter.value.toLowerCase())
          );
        }
        case "startsWith": {
          return (
            typeof value === "string" &&
            typeof filter.value === "string" &&
            value.toLowerCase().startsWith(filter.value.toLowerCase())
          );
        }
        case "endsWith": {
          return (
            typeof value === "string" &&
            typeof filter.value === "string" &&
            value.toLowerCase().endsWith(filter.value.toLowerCase())
          );
        }
        case "between": {
          // Expects value to be [start, end] array for inclusive range
          if (!Array.isArray(filter.value) || filter.value.length !== 2) {
            return false;
          }
          const [start, end] = filter.value as [unknown, unknown];
          return (
            typeof value === "number" &&
            typeof start === "number" &&
            typeof end === "number" &&
            value >= start &&
            value <= end
          );
        }
        // Operators handled by Convex filter API - always pass JS filter
        case "eq":
        case "neq":
        case "gt":
        case "gte":
        case "lt":
        case "lte":
        case "before":
        case "after": {
          return true;
        }
        default: {
          return assertNever(filter.operator);
        }
      }
    }),
  );
  /* eslint-enable sonarjs/cyclomatic-complexity */
}

/**
 * Create CRUD operations for a table.
 * You can expose these operations in your API. For example, in convex/users.ts:
 *
 * ```ts
 * // in convex/users.ts
 * import { crud } from "convex-helpers/server/crud";
 * import schema from "./schema";
 *
 * export const { create, read, update, destroy } = crud(schema, "users");
 * ```
 *
 * Then you can access the functions like `internal.users.create` from actions.
 *
 * The `read` function supports fetching a single document by ID or multiple documents by providing an array of IDs:
 * ```ts
 * // Fetch single document
 * const user = await ctx.runQuery(internal.users.read, { id: userId });
 *
 * // Fetch multiple documents
 * const users = await ctx.runQuery(internal.users.read, { ids: [userId1, userId2] });
 * ```
 *
 * To expose these functions publicly, you can pass in custom query and
 * mutation arguments. Be careful what you expose publicly: you wouldn't want
 * any client to be able to delete users, for example.
 *
 * @param schema Your project's schema.
 * @param table The table name to create CRUD operations for.
 * @param query The query to use - use internalQuery or query from
 * "./convex/_generated/server" or a customQuery.
 * @param mutation The mutation to use - use internalMutation or mutation from
 * "./convex/_generated/server" or a customMutation.
 * @returns An object with create, read, update, and delete functions.
 * You must export these functions at the top level of your file to use them.
 */

export function crud<
  Schema extends GenericSchema,
  TableName extends TableNamesInDataModel<
    DataModelFromSchemaDefinition<SchemaDefinition<Schema, any>>
  >,
  QueryVisibility extends FunctionVisibility = "internal",
  MutationVisibility extends FunctionVisibility = "internal",
>(
  schema: SchemaDefinition<Schema, any>,
  table: TableName,
  query: QueryBuilder<
    DataModelFromSchemaDefinition<SchemaDefinition<Schema, any>>,
    QueryVisibility
  > = internalQueryGeneric as any,
  mutation: MutationBuilder<
    DataModelFromSchemaDefinition<SchemaDefinition<Schema, any>>,
    MutationVisibility
  > = internalMutationGeneric as any,
) {
  type DataModel = DataModelFromSchemaDefinition<SchemaDefinition<Schema, any>>;
  type TableDocument = DocumentByName<DataModel, TableName>;

  const systemFields = {
    _id: v.id(table),
    _creationTime: v.number(),
  };
  const validator = schema.tables[table]?.validator;

  // @ts-expect-error - TODO: fix this
  const indexFieldsSchema = (schema.tables[table]?.indexes as Index[])
    .map((index) => {
      const firstField = index.fields?.[0];

      if (
        !(firstField && validator) ||
        typeof validator !== "object" ||
        !("fields" in validator) ||
        !validator.fields[firstField]
      ) {
        return null;
      }
      return {
        indexName: index.indexDescriptor,
        indexField: firstField,
        indexValue: validator.fields[firstField],
      };
    })
    .filter((index) => index !== null);

  if (!validator) {
    throw AppErrors.invalidInput(
      "table",
      `"${table}" not found in schema. Did you define it in defineSchema?`,
    );
  }
  if (validator.kind !== "object") {
    throw AppErrors.invalidInput(
      "table",
      `CRUD only supports simple object tables. "${table}" is a ${validator.type}`,
    );
  }

  // --- Dynamic filterSchema construction ---
  // Legacy simple filter (for backwards compatibility)
  const indexSchemas = indexFieldsSchema.map((index) =>
    v.object({
      indexName: v.literal(index.indexName),
      indexValue: index.indexValue,
    }),
  );

  const filterSchema = indexSchemas.length > 0 ? v.union(...indexSchemas, v.null()) : v.null();

  // --- Advanced filter schema ---
  // Supports: eq, neq, gt, gte, lt, lte, in, contains, startsWith, endsWith, before, after, between
  const operatorValidator = v.union(
    v.literal("eq"),
    v.literal("neq"),
    v.literal("gt"),
    v.literal("gte"),
    v.literal("lt"),
    v.literal("lte"),
    v.literal("in"),
    v.literal("contains"),
    v.literal("startsWith"),
    v.literal("endsWith"),
    v.literal("before"),
    v.literal("after"),
    v.literal("between"),
  );

  const fieldFilterValidator = v.object({
    field: v.string(),
    operator: operatorValidator,
    value: v.any(),
  });

  // Build list of index names for runtime validation
  const indexNamesToUse = indexFieldsSchema.map((index) => index.indexName);

  // Build validator with literals for runtime validation
  const indexNameLiterals = indexNamesToUse.map((name) => v.literal(name));
  const indexNameValidator =
    indexNameLiterals.length > 0
      ? v.optional(
          v.union(
            ...(indexNameLiterals as [
              ReturnType<typeof v.literal>,
              ...ReturnType<typeof v.literal>[],
            ]),
          ),
        )
      : v.optional(v.string());

  // Build the runtime validator (accepts the dynamic literals for runtime validation)
  const advancedFilterValidatorRuntime = v.object({
    /** Index to use (optional - table scan if not specified). Only valid index names are accepted. */
    indexName: indexNameValidator,
    /** Conditions applied via index (eq, gt, gte, lt, lte - must be in index field order) */
    indexConditions: v.optional(v.array(fieldFilterValidator)),
    /** Conditions applied after query (supports all operators including neq, in, contains) */
    postFilters: v.optional(v.array(fieldFilterValidator)),
  });

  // Type-safe version for IDE autocomplete and compile-time checking
  // Uses TypedAdvancedFilterWithIndex which is a discriminated union:
  // - indexName is restricted to valid index names from schema
  // - indexConditions.field is restricted to fields in the selected index
  type TypedAdvancedFilterArgument = TypedAdvancedFilterWithIndex<DataModel, TableName>;

  // Create a branded validator type that Convex will infer as our typed filter
  // The runtime validation uses advancedFilterValidatorRuntime, but TypeScript sees TypedAdvancedFilterArg
  type TypedAdvancedFilterValidator = {
    readonly _validator: typeof advancedFilterValidatorRuntime;
    readonly _type: TypedAdvancedFilterArgument;
  };
  const advancedFilterValidator =
    advancedFilterValidatorRuntime as unknown as TypedAdvancedFilterValidator["_validator"] & {
      _input: TypedAdvancedFilterArgument;
      _output: TypedAdvancedFilterArgument;
    };

  // Order configuration
  const orderValidator = v.optional(
    v.object({
      field: v.optional(v.string()),
      direction: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
    }),
  );
  // --- End dynamic filterSchema construction ---

  return {
    create: mutation({
      args: {
        ...validator.fields,
        ...partial(systemFields),
      },
      returns: v.union(
        v.object({
          ...validator.fields,
          ...systemFields,
        }),
        v.null(),
      ),
      // FIXME: types

      // @ts-expect-error
      handler: async (context, args) => {
        if ("_id" in args) {
          args._id = undefined;
        }
        if ("_creationTime" in args) {
          args._creationTime = undefined;
        }
        const id = await context.db.insert(
          table,
          args as unknown as WithoutSystemFields<DocumentByName<DataModel, TableName>>,
        );
        return (await context.db.get(id))!;
      },
    }) as RegisteredMutation<
      MutationVisibility,
      WithoutSystemFields<DocumentByName<DataModel, TableName>>,
      Promise<DocumentByName<DataModel, TableName>>
    >,

    // New createMany function to insert multiple documents at once
    createMany: mutation({
      args: {
        items: v.array(
          v.object({
            ...validator.fields,
            ...partial(systemFields),
          }),
        ),
      },
      returns: v.array(
        v.object({
          ...validator.fields,
          ...systemFields,
        }),
      ),
      handler: async (context, args) => {
        const items = args.items;
        const insertPromises = items.map(async (item) => {
          const toInsert = { ...item };
          if ("_id" in toInsert) {
            toInsert._id = undefined;
          }
          if ("_creationTime" in toInsert) {
            toInsert._creationTime = undefined;
          }

          const id = await context.db.insert(
            table,
            toInsert as unknown as WithoutSystemFields<TableDocument>,
          );
          return (await context.db.get(id))!;
        });

        return await Promise.all(insertPromises);
      },
    }),

    read: query({
      args: {
        id: v.optional(v.id(table)),
      },
      returns: v.union(
        v.object({
          ...validator.fields,
          ...systemFields,
        }),
        v.null(),
      ),
      // FIXME: types

      // @ts-expect-error
      handler: async (context, args) => {
        if (args.id) {
          return await context.db.get(args.id);
        }
        return null;
      },
    }) as RegisteredQuery<
      QueryVisibility,
      { id?: GenericId<TableName> },
      Promise<DocumentByName<DataModel, TableName> | null>
    >,

    // Enhanced readMany function with filtering by index
    readMany: query({
      args: {
        ids: v.optional(v.array(v.id(table))),
        limit: v.optional(v.number()),
        filter: v.optional(filterSchema),
        includeDeleted: v.optional(v.boolean()),
        orders: v.optional(
          v.object({
            _creationTime: v.optional(v.literal("desc")),
          }),
        ),
      },
      returns: v.array(
        v.object({
          ...validator.fields,
          ...systemFields,
        }),
      ),

      handler: async (context, args) => {
        const includeDeleted = args.includeDeleted ?? false;

        // Helper to filter soft-deleted documents
        const filterDeleted = (docs: any[]): any[] => {
          if (includeDeleted) {
            return docs;
          }
          return docs.filter((document) => !document.deletedAt);
        };

        // By IDs approach
        if (args.ids && args.ids.length > 0) {
          const results = await Promise.all(args.ids.map((id) => context.db.get(id)));
          const nonNull = results.filter((result) => result !== null);
          return filterDeleted(nonNull);
        }

        // By index approach
        if (args.filter?.indexName) {
          const fieldName = indexFieldsSchema.find(
            (index) => index.indexName === args.filter?.indexName,
          )?.indexField;
          const indexValue = args.filter.indexValue;

          let queryBuilder = context.db.query(table);

          if (args.orders) {
            queryBuilder = queryBuilder.order(
              args.orders._creationTime ?? "desc",
            ) as typeof queryBuilder;
          }

          // @ts-expect-error - Runtime check that's hard to type properly
          queryBuilder = queryBuilder.withIndex(args.filter.indexName, (q) =>
            q.eq(fieldName, indexValue),
          );
          const limit = args.limit ?? DEFAULT_LIMIT;
          const results = await queryBuilder.take(limit);
          return filterDeleted(results);
        }

        // By default, return all documents (bounded)
        const limit = args.limit ?? DEFAULT_LIMIT;
        const results = await context.db.query(table).take(limit);
        return filterDeleted(results);
      },
    }) as RegisteredQuery<
      QueryVisibility,
      {
        ids?: GenericId<TableName>[];
        limit?: number;
        includeDeleted?: boolean;
        filter?: {
          indexName: Exclude<
            keyof Indexes<NamedTableInfo<DataModel, TableName>>,
            "by_id" | "by_creation_time"
          >;
          indexValue: DocumentByName<DataModel, TableName>[keyof Indexes<
            NamedTableInfo<DataModel, TableName>
          >];
        };
      },
      Promise<DocumentByName<DataModel, TableName>[]>
    >,

    /**
     * Advanced query with full filtering support
     * Supports: eq, neq, gt, gte, lt, lte, in, contains
     *
     * @example
     * // Range query: price between 1000 and 5000
     * await ctx.runQuery(internal.vehicles.queryAdvanced, {
     *   advancedFilter: {
     *     postFilters: [
     *       { field: "price", operator: "gte", value: 1000 },
     *       { field: "price", operator: "lte", value: 5000 }
     *     ]
     *   }
     * })
     *
     * @example
     * // Index query with range: status = "available" AND year >= 2020
     * await ctx.runQuery(internal.vehicles.queryAdvanced, {
     *   advancedFilter: {
     *     indexName: "by_status",
     *     indexConditions: [{ field: "status", operator: "eq", value: "available" }],
     *     postFilters: [{ field: "year", operator: "gte", value: 2020 }]
     *   }
     * })
     *
     * @example
     * // Search with "in" operator: find vehicles with specific statuses
     * await ctx.runQuery(internal.vehicles.queryAdvanced, {
     *   advancedFilter: {
     *     postFilters: [{ field: "status", operator: "in", value: ["available", "reserved"] }]
     *   }
     * })
     *
     * @example
     * // Text search with "contains": find by make
     * await ctx.runQuery(internal.vehicles.queryAdvanced, {
     *   advancedFilter: {
     *     postFilters: [{ field: "make", operator: "contains", value: "toyota" }]
     *   }
     * })
     */
    queryAdvanced: query({
      args: {
        advancedFilter: v.optional(advancedFilterValidator),
        order: orderValidator,
        limit: v.optional(v.number()),
        includeDeleted: v.optional(v.boolean()),
      },
      returns: v.array(
        v.object({
          ...validator.fields,
          ...systemFields,
        }),
      ),
      handler: async (context, args) => {
        const includeDeleted = args.includeDeleted ?? false;
        const limit = args.limit ?? DEFAULT_LIMIT;
        const filter = args.advancedFilter;

        // Helper to filter soft-deleted documents
        const filterDeleted = (docs: any[]): any[] => {
          if (includeDeleted) {
            return docs;
          }
          return docs.filter((document) => !document.deletedAt);
        };

        let queryBuilder = context.db.query(table);

        // Apply ordering (must be before withIndex for Convex)
        if (args.order?.direction) {
          queryBuilder = queryBuilder.order(args.order.direction) as typeof queryBuilder;
        }

        // Apply index conditions if specified
        if (filter?.indexName && filter.indexConditions?.length) {
          queryBuilder = applyIndexConditions(
            queryBuilder,
            filter.indexName as string,
            filter.indexConditions as FieldFilter[],
          );
        } else if (filter?.indexName) {
          queryBuilder = queryBuilder.withIndex(filter.indexName as string) as typeof queryBuilder;
        }

        // Apply post-filters (Convex filter API) for operators not requiring JS filtering
        if (filter?.postFilters?.length) {
          const convexFilters = (filter.postFilters as FieldFilter[]).filter(
            (f) => !JS_FILTER_OPERATORS.has(f.operator),
          );
          if (convexFilters.length > 0) {
            queryBuilder = applyPostFilters(queryBuilder, convexFilters);
          }
        }

        // Fetch results
        let results = await queryBuilder.take(limit);

        // Apply JS-level filters (in, contains, startsWith, endsWith, between)
        if (filter?.postFilters?.length) {
          results = applyJsFilters(results, filter.postFilters as FieldFilter[]);
        }

        return filterDeleted(results);
      },
    }) as RegisteredQuery<
      QueryVisibility,
      {
        advancedFilter?: TypedAdvancedFilterWithIndex<DataModel, TableName>;
        order?: { field?: string; direction?: "asc" | "desc" };
        limit?: number;
        includeDeleted?: boolean;
      },
      Promise<DocumentByName<DataModel, TableName>[]>
    >,

    /**
     * Paginated query with filtering support.
     *
     * **WARNING: JS-level filters affect pagination accuracy**
     *
     * When using JS-level filter operators (`in`, `contains`, `startsWith`, `endsWith`, `between`),
     * filtering happens AFTER pagination. This means:
     * - If `numItems=10` and 5 items match the JS filter, the page returns only 5 items
     * - Pagination cursors may skip filtered items, causing inconsistent page sizes
     * - Total count will not reflect the filtered result
     *
     * **Recommendation**: For accurate pagination, use only index-level (`eq`, `gt`, `gte`, `lt`, `lte`)
     * and Convex filter operators (`neq`, `before`, `after`) in your filters.
     * Use `queryAdvanced` with a limit if you need JS-level filters.
     *
     * @example
     * // Safe: Only uses index and Convex filter operators
     * paginate({
     *   paginationOpts: { numItems: 10, cursor: null },
     *   advancedFilter: {
     *     indexName: "by_status",
     *     indexConditions: [{ field: "status", operator: "eq", value: "available" }],
     *     postFilters: [{ field: "price", operator: "gte", value: 1000 }]
     *   }
     * })
     *
     * @example
     * // Unsafe: JS filter "contains" will cause variable page sizes
     * paginate({
     *   paginationOpts: { numItems: 10, cursor: null },
     *   advancedFilter: {
     *     postFilters: [{ field: "make", operator: "contains", value: "toyota" }]
     *   }
     * })
     */
    paginate: query({
      args: {
        paginationOpts: paginationOptsValidator,
        advancedFilter: v.optional(advancedFilterValidator),
        order: orderValidator,
        includeDeleted: v.optional(v.boolean()),
        // Legacy filter for backwards compatibility
        filter: v.optional(filterSchema),
      },
      returns: v.object({
        page: v.array(
          v.object({
            ...validator.fields,
            ...systemFields,
          }),
        ),
        isDone: v.boolean(),
        continueCursor: v.union(v.string(), v.null()),
        splitCursor: v.optional(v.union(v.string(), v.null())),
        pageStatus: v.optional(
          v.union(v.literal("SplitRecommended"), v.literal("SplitRequired"), v.null()),
        ),
      }),
      // @ts-expect-error - Complex generic type inference
      handler: async (context, args) => {
        const includeDeleted = args.includeDeleted ?? false;
        const advFilter = args.advancedFilter;
        const legacyFilter = args.filter;

        let queryBuilder = context.db.query(table);

        // Apply ordering
        if (args.order?.direction) {
          queryBuilder = queryBuilder.order(args.order.direction) as typeof queryBuilder;
        }

        // Handle advanced filter
        if (advFilter?.indexName && advFilter.indexConditions?.length) {
          queryBuilder = applyIndexConditions(
            queryBuilder,
            advFilter.indexName as string,
            advFilter.indexConditions as FieldFilter[],
          );
        } else if (advFilter?.indexName) {
          queryBuilder = queryBuilder.withIndex(
            advFilter.indexName as string,
          ) as typeof queryBuilder;
        }
        // Handle legacy filter (backwards compatibility)
        else if (legacyFilter?.indexName) {
          const fieldName = indexFieldsSchema.find(
            (index) => index.indexName === legacyFilter?.indexName,
          )?.indexField;
          // @ts-expect-error - Runtime type check
          queryBuilder = queryBuilder.withIndex(legacyFilter.indexName, (q) =>
            q.eq(fieldName, legacyFilter.indexValue),
          );
        }

        // Apply post-filters (Convex filter API) for operators not requiring JS filtering
        if (advFilter?.postFilters?.length) {
          const convexFilters = (advFilter.postFilters as FieldFilter[]).filter(
            (f) => !JS_FILTER_OPERATORS.has(f.operator),
          );
          if (convexFilters.length > 0) {
            queryBuilder = applyPostFilters(queryBuilder, convexFilters);
          }
        }

        // Soft delete filter
        if (!includeDeleted) {
          queryBuilder = queryBuilder.filter((q) =>
            // eslint-disable-next-line unicorn/no-useless-undefined -- undefined = field not set in Convex
            q.or(q.eq(q.field("deletedAt"), undefined), q.eq(q.field("deletedAt"), null)),
          ) as typeof queryBuilder;
        }

        // Paginate
        const result = await queryBuilder.paginate(args.paginationOpts);

        // Apply JS-level filters - note: this affects pagination accuracy
        if (advFilter?.postFilters?.length) {
          const jsFilters = (advFilter.postFilters as FieldFilter[]).filter((f) =>
            JS_FILTER_OPERATORS.has(f.operator),
          );
          if (jsFilters.length > 0) {
            result.page = applyJsFilters(result.page, jsFilters);
          }
        }

        return result;
      },
    }) as RegisteredQuery<
      QueryVisibility,
      {
        paginationOpts: Infer<typeof paginationOptsValidator>;
        advancedFilter?: TypedAdvancedFilterWithIndex<DataModel, TableName>;
        order?: { field?: string; direction?: "asc" | "desc" };
        includeDeleted?: boolean;
        filter?: { indexName: string; indexValue: unknown } | null;
      },
      Promise<PaginationResult<DocumentByName<DataModel, TableName>>>
    >,

    update: mutation({
      args: {
        id: v.id(table),
        // this could be partial(table.withSystemFields) but keeping
        // the api less coupled to Table
        patch: v.object({
          ...partial(validator.fields),
          ...partial(systemFields),
        }),
      },
      returns: v.union(
        v.object({
          ...validator.fields,
          ...systemFields,
        }),
        v.null(),
      ),
      // @ts-expect-error - Type issues with complex generic inference
      handler: async (context, args) => {
        await context.db.patch(
          args.id,
          args.patch as Partial<DocumentByName<DataModel, TableName>>,
        );
        return await context.db.get(args.id);
      },
    }) as RegisteredMutation<
      MutationVisibility,
      {
        id: GenericId<TableName>;
        patch: Partial<WithoutSystemFields<DocumentByName<DataModel, TableName>>>;
      },
      Promise<DocumentByName<DataModel, TableName> | null>
    >,

    // New updateMany function to update multiple documents at once
    updateMany: mutation({
      args: {
        items: v.array(
          v.object({
            id: v.id(table),
            patch: v.object({
              ...partial(validator.fields),
              ...partial(systemFields),
            }),
          }),
        ),
      },
      returns: v.null(),
      handler: async (context, args) => {
        const updatePromises = args.items.map(async (item) => {
          await context.db.patch(
            item.id,
            item.patch as Partial<DocumentByName<DataModel, TableName>>,
          );
        });

        await Promise.all(updatePromises);
        return null;
      },
    }) as RegisteredMutation<
      MutationVisibility,
      {
        items: {
          id: GenericId<TableName>;
          patch: Partial<DocumentByName<DataModel, TableName>>;
        }[];
      },
      Promise<null>
    >,

    destroy: mutation({
      args: { id: v.id(table) },
      returns: v.union(
        v.object({
          ...validator.fields,
          ...systemFields,
        }),
        v.null(),
      ),
      // FIXME: types

      // @ts-expect-error
      handler: async (context, args) => {
        const old = await context.db.get(args.id);
        if (old) {
          await context.db.delete(args.id);
        }
        return old;
      },
    }) as RegisteredMutation<
      MutationVisibility,
      { id: GenericId<TableName> },
      Promise<null | DocumentByName<DataModel, TableName>>
    >,

    // New destroyMany function to delete multiple documents at once
    destroyMany: mutation({
      args: {
        ids: v.array(v.id(table)),
      },
      returns: v.array(
        v.union(
          v.object({
            ...validator.fields,
            ...systemFields,
          }),
          v.null(),
        ),
      ),
      // @ts-expect-error - Convex generic type inference limitation with union return types
      handler: async (context, args) => {
        const results: (DocumentByName<DataModel, TableName> | null)[] = [];

        for (const id of args.ids) {
          const old = await context.db.get(id);
          if (old) {
            await context.db.delete(id);
            results.push(old);
          } else {
            results.push(null);
          }
        }

        return results;
      },
    }),

    // Count documents with optional filter
    count: query({
      args: {
        filter: v.optional(filterSchema),
        includeDeleted: v.optional(v.boolean()),
      },
      returns: v.number(),
      handler: async (context, args) => {
        const includeDeleted = args.includeDeleted ?? false;

        // Helper to filter soft-deleted documents
        const filterDeleted = (docs: any[]): any[] => {
          if (includeDeleted) {
            return docs;
          }
          return docs.filter((document) => !document.deletedAt);
        };

        if (args.filter?.indexName) {
          const fieldName = indexFieldsSchema.find(
            (index) => index.indexName === args.filter?.indexName,
          )?.indexField;
          const indexValue = args.filter.indexValue;

          const results = await context.db
            .query(table)
            .withIndex(args.filter.indexName, (q) => q.eq(fieldName, indexValue))
            .collect();
          return filterDeleted(results).length;
        }

        const results = await context.db.query(table).collect();
        return filterDeleted(results).length;
      },
    }) as RegisteredQuery<
      QueryVisibility,
      {
        filter?: {
          indexName: Exclude<
            keyof Indexes<NamedTableInfo<DataModel, TableName>>,
            "by_id" | "by_creation_time"
          >;
          indexValue: unknown;
        };
        includeDeleted?: boolean;
      },
      Promise<number>
    >,

    // Check if document exists by ID
    exists: query({
      args: {
        id: v.id(table),
        includeDeleted: v.optional(v.boolean()),
      },
      returns: v.boolean(),
      handler: async (context, args) => {
        const includeDeleted = args.includeDeleted ?? false;
        const document = await context.db.get(args.id);
        if (document === null) {
          return false;
        }
        // If soft-deleted and not including deleted, return false
        if (!includeDeleted && (document as any).deletedAt) {
          return false;
        }
        return true;
      },
    }) as RegisteredQuery<
      QueryVisibility,
      { id: GenericId<TableName>; includeDeleted?: boolean },
      Promise<boolean>
    >,

    // Find first document matching filter
    findOne: query({
      args: {
        filter: filterSchema,
      },
      returns: v.union(
        v.object({
          ...validator.fields,
          ...systemFields,
        }),
        v.null(),
      ),
      // @ts-expect-error - Complex generic type inference for document return type
      handler: async (context, args) => {
        if (!args.filter?.indexName) {
          return null;
        }

        const fieldName = indexFieldsSchema.find(
          (index) => index.indexName === args.filter?.indexName,
        )?.indexField;
        const indexValue = args.filter.indexValue;

        return await context.db
          .query(table)
          .withIndex(args.filter.indexName, (q) => q.eq(fieldName, indexValue))
          .first();
      },
    }) as RegisteredQuery<
      QueryVisibility,
      {
        filter: {
          indexName: Exclude<
            keyof Indexes<NamedTableInfo<DataModel, TableName>>,
            "by_id" | "by_creation_time"
          >;
          indexValue: unknown;
        };
      },
      Promise<DocumentByName<DataModel, TableName> | null>
    >,

    // Upsert - create or update document based on filter match
    upsert: mutation({
      args: {
        filter: filterSchema,
        create: v.object({
          ...validator.fields,
          ...partial(systemFields),
        }),
        update: v.object({
          ...partial(validator.fields),
          ...partial(systemFields),
        }),
      },
      returns: v.object({
        created: v.boolean(),
        document: v.object({
          ...validator.fields,
          ...systemFields,
        }),
      }),
      // @ts-expect-error - Complex generic type inference for upsert return type
      handler: async (context, args) => {
        if (!args.filter?.indexName) {
          // No filter, just create
          const id = await context.db.insert(
            table,
            args.create as unknown as WithoutSystemFields<TableDocument>,
          );
          const document_ = (await context.db.get(id))!;
          return { created: true, document: document_ };
        }

        const fieldName = indexFieldsSchema.find(
          (index) => index.indexName === args.filter?.indexName,
        )?.indexField;
        const indexValue = args.filter.indexValue;

        const existing = await context.db
          .query(table)
          .withIndex(args.filter.indexName, (q) => q.eq(fieldName, indexValue))
          .first();

        if (existing) {
          // Update existing document
          await context.db.patch(
            existing._id,
            args.update as Partial<DocumentByName<DataModel, TableName>>,
          );
          const updated = (await context.db.get(existing._id))!;
          return { created: false, document: updated };
        }

        // Create new document
        const id = await context.db.insert(
          table,
          args.create as unknown as WithoutSystemFields<TableDocument>,
        );
        const document = (await context.db.get(id))!;
        return { created: true, document };
      },
    }) as RegisteredMutation<
      MutationVisibility,
      {
        filter: {
          indexName: Exclude<
            keyof Indexes<NamedTableInfo<DataModel, TableName>>,
            "by_id" | "by_creation_time"
          >;
          indexValue: unknown;
        } | null;
        create: WithoutSystemFields<DocumentByName<DataModel, TableName>>;
        update: Partial<WithoutSystemFields<DocumentByName<DataModel, TableName>>>;
      },
      Promise<{ created: boolean; document: DocumentByName<DataModel, TableName> }>
    >,

    // Soft delete - set deletedAt timestamp
    softDelete: mutation({
      args: {
        id: v.id(table),
      },
      returns: v.union(
        v.object({
          ...validator.fields,
          ...systemFields,
          deletedAt: v.optional(v.number()),
        }),
        v.null(),
      ),
      // @ts-expect-error - Type issues with complex generic inference
      handler: async (context, args) => {
        const document = await context.db.get(args.id);
        if (!document) {
          return null;
        }

        await context.db.patch(args.id, { deletedAt: Date.now() } as Partial<
          DocumentByName<DataModel, TableName>
        >);
        return await context.db.get(args.id);
      },
    }),

    // Restore - clear deletedAt timestamp
    restore: mutation({
      args: {
        id: v.id(table),
      },
      returns: v.union(
        v.object({
          ...validator.fields,
          ...systemFields,
          deletedAt: v.optional(v.number()),
        }),
        v.null(),
      ),
      // @ts-expect-error - Type issues with complex generic inference
      handler: async (context, args) => {
        const document = await context.db.get(args.id);
        if (!document) {
          return null;
        }

        await context.db.patch(args.id, { deletedAt: undefined } as Partial<
          DocumentByName<DataModel, TableName>
        >);
        return await context.db.get(args.id);
      },
    }),
  };
}
