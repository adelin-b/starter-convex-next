// Server-only enforcement handled by package.json exports

import type { FieldError } from "@starter-saas/shared/types";
import { ConvexError } from "convex/values";

// Re-export FieldError for consumers
export type { FieldError } from "@starter-saas/shared/types";

/**
 * Standard error codes for the application.
 * Use these codes to categorize errors consistently across the application.
 *
 * @example
 * ```ts
 * import { ErrorCodes, createAppError } from "./lib/errors";
 *
 * throw createAppError(ErrorCodes.RESOURCE_NOT_FOUND, "Todo not found");
 * ```
 */
export const ErrorCodes = {
  // Authentication & Authorization
  UNAUTHORIZED: "UNAUTHORIZED",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
  NOT_AUTHENTICATED: "NOT_AUTHENTICATED",

  // Resource Not Found
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  ORGANIZATION_NOT_FOUND: "ORGANIZATION_NOT_FOUND",
  ORGANIZATION_MEMBER_NOT_FOUND: "ORGANIZATION_MEMBER_NOT_FOUND",
  INVITATION_NOT_FOUND: "INVITATION_NOT_FOUND",

  // Invitation Errors
  INVITATION_NOT_PENDING: "INVITATION_NOT_PENDING",
  INVITATION_EXPIRED: "INVITATION_EXPIRED",

  // Business Logic
  USAGE_LIMIT_EXCEEDED: "USAGE_LIMIT_EXCEEDED",
  QUOTA_EXCEEDED: "QUOTA_EXCEEDED",

  // Validation
  INVALID_INPUT: "INVALID_INPUT",
  VALIDATION_FAILED: "VALIDATION_FAILED",
  FIELD_VALIDATION_ERROR: "FIELD_VALIDATION_ERROR",
  DUPLICATE_VALUE: "DUPLICATE_VALUE",

  // System
  INTERNAL_ERROR: "INTERNAL_ERROR",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

const errorCodeValues = new Set(Object.values(ErrorCodes));

/**
 * Runtime type guard to check if a value is a valid ErrorCode.
 * Useful for validating error codes from external sources.
 *
 * @example
 * ```ts
 * const code = "RESOURCE_NOT_FOUND";
 * if (isErrorCode(code)) {
 *   // code is narrowed to ErrorCode type
 *   createAppError(code, "Not found");
 * }
 * ```
 */
export function isErrorCode(value: unknown): value is ErrorCode {
  return typeof value === "string" && errorCodeValues.has(value as ErrorCode);
}

/**
 * Standard error severity levels
 */
export const ErrorSeverity = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

export type ErrorSeverityLevel = (typeof ErrorSeverity)[keyof typeof ErrorSeverity];

/**
 * Structured error payload type.
 * This is the data structure passed to ConvexError for consistent error handling.
 * Note: `details` is JSON-serialized to comply with Convex's Value type constraints.
 *
 * @example
 * ```ts
 * const payload: AppErrorPayload = {
 *   code: "RESOURCE_NOT_FOUND",
 *   message: "Todo not found",
 *   userMessage: "The requested todo could not be found",
 * };
 * throw new ConvexError(payload);
 * ```
 */
export type AppErrorPayload = {
  code: ErrorCode;
  message: string;
  severity?: ErrorSeverityLevel;
  details?: string;
  timestamp?: number;
  userMessage?: string;
  fieldErrors?: FieldError[];
};

/**
 * Create a standardized ConvexError with structured payload.
 * Use the pre-defined AppErrors factories for common cases.
 *
 * @example
 * ```ts
 * // Direct usage
 * throw createAppError(ErrorCodes.INVALID_INPUT, "Invalid email format", {
 *   severity: ErrorSeverity.LOW,
 *   details: { field: "email", received: userInput },
 *   userMessage: "Please enter a valid email address",
 * });
 *
 * // Or use pre-defined factories
 * throw AppErrors.invalidInput("email", "must be a valid email format");
 * ```
 */
export function createAppError(
  code: ErrorCode,
  message: string,
  options: {
    severity?: ErrorSeverityLevel;
    details?: Record<string, unknown>;
    userMessage?: string;
    fieldErrors?: FieldError[];
  } = {},
) {
  const payload: AppErrorPayload = {
    code,
    message,
    severity: options.severity ?? ErrorSeverity.MEDIUM,
    timestamp: Date.now(),
    userMessage: options.userMessage ?? message,
  };

  // Only add details if provided and non-empty, serialize to JSON string
  if (options.details && Object.keys(options.details).length > 0) {
    payload.details = JSON.stringify(options.details);
  }

  // Only add fieldErrors if provided
  if (options.fieldErrors && options.fieldErrors.length > 0) {
    payload.fieldErrors = options.fieldErrors;
  }

  return new ConvexError(payload);
}

/**
 * Pre-defined error factories for common error scenarios
 */
export const AppErrors = {
  // Authentication & Authorization
  unauthorized: (message = "You must be logged in to access this resource") =>
    createAppError(ErrorCodes.UNAUTHORIZED, message, {
      severity: ErrorSeverity.HIGH,
      userMessage: "Please log in to continue",
    }),

  insufficientPermissions: (permission?: string) =>
    createAppError(
      ErrorCodes.INSUFFICIENT_PERMISSIONS,
      permission ? `Missing permission: ${permission}` : "Insufficient permissions",
      {
        severity: ErrorSeverity.HIGH,
        ...(permission && { details: { permission } }),
        userMessage: "You don't have permission to perform this action",
      },
    ),

  notAuthenticated: (action = "perform this action") =>
    createAppError(ErrorCodes.NOT_AUTHENTICATED, `Authentication required to ${action}`, {
      severity: ErrorSeverity.HIGH,
      userMessage: "Please log in to continue",
    }),

  // Resource Not Found
  notFound: (resource: string, id?: string) =>
    createAppError(ErrorCodes.RESOURCE_NOT_FOUND, `${resource} not found`, {
      severity: ErrorSeverity.MEDIUM,
      ...(id && { details: { id } }),
      userMessage: `The requested ${resource} could not be found`,
    }),

  userNotFound: (userId?: string) =>
    createAppError(ErrorCodes.USER_NOT_FOUND, "User not found", {
      severity: ErrorSeverity.MEDIUM,
      ...(userId && { details: { userId } }),
      userMessage: "The requested user could not be found",
    }),

  organizationNotFound: (organizationId?: string) =>
    createAppError(ErrorCodes.ORGANIZATION_NOT_FOUND, "Organization not found", {
      severity: ErrorSeverity.MEDIUM,
      ...(organizationId && { details: { organizationId } }),
      userMessage: "The requested organization could not be found",
    }),

  organizationMemberNotFound: (memberId?: string) =>
    createAppError(ErrorCodes.ORGANIZATION_MEMBER_NOT_FOUND, "Organization member not found", {
      severity: ErrorSeverity.MEDIUM,
      ...(memberId && { details: { memberId } }),
      userMessage: "The requested organization member could not be found",
    }),

  invitationNotFound: () =>
    createAppError(ErrorCodes.INVITATION_NOT_FOUND, "Invitation not found", {
      severity: ErrorSeverity.MEDIUM,
      userMessage: "The invitation could not be found or has been removed",
    }),

  invitationNotPending: (status: string) =>
    createAppError(ErrorCodes.INVITATION_NOT_PENDING, `Invitation is ${status}, not pending`, {
      severity: ErrorSeverity.MEDIUM,
      details: { status },
      userMessage: `This invitation has already been ${status}`,
    }),

  invitationExpired: () =>
    createAppError(ErrorCodes.INVITATION_EXPIRED, "Invitation has expired", {
      severity: ErrorSeverity.MEDIUM,
      userMessage: "This invitation has expired. Please ask for a new one.",
    }),

  // Business Logic
  invalidState: (resource: string, reason: string) =>
    createAppError(ErrorCodes.INVALID_INPUT, `Invalid ${resource} state: ${reason}`, {
      severity: ErrorSeverity.MEDIUM,
      details: { resource, reason },
      userMessage: reason,
    }),

  usageLimitExceeded: (limit: string, current?: number, max?: number) =>
    createAppError(ErrorCodes.USAGE_LIMIT_EXCEEDED, `${limit} limit exceeded`, {
      severity: ErrorSeverity.MEDIUM,
      details: { limit, current, max },
      userMessage: `You have reached your ${limit.toLowerCase()} limit.`,
    }),

  quotaExceeded: (resource: string, limit: number, current: number, plan: string) =>
    createAppError(
      ErrorCodes.QUOTA_EXCEEDED,
      `${resource} quota exceeded: ${current}/${limit} (${plan} plan)`,
      {
        severity: ErrorSeverity.MEDIUM,
        details: { resource, limit, current, plan },
        userMessage: `You have reached your ${resource.toLowerCase()} limit on the ${plan} plan. Upgrade for more.`,
      },
    ),

  // Validation
  invalidInput: (field: string, reason?: string) =>
    createAppError(ErrorCodes.INVALID_INPUT, `Invalid ${field}${reason ? `: ${reason}` : ""}`, {
      severity: ErrorSeverity.LOW,
      details: { field, reason },
      userMessage: `Please check your ${field} and try again`,
    }),

  validationFailed: (errors: Record<string, string>) =>
    createAppError(ErrorCodes.VALIDATION_FAILED, "Validation failed", {
      severity: ErrorSeverity.LOW,
      details: { errors },
      userMessage: "Please check your input and try again",
    }),

  /**
   * Create a field-level validation error for forms
   * @example
   * AppErrors.fieldValidation([
   *   { field: "email", message: "Email already exists", code: "DUPLICATE" }
   * ])
   */
  fieldValidation: (fieldErrors: FieldError[], message = "Validation failed") =>
    createAppError(ErrorCodes.FIELD_VALIDATION_ERROR, message, {
      severity: ErrorSeverity.LOW,
      fieldErrors,
      userMessage: "Please fix the errors in the form",
    }),

  /**
   * Duplicate value error with field-level context
   * @example
   * AppErrors.duplicateValue("email", "user@example.com")
   */
  duplicateValue: (field: string, existingValue?: string) =>
    createAppError(
      ErrorCodes.DUPLICATE_VALUE,
      existingValue ? `${field} "${existingValue}" already exists` : `${field} already exists`,
      {
        severity: ErrorSeverity.LOW,
        fieldErrors: [
          {
            field,
            message: existingValue
              ? `"${existingValue}" is already in use`
              : "This value is already in use",
            code: "DUPLICATE",
          },
        ],
        userMessage: "Please choose a different value",
      },
    ),

  // System
  internalError: (message = "An internal error occurred") =>
    createAppError(ErrorCodes.INTERNAL_ERROR, message, {
      severity: ErrorSeverity.CRITICAL,
      userMessage: "Something went wrong. Please try again later.",
    }),

  externalServiceError: (service: string, error?: string) =>
    createAppError(
      ErrorCodes.EXTERNAL_SERVICE_ERROR,
      `External service error: ${service}${error ? ` - ${error}` : ""}`,
      {
        severity: ErrorSeverity.HIGH,
        details: { service, error },
        userMessage: "A third-party service is temporarily unavailable. Please try again later.",
      },
    ),
};

/**
 * Type guard to check if an error is an AppError (ConvexError with AppErrorPayload).
 * Validates that the code is a known ErrorCode for type soundness.
 *
 * @example
 * ```ts
 * try {
 *   await someMutation();
 * } catch (error) {
 *   if (isAppError(error)) {
 *     console.log(error.data.code); // TypeScript knows it's AppErrorPayload
 *   }
 * }
 * ```
 */
export function isAppError(error: unknown): error is ConvexError<AppErrorPayload> {
  if (!(error instanceof ConvexError) || error.data === null || typeof error.data !== "object") {
    return false;
  }

  const data = error.data as Record<string, unknown>;
  return "code" in data && "message" in data && isErrorCode(data.code);
}

/**
 * Extract field errors from an AppError for form validation display.
 * Returns an empty array if the error is not an AppError or has no field errors.
 *
 * @example
 * ```ts
 * try {
 *   await createTodo(data);
 * } catch (error) {
 *   const fieldErrors = getFieldErrors(error);
 *   for (const { field, message } of fieldErrors) {
 *     form.setError(field, { message });
 *   }
 * }
 * ```
 */
export function getFieldErrors(error: unknown): FieldError[] {
  if (isAppError(error)) {
    return error.data.fieldErrors ?? [];
  }
  return [];
}

/**
 * Extract a user-friendly message from any error type.
 * Priority: userMessage > message > error.data > error.message > fallback.
 *
 * @example
 * ```ts
 * try {
 *   await someMutation();
 * } catch (error) {
 *   toast.error(getUserFriendlyMessage(error));
 * }
 * ```
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.data.userMessage ?? error.data.message;
  }

  if (error instanceof ConvexError) {
    return typeof error.data === "string" ? error.data : "An error occurred";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
}
