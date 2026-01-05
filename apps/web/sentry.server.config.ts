// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

// biome-ignore lint/performance/noNamespaceImport: Sentry SDK requires namespace import pattern
import * as Sentry from "@sentry/nextjs";

// biome-ignore lint/style/noProcessEnv: Environment check at initialization
const isDev = process.env.NODE_ENV === "development";

// Spotlight auto-enabled in dev - sidecar runs via `bun dev`
const spotlightEnabled = isDev;

Sentry.init({
  // biome-ignore lint/style/noProcessEnv: Sentry config requires direct env access at initialization
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 1,

  // Enable in production OR when Spotlight is enabled for dev
  // biome-ignore lint/style/noProcessEnv: Sentry config requires direct env access at initialization
  enabled: process.env.NODE_ENV === "production" || spotlightEnabled,

  // Set environment
  // biome-ignore lint/style/noProcessEnv: Sentry config requires direct env access at initialization
  environment: process.env.NODE_ENV,

  // Spotlight: local dev overlay showing Sentry events without sending to cloud
  // https://spotlightjs.com/setup/nextjs/
  spotlight: spotlightEnabled,

  // Debug mode for development
  debug: false,
});
