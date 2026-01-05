"use client";

import { Trans } from "@lingui/react/macro";
import { captureMessage } from "@sentry/nextjs";
import { api } from "@starter-saas/backend/convex/_generated/api";
import { assertNever } from "@starter-saas/shared/assert-never";
import { Loader2, WifiOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQueryWithStatus } from "@/lib/convex-hooks";

// Delay before showing loading overlay (ms)
const LOADING_DELAY_MS = 2000;
// Delay before showing error state and logging to Sentry (ms)
const ERROR_DELAY_MS = 10_000;

type ConnectionState = "connected" | "connecting" | "slow" | "error";

/**
 * Overlay that blocks the app when not connected to the Convex backend.
 * - Shows nothing for the first 2 seconds (normal loading)
 * - Shows a loading overlay after 2 seconds
 * - Shows an error state after 10 seconds and logs to Sentry
 */
export function ConnectionStatusOverlay({ children }: { children: React.ReactNode }) {
  const { data: healthCheck } = useQueryWithStatus(api.healthCheck.get);
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");
  const sentryLogged = useRef(false);
  const connectingStartTime = useRef<number | null>(null);

  useEffect(() => {
    // Reset when connected
    if (healthCheck === "OK") {
      setConnectionState("connected");
      sentryLogged.current = false;
      connectingStartTime.current = null;
      return;
    }

    // Start tracking connection time
    if (connectingStartTime.current === null) {
      connectingStartTime.current = Date.now();
    }

    // Set up timers for delayed states
    const showLoadingTimer = setTimeout(() => {
      if (healthCheck !== "OK") {
        setConnectionState("slow");
      }
    }, LOADING_DELAY_MS);

    const showErrorTimer = setTimeout(() => {
      if (healthCheck !== "OK") {
        setConnectionState("error");

        // Log to Sentry only once per connection attempt
        if (!sentryLogged.current) {
          sentryLogged.current = true;
          captureMessage("Connection to Convex backend failed", {
            level: "error",
            tags: {
              feature: "connection",
              action: "healthCheck",
            },
            extra: {
              healthCheckResult: healthCheck,
              connectionDuration: Date.now() - (connectingStartTime.current ?? Date.now()),
            },
          });
        }
      }
    }, ERROR_DELAY_MS);

    return () => {
      clearTimeout(showLoadingTimer);
      clearTimeout(showErrorTimer);
    };
  }, [healthCheck]);

  switch (connectionState) {
    case "connected": {
      return <>{children}</>;
    }

    case "connecting": {
      return <>{children}</>;
    }

    case "slow": {
      return (
        <>
          {children}
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 rounded-lg border bg-card p-8 shadow-lg">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="text-center">
                <h2 className="font-semibold text-lg">
                  <Trans>Connecting...</Trans>
                </h2>
                <p className="text-muted-foreground text-sm">
                  <Trans>Establishing connection to the server</Trans>
                </p>
              </div>
            </div>
          </div>
        </>
      );
    }

    case "error": {
      return (
        <>
          {children}
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 rounded-lg border bg-card p-8 shadow-lg">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <WifiOff className="h-8 w-8 text-destructive" />
              </div>
              <div className="text-center">
                <h2 className="font-semibold text-lg">
                  <Trans>Connection Problem</Trans>
                </h2>
                <p className="text-muted-foreground text-sm">
                  <Trans>
                    Unable to connect to the server. Please check your internet connection and try
                    again.
                  </Trans>
                </p>
              </div>
            </div>
          </div>
        </>
      );
    }

    default: {
      assertNever(connectionState);
    }
  }
}
