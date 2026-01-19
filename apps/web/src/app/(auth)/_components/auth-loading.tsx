"use client";

import { useLingui } from "@lingui/react/macro";
import { Loader2 } from "lucide-react";

/**
 * Full-screen loading spinner for auth states.
 * Uses the same gradient background as the auth page.
 */
export function AuthLoading() {
  const { t } = useLingui();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[oklch(12%_0.02_280deg)] light:from-[oklch(98%_0.01_280deg)] light:to-[oklch(95%_0.015_260deg)] to-[oklch(8%_0.015_260deg)] dark:from-[oklch(12%_0.02_280deg)] dark:to-[oklch(8%_0.015_260deg)]">
      <Loader2
        aria-label={t`Loading authentication`}
        className="size-10 animate-spin text-primary"
      />
    </div>
  );
}

/**
 * Loading fallback for Suspense boundary.
 * Note: aria-label is hardcoded because this renders outside IntlProvider context.
 */
export function SuspenseLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[oklch(12%_0.02_280deg)] to-[oklch(8%_0.015_260deg)] dark:from-[oklch(12%_0.02_280deg)] dark:to-[oklch(8%_0.015_260deg)]">
      <Loader2 aria-label="Loading authentication" className="size-10 animate-spin text-primary" />
    </div>
  );
}
