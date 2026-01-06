import boundaries from "eslint-plugin-boundaries";

/**
 * Monorepo Boundaries Configuration
 *
 * Enforces strict import rules across the monorepo:
 *
 * Package Hierarchy:
 *   packages/shared     → No dependencies (base layer)
 *   packages/ui         → Can import from: shared
 *   packages/backend    → Can import from: shared
 *   packages/emails     → Can import from: shared
 *   apps/web            → Can import from: all packages
 *   apps/e2e            → Can import from: shared, backend (types only)
 *   apps/storybook      → Can import from: ui, shared
 *
 * Within apps/web (Feature-Sliced Design):
 *   shared (components/, lib/, hooks/) → No feature imports
 *   features/*          → Own feature + @x public APIs only
 *   app/                → Can import from features + shared
 *
 * @see https://feature-sliced.design
 * @see https://github.com/javierbrea/eslint-plugin-boundaries
 */

/** @type {import('eslint').Linter.Config} */
export default {
  files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
  plugins: {
    boundaries,
  },
  settings: {
    // Import resolver for proper path resolution
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: [
          "./tsconfig.json",
          "./apps/*/tsconfig.json",
          "./packages/*/tsconfig.json",
        ],
      },
    },
    "boundaries/elements": [
      // MOST SPECIFIC PATTERNS FIRST (order matters - first match wins)

      // === WEB APP INTERNAL (Feature-Sliced Design) ===
      { type: "web-app", pattern: ["apps/web/src/app/**/*"], mode: "folder" },
      { type: "web-features", pattern: "apps/web/src/features/**/*", capture: ["feature"], mode: "folder" },
      { type: "web-shared", pattern: ["apps/web/src/components/**/*", "apps/web/src/lib/**/*", "apps/web/src/hooks/**/*", "apps/web/src/utils/**/*", "apps/web/src/config/**/*"] },

      // === BACKEND INTERNAL ===
      { type: "backend-lib", pattern: ["packages/backend/convex/lib/*", "packages/backend/convex/lib/**/*"] },
      { type: "backend-utils", pattern: ["packages/backend/convex/utils/*", "packages/backend/convex/utils/**/*"] },
      { type: "backend-functions", pattern: "packages/backend/convex/*", mode: "file" },

      // === E2E INTERNAL ===
      { type: "e2e-lib", pattern: ["apps/e2e/lib/*", "apps/e2e/lib/**/*"] },
      { type: "e2e-tests", pattern: ["apps/e2e/tests/*", "apps/e2e/tests/**/*"] },
      { type: "e2e-scripts", pattern: ["apps/e2e/scripts/*", "apps/e2e/scripts/**/*"] },

      // === PACKAGES (after internal patterns) ===
      { type: "shared", pattern: ["packages/shared/**/*"] },
      { type: "ui", pattern: ["packages/ui/**/*"] },
      { type: "backend", pattern: ["packages/backend/**/*"] },
      { type: "emails", pattern: ["packages/emails/**/*"] },
      { type: "config", pattern: ["packages/config/**/*"] },
      { type: "eslint-config", pattern: ["packages/eslint-config/**/*"] },
      { type: "vitest-config", pattern: ["packages/vitest-config/*", "packages/vitest-config/**/*"] },

      // === APPS (catch-all for files not matching internal patterns) ===
      { type: "web", pattern: ["apps/web/**/*"] },
      { type: "e2e", pattern: ["apps/e2e/**/*"] },
      { type: "storybook", pattern: ["apps/storybook/**/*"] },
    ],
    "boundaries/ignore": [
      // Public API folders (@x pattern for cross-feature imports)
      "**/@x/**",
      // Test files
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "**/*.stories.tsx",
      // Config files (tooling, not architecture)
      "**/*.config.ts",
      "**/*.config.js",
      "**/vitest.*.config.ts",
      "**/playwright.*.config.ts",
      "**/sentry.*.config.ts",
      "**/lingui.config.ts",
      "**/tailwind.config.ts",
      // Vitest config package (utility package, not architecture)
      "packages/vitest-config/**",
      // Setup files
      "**/setup.ts",
      // Scripts (utility, not architecture)
      "scripts/**",
      // Root-level BDD tests
      "tests/**",
      // Generated and external
      "**/node_modules/**",
      "**/_generated/**",
    ],
  },
  rules: {
    "boundaries/element-types": [
      "error",
      {
        default: "disallow",
        rules: [
          // === PACKAGE LEVEL BOUNDARIES ===

          // shared: no external package imports (base layer)
          { from: "shared", allow: [] },

          // ui: can import from shared only
          { from: "ui", allow: ["shared"] },

          // backend: can import from shared, emails (for sending), and internal functions
          { from: "backend", allow: ["shared", "emails", "backend-functions"] },

          // emails: can import from shared only
          { from: "emails", allow: ["shared"] },

          // config packages: standalone
          { from: "config", allow: [] },
          { from: "eslint-config", allow: [] },
          { from: "vitest-config", allow: [] },

          // === APP LEVEL BOUNDARIES ===

          // web app: can import from all packages + internal shared
          { from: "web", allow: ["shared", "ui", "backend", "config", "web-shared"] },

          // e2e: can import from shared, backend, and itself
          { from: "e2e", allow: ["shared", "backend", "e2e", "e2e-lib", "e2e-scripts"] },

          // storybook: can import from ui and shared
          { from: "storybook", allow: ["ui", "shared"] },

          // === WEB APP INTERNAL (Feature-Sliced Design) ===

          // web-shared (components, lib, hooks, utils): can import from shared layers + internal web types
          { from: "web-shared", allow: ["web-shared", "shared", "ui", "web", "backend-functions"] },

          // web-features: own feature + other features via @x only
          {
            from: "web-features",
            allow: [
              "web-shared",
              "shared",
              "ui",
              "backend",
              "backend-functions",
              "web",
              // Same feature
              ["web-features", { feature: "${from.feature}" }],
              // Other features only via @x public API (handled by feature-boundaries.js)
            ],
          },

          // web-app (routes): can import from features + shared + backend functions
          { from: "web-app", allow: ["web-features", "web-shared", "shared", "ui", "backend", "backend-functions", "web"] },

          // === BACKEND INTERNAL ===

          // backend-lib: only utils
          { from: "backend-lib", allow: ["backend-utils", "shared"] },

          // backend-utils: only shared
          { from: "backend-utils", allow: ["shared"] },

          // backend-functions: can use lib, utils, shared, other functions, and parent package
          { from: "backend-functions", allow: ["backend-lib", "backend-utils", "shared", "backend-functions", "backend"] },

          // === E2E INTERNAL ===

          // e2e-lib: can import from itself, shared, backend, and e2e catch-all
          { from: "e2e-lib", allow: ["e2e-lib", "shared", "backend", "e2e"] },

          // e2e-tests: can use lib, itself, shared, backend, e2e catch-all
          { from: "e2e-tests", allow: ["e2e-tests", "e2e-lib", "shared", "backend", "e2e"] },

          // e2e-scripts: can use lib, shared, backend
          { from: "e2e-scripts", allow: ["e2e-scripts", "e2e-lib", "shared", "backend"] },
        ],
      },
    ],
    // Downgraded to warn until patterns are refined
    "boundaries/no-unknown": ["warn"],
    "boundaries/no-unknown-files": ["warn"],
  },
};
