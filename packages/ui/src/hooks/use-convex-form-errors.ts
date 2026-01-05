import type { FieldError } from "@starter-saas/shared/types";
import type { FieldPath, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { env } from "../env";

// Re-export FieldError for backwards compatibility
export type { FieldError } from "@starter-saas/shared/types";

/**
 * Convex error data structure matching AppErrorPayload
 */
type ConvexErrorData = {
  fieldErrors?: FieldError[];
  userMessage?: string;
  message?: string;
};

type ConvexFormErrorOptions = {
  /** Custom toast function (defaults to sonner toast.error) */
  showToast?: (message: string) => void;
  /** Whether to show toast notifications (default: true) */
  enableToast?: boolean;
  /** Callback when a field error doesn't match any form field (for debugging) */
  onUnmatchedField?: (fieldName: string, message: string) => void;
};

/**
 * Extract and validate Convex error data from an unknown error
 */
function extractConvexErrorData(err: unknown): ConvexErrorData | null {
  if (!err || typeof err !== "object" || !("data" in err)) {
    return null;
  }

  const errorData = (err as { data?: unknown }).data;
  if (!errorData || typeof errorData !== "object") {
    return null;
  }

  return errorData as ConvexErrorData;
}

/**
 * Process field errors and apply them to a form
 * @returns number of field errors that were successfully applied
 */
function applyFieldErrorsToForm<TFormValues extends Record<string, unknown>>(
  fieldErrors: FieldError[],
  form: UseFormReturn<TFormValues>,
  onUnmatchedField?: (fieldName: string, message: string) => void,
): void {
  const formValues = form.getValues();

  for (const fieldError of fieldErrors) {
    const fieldName = fieldError.field;

    if (fieldName in formValues) {
      form.setError(fieldName as FieldPath<TFormValues>, {
        type: fieldError.code || "validation",
        message: fieldError.message,
      });
    } else {
      // Warn about mismatched field names (only logs in dev builds)
      if (env.NODE_ENV === "development") {
        console.warn(
          `[useConvexFormErrors] Field "${fieldName}" not found in form. Error: "${fieldError.message}". ` +
            "Check for field name mismatches between backend and frontend.",
        );
      }
      onUnmatchedField?.(fieldName, fieldError.message);
    }
  }
}

/**
 * Core error handling logic shared between hook and standalone function
 */
function processConvexError<TFormValues extends Record<string, unknown>>(
  err: unknown,
  form: UseFormReturn<TFormValues>,
  options: ConvexFormErrorOptions,
): boolean {
  const showToast = options.showToast ?? toast.error;
  const enableToast = options.enableToast ?? true;

  const data = extractConvexErrorData(err);
  if (!data) {
    return false;
  }

  // Handle field-level validation errors
  if (data.fieldErrors && Array.isArray(data.fieldErrors) && data.fieldErrors.length > 0) {
    applyFieldErrorsToForm(data.fieldErrors, form, options.onUnmatchedField);

    if (enableToast) {
      showToast(data.fieldErrors[0]?.message || "Please fix the errors in the form");
    }

    return true;
  }

  // Handle userMessage or message from structured errors
  const errorMessage = data.userMessage ?? data.message;
  if (errorMessage && typeof errorMessage === "string") {
    if (enableToast) {
      showToast(errorMessage);
    }
    return true;
  }

  return false;
}

/**
 * Handle Convex errors in forms with field-level validation support.
 *
 * **IMPORTANT**: `handleConvexError` returns `false` when the error is not a
 * recognized Convex error. You MUST provide fallback error handling for these cases.
 *
 * @returns Object with `handleConvexError(err)` that returns:
 *   - `true` if the error was a Convex error and was handled (toast shown, field errors set)
 *   - `false` if the error was NOT a Convex error - you must handle it yourself
 *
 * @example
 * ```tsx
 * const form = useForm<FormValues>({...});
 * const { handleConvexError } = useConvexFormErrors(form);
 *
 * const onSubmit = async (values: FormValues) => {
 *   try {
 *     await createMutation(values);
 *   } catch (err) {
 *     // REQUIRED: Always check return value and provide fallback
 *     if (handleConvexError(err)) return;
 *     // Fallback for non-Convex errors (network, unexpected, etc.)
 *     onError(getConvexErrorMessage(err, "Operation failed"));
 *   }
 * };
 * ```
 */
export function useConvexFormErrors<TFormValues extends Record<string, unknown>>(
  form: UseFormReturn<TFormValues>,
  options?: ConvexFormErrorOptions,
) {
  const handleConvexError = (err: unknown): boolean => processConvexError(err, form, options ?? {});

  return { handleConvexError };
}

/**
 * Extract a user-friendly message from any Convex error.
 * Useful for displaying errors outside of forms.
 */
export function getConvexErrorMessage(err: unknown, fallback = "An error occurred"): string {
  const data = extractConvexErrorData(err);
  if (!data) {
    return err instanceof Error ? err.message : fallback;
  }

  return data.userMessage ?? data.message ?? fallback;
}
