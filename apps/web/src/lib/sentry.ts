import { captureException, captureMessage } from "@sentry/nextjs";

type Feature = "auth" | "admin" | "organizations" | "vehicles" | "users";

type SentryLogOptions = {
  feature: Feature;
  action: string;
  extra?: Record<string, unknown>;
};

/**
 * Log a warning to Sentry for expected errors that should be monitored.
 * Use for auth failures, validation errors, etc.
 */
export function logWarning(message: string, options: SentryLogOptions): void {
  captureMessage(message, {
    level: "warning",
    tags: { feature: options.feature, action: options.action },
    extra: options.extra,
  });
}

/**
 * Log an exception to Sentry for unexpected errors.
 * Use for catch blocks where errors should be visible.
 */
export function logError(error: unknown, options: SentryLogOptions): void {
  captureException(error, {
    tags: { feature: options.feature, action: options.action },
    extra: options.extra,
  });
}
