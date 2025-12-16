/**
 * Utility for exhaustive type checking in switch statements.
 * TypeScript will error at compile time if a case is not handled.
 *
 * @example
 * ```ts
 * type Status = "pending" | "done" | "cancelled";
 *
 * function handleStatus(status: Status) {
 *   switch (status) {
 *     case "pending":
 *       return "Waiting...";
 *     case "done":
 *       return "Complete!";
 *     case "cancelled":
 *       return "Cancelled";
 *     default:
 *       assertNever(status);
 *   }
 * }
 * ```
 *
 * If a new status is added to the union type and not handled in the switch,
 * TypeScript will produce a compile-time error indicating the unhandled case.
 */
export function assertNever(value: never, message?: string): never {
  throw new Error(message ?? `Unexpected value: ${value}`);
}
