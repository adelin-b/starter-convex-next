import { customMutation, customQuery } from "convex-helpers/server/customFunctions";
import { zMutationBuilder, zQueryBuilder } from "zodvex";
import { mutation, query } from "../_generated/server";

/**
 * Wrapper for mutations that should only be available in test mode.
 * Throws an error if IS_TEST environment variable is not set to "true".
 */
export const testingMutation = customMutation(mutation, {
  args: {},
  // biome-ignore lint/suspicious/useAwait: convex-helpers requires async input function
  input: async (_context, args) => {
    // biome-ignore lint/style/noProcessEnv: Test mode guard for E2E testing
    if (process.env.IS_TEST !== "true") {
      throw new Error("Test mutations are only available in test mode (IS_TEST=true)");
    }
    return { ctx: {}, args };
  },
});
export const zodTestingMutation = zMutationBuilder(testingMutation);

/**
 * Wrapper for queries that should only be available in test mode.
 * Throws an error if IS_TEST environment variable is not set to "true".
 */
export const testingQuery = customQuery(query, {
  args: {},
  // biome-ignore lint/suspicious/useAwait: convex-helpers requires async input function
  input: async (_context, args) => {
    // biome-ignore lint/style/noProcessEnv: Test mode guard for E2E testing
    if (process.env.IS_TEST !== "true") {
      throw new Error("Test queries are only available in test mode (IS_TEST=true)");
    }
    return { ctx: {}, args };
  },
});
export const zodTestingQuery = zQueryBuilder(testingQuery);
