// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

// biome-ignore lint/performance/noNamespaceImport: Sentry SDK requires namespace import pattern
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // biome-ignore lint/style/noProcessEnv: Sentry config requires direct env access at initialization
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 1,

  // Only enable in production
  // biome-ignore lint/style/noProcessEnv: Sentry config requires direct env access at initialization
  enabled: process.env.NODE_ENV === "production",

  // Set environment
  // biome-ignore lint/style/noProcessEnv: Sentry config requires direct env access at initialization
  environment: process.env.NODE_ENV,

  // Debug mode for development
  debug: false,
});
