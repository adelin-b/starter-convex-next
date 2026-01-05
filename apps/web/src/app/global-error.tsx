"use client";

// biome-ignore lint/performance/noNamespaceImport: Sentry SDK requires namespace import pattern
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

/**
 * Global error boundary - renders outside IntlProvider context.
 * Text is intentionally hardcoded as this is the last-resort error fallback
 * and must function without any dependencies on app context.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <h2 className="font-bold text-2xl">Something went wrong!</h2>
          <p className="text-muted-foreground">
            An unexpected error occurred. Our team has been notified.
          </p>
          <button
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            onClick={() => reset()}
            type="button"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
