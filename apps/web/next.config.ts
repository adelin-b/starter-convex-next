import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import "./src/config/env";

// Use separate build directory for E2E tests to avoid lock conflicts
// when running dev server and E2E tests simultaneously
// biome-ignore lint/style/noProcessEnv: Build-time configuration
const distDir = process.env.E2E_MODE === "true" ? ".next-e2e" : ".next"; // eslint-disable-line unicorn/prevent-abbreviations -- matches Next.js config prop

const nextConfig: NextConfig = {
  distDir,
  typedRoutes: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      // Handle .po files with Lingui loader in Turbopack
      "*.po": {
        loaders: ["@lingui/loader"],
        as: "*.js",
      },
    },
  },
  allowedDevOrigins: ["https://tweakcn.com"],

  // Lingui SWC plugin for macro transformation
  // @lingui/swc-plugin@5.8.0 uses swc_core 45.0.2, compatible with Next.js 16.0.7 (swc_core 45.0.1)
  experimental: {
    swcPlugins: [["@lingui/swc-plugin", {}]],
  },

  // Enable source maps for V8 coverage when NODE_V8_COVERAGE is set
  webpack: (config) => {
    // biome-ignore lint/style/noProcessEnv: V8 coverage flag must be read from environment at build time
    if (process.env.NODE_V8_COVERAGE) {
      Object.defineProperty(config, "devtool", {
        get() {
          return "source-map";
        },
        // biome-ignore lint/suspicious/noEmptyBlockStatements: Intentionally empty to prevent Next.js from overwriting devtool
        set() {},
      });
    }
    return config;
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // biome-ignore lint/style/noProcessEnv: Sentry build config requires env vars at build time
  org: process.env.SENTRY_ORG,
  // biome-ignore lint/style/noProcessEnv: Sentry build config requires env vars at build time
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  // biome-ignore lint/style/noProcessEnv: CI detection requires process.env.CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Configure source maps
  sourcemaps: {
    // Hide source maps from generated client bundles
    deleteSourcemapsAfterUpload: true,
  },

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with Turbo)
  automaticVercelMonitors: true,
});
