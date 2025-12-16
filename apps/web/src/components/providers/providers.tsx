"use client";

import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import type { Messages } from "@lingui/core";
import { Toaster } from "@starter-saas/ui/sonner";
import { ConvexReactClient } from "convex/react";
import { ConvexQueryCacheProvider } from "convex-helpers/react/cache/provider";
import { ConnectionStatusOverlay } from "@/components/ui/connection-status-overlay";
import { env } from "@/config/env";
import { authClient } from "@/lib/auth/client";
import type { Locale } from "@/lib/i18n";
import { IntlProvider } from "./intl-provider";
import { ThemeProvider } from "./theme-provider";

const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL);

type ProvidersProps = {
  children: React.ReactNode;
  locale: Locale;
  messages: Messages;
};

export default function Providers({ children, locale, messages }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange enableSystem>
      <IntlProvider locale={locale} messages={messages}>
        <ConvexBetterAuthProvider authClient={authClient} client={convex}>
          <ConvexQueryCacheProvider>
            <ConnectionStatusOverlay>{children}</ConnectionStatusOverlay>
          </ConvexQueryCacheProvider>
        </ConvexBetterAuthProvider>
      </IntlProvider>
      <Toaster richColors />
    </ThemeProvider>
  );
}
