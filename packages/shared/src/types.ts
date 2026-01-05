/**
 * Field-level validation error.
 * Used for form validation errors that target specific fields.
 *
 * @example
 * ```ts
 * const error: FieldError = {
 *   field: "licensePlate",
 *   message: "This license plate already exists",
 *   code: "DUPLICATE",
 * };
 * ```
 */
export type FieldError = {
  /** The field name that has the error */
  field: string;
  /** Human-readable error message */
  message: string;
  /** Optional error code for categorization */
  code?: string;
};
