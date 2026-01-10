// Server-only enforcement handled by package.json exports

import type { GenericDatabaseReader, GenericDatabaseWriter } from "convex/server";
import {
  customAction,
  customCtx,
  customMutation,
  customQuery,
  NoOp,
} from "convex-helpers/server/customFunctions";
import { zActionBuilder, zMutationBuilder, zQueryBuilder } from "zodvex";
import type { DataModel } from "../_generated/dataModel";
import {
  action as baseAction,
  internalAction as baseInternalAction,
  internalMutation as baseInternalMutation,
  internalQuery as baseInternalQuery,
  mutation as baseMutation,
  query as baseQuery,
} from "../_generated/server";

// Re-export context types for use in helper functions
export type {
  ActionCtx,
  MutationCtx,
  QueryCtx,
} from "../_generated/server";

/**
 * Tables that use the legacy/basic functions
 * Add new tables here as they are created
 */
export type AppTables =
  | "todos"
  | "organizations"
  | "organizationMembers"
  | "organizationInvitations"
  | "admins";

/**
 * Base query with typed database
 */
export const query = customQuery(
  baseQuery,
  customCtx((context) => ({
    ...context,
    db: context.db as unknown as GenericDatabaseReader<Pick<DataModel, AppTables>>,
  })),
);
export const zodQuery = zQueryBuilder(query);

/**
 * Base mutation with typed database
 */
export const mutation = customMutation(
  baseMutation,
  customCtx((context) => ({
    ...context,
    db: context.db as unknown as GenericDatabaseWriter<Pick<DataModel, AppTables>>,
  })),
);
export const zodMutation = zMutationBuilder(mutation);

/**
 * Base action
 */
export const action = customAction(baseAction, NoOp);
export const zodAction = zActionBuilder(action);

/**
 * Internal query with typed database
 */
const internalQuery = customQuery(
  baseInternalQuery,
  customCtx((context) => ({
    ...context,
    db: context.db as unknown as GenericDatabaseReader<Pick<DataModel, AppTables>>,
  })),
);
export const zodInternalQuery = zQueryBuilder(internalQuery);

/**
 * Internal mutation with typed database
 */
const internalMutation = customMutation(
  baseInternalMutation,
  customCtx((context) => ({
    ...context,
    db: context.db as unknown as GenericDatabaseWriter<Pick<DataModel, AppTables>>,
  })),
);
export const zodInternalMutation = zMutationBuilder(internalMutation);

/**
 * Internal action
 */
const internalAction = customAction(baseInternalAction, NoOp);
export const zodInternalAction = zActionBuilder(internalAction);
