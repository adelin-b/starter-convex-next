"use client";

import { Trans, useLingui } from "@lingui/react/macro";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type RedirectOnAuthProps = {
  callbackUrl: string;
};

/**
 * Component that redirects authenticated users to their callback URL.
 * Shows a loading spinner with "Redirecting..." message.
 */
export function RedirectOnAuth({ callbackUrl }: RedirectOnAuthProps) {
  const router = useRouter();
  const { t } = useLingui();

  useEffect(() => {
    // Dynamic callback URL - type cast needed for Next.js strict routes
    router.replace(callbackUrl as Parameters<typeof router.replace>[0]);
  }, [router, callbackUrl]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[oklch(12%_0.02_280deg)] to-[oklch(8%_0.015_260deg)] dark:from-[oklch(12%_0.02_280deg)] dark:to-[oklch(8%_0.015_260deg)]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 aria-label={t`Redirecting`} className="size-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">
          <Trans>Redirecting...</Trans>
        </p>
      </div>
    </div>
  );
}
