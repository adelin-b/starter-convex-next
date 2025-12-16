// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

// biome-ignore lint/performance/noNamespaceImport: Sentry SDK requires namespace import pattern
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // biome-ignore lint/style/noProcessEnv: Sentry config requires direct env access at initialization
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adds request headers and IP for users
  sendDefaultPii: true,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
    Sentry.feedbackIntegration({
      colorScheme: "system",
      showBranding: false,
      autoInject: false, // We'll control when to show the button
      useSentryUser: {
        email: "email",
        name: "username",
      },
      buttonLabel: "Report Feedback",
      submitButtonLabel: "Submit Feedback",
      formTitle: "Report Feedback",
      messagePlaceholder: "What's on your mind? Tell us what happened or what could be improved.",
      showName: true,
      isNameRequired: false,
      showEmail: true,
      isEmailRequired: false,
      successMessageText: "Thank you for your feedback! We'll review it shortly.",
    }),
  ],

  // Performance Monitoring
  tracesSampleRate: 1,

  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1, // 100% of sessions with errors

  // Only enable in production
  // biome-ignore lint/style/noProcessEnv: Sentry config requires direct env access at initialization
  enabled: process.env.NODE_ENV === "production",

  // Set environment
  // biome-ignore lint/style/noProcessEnv: Sentry config requires direct env access at initialization
  environment: process.env.NODE_ENV,

  // Debug mode for development
  debug: false,
});
