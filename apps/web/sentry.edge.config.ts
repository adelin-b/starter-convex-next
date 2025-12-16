// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
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
