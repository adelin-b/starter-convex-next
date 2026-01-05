import { makeUseQueryWithStatus } from "convex-helpers/react";
// For Next.js, use the cache-specific hooks
import { useQueries } from "convex-helpers/react/cache/hooks";

// Custom hook that wraps the Convex useQueries with status indicators and caching
export const useQueryWithStatus = makeUseQueryWithStatus(useQueries);

/**
 * This hook is a utility that provides a more structured approach to handling
 * query states, with explicit status fields and boolean flags for checking state.
 * It also leverages query caching to persist subscriptions for faster reloading during navigation.
 *
 * Usage:
 * ```
 * const { status, data, error, isSuccess, isPending, isError } =
 *   useQueryWithStatus(api.foo.bar, { myArg: 123 });
 * ```
 *
 * Return type:
 * ```
 * type ret =
 *   | {
 *       status: "success";
 *       data: FunctionReturnType<Query>;
 *       error: undefined;
 *       isSuccess: true;
 *       isPending: false;
 *       isError: false;
 *     }
 *   | {
 *       status: "pending";
 *       data: undefined;
 *       error: undefined;
 *       isSuccess: false;
 *       isPending: true;
 *       isError: false;
 *     }
 *   | {
 *       status: "error";
 *       data: undefined;
 *       error: Error;
 *       isSuccess: false;
 *       isPending: false;
 *       isError: true;
 *     };
 * ```
 */
