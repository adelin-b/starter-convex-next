import eslintComments from "@eslint-community/eslint-plugin-eslint-comments/configs";
import tsParser from "@typescript-eslint/parser";
import eslintPluginZodX from "eslint-plugin-zod-x";
import playwright from "eslint-plugin-playwright";
import sonarjs from "eslint-plugin-sonarjs";
import unicorn from "eslint-plugin-unicorn";
import vitest from "@vitest/eslint-plugin";
import biomeConfig from "eslint-config-biome";
import monorepoConfig from "./monorepo-boundaries.js";
import preferCn from "./rules/prefer-cn.js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Disable ESLint rules that overlap with Biome (formatting, syntax checks)
  biomeConfig,
  // Zod-x plugin for zod schema best practices
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: eslintPluginZodX.configs.recommended.plugins,
    rules: {
      ...eslintPluginZodX.configs.recommended.rules,
      "zod-x/prefer-namespace-import": "off",
    },
  },
  eslintComments.recommended,
  sonarjs.configs.recommended,
  unicorn.configs.all,
  monorepoConfig,
  {
    rules: {
      // SonarJS - enable commonly used rules
      "sonarjs/no-collapsible-if": "error",
      // Raised thresholds to avoid noise in existing code
      "sonarjs/cyclomatic-complexity": ["warn", { threshold: 25 }],
      "sonarjs/cognitive-complexity": ["warn", 25],
      "sonarjs/prefer-immediate-return": "error",
      "sonarjs/no-nested-switch": "error",
      "sonarjs/max-switch-cases": ["error", 20],
      // SonarJS - disable noisy/slow rules
      "sonarjs/aws-restricted-ip-admin-access": "off", // Not using AWS, rule is slow (~300ms)
      "sonarjs/no-duplicate-string": "off",
      "sonarjs/todo-tag": "off", // TODOs are fine
      "sonarjs/fixme-tag": "off", // FIXMEs are fine
      "sonarjs/no-hardcoded-passwords": "off", // false positives in test files
      "sonarjs/no-os-command-from-path": "off", // valid in scripts
      "sonarjs/os-command": "off", // valid in build scripts
      "sonarjs/no-commented-code": "off", // sometimes useful to keep
      "sonarjs/no-nested-template-literals": "off", // often cleaner than alternatives
      "sonarjs/pseudo-random": "off", // valid for non-crypto uses
      "sonarjs/unused-import": "off", // handled by TypeScript
      "sonarjs/no-nested-functions": "off", // sometimes needed
      "sonarjs/no-nested-conditional": "off", // sometimes clearer than alternatives
      "sonarjs/no-identical-functions": "off", // sometimes intentional
      "sonarjs/no-duplicated-branches": "off", // sometimes intentional
      "sonarjs/no-identical-expressions": "off", // false positives
      "sonarjs/slow-regex": "off", // rarely a real issue
      "sonarjs/table-header": "off", // component library issue

      // Unicorn overrides
      "unicorn/no-unnecessary-polyfills": "off", // Next.js handles polyfills, rule is slow (~600ms)
      "unicorn/no-keyword-prefix": "off",
      // Disabled: null vs undefined has semantic meaning in this codebase
      // null = "not found" (orphaned record), undefined = "not yet loaded"
      // Also: better-auth and Convex APIs return null, not undefined
      "unicorn/no-null": "off",
      // Disabled: opinionated import style preference
      "unicorn/import-style": "off",
      // Disabled: process.exit is valid in CLI scripts
      "unicorn/no-process-exit": "off",
      // Disabled: prefer top-level await is valid but not always practical
      "unicorn/prefer-top-level-await": "off",
      // Disabled: filename conventions vary
      "unicorn/filename-case": "off",
      // Disabled: sometimes array.sort() is intentional
      "unicorn/no-array-sort": "off",
      // Disabled: consistent-destructuring is too strict
      "unicorn/consistent-destructuring": "off",
      // Disabled: these are style preferences
      "unicorn/consistent-function-scoping": "off",
      "unicorn/no-unused-properties": "warn",
      "unicorn/explicit-length-check": "off",
      "unicorn/prefer-ternary": "off", // sometimes if/else is clearer
      "unicorn/no-object-as-default-parameter": "off", // valid pattern
      "unicorn/no-array-reduce": "off", // reduce is often the right choice
      // Disabled: import.meta.dirname requires Node 20.11+, project supports >=18
      "unicorn/prefer-import-meta-properties": "off",
      "unicorn/prevent-abbreviations": [
        "error",
        {
          replacements: {
            // React/TypeScript common
            props: false,
            ref: false,
            refs: false,
            params: false,
            param: false,
            src: false,
            acc: false,
            env: false,
            err: false,
            msg: false,
            prev: false,
            args: false,
            // Additional common abbreviations
            btn: false,
            dir: false,
            ctx: false,
            lib: false,
            docs: false,
            doc: false,
            func: false,
            cmd: false,
            arg: false,
            str: false,
            num: false,
            obj: false,
            val: false,
            req: false,
            res: false,
            idx: false,
            i: false,
            e: false,
            dest: false,
            dev: false,
            utils: false,
            fn: false, // fn-sphere library naming convention
          },
          allowList: {
            Props: true,
            Ref: true,
            Refs: true,
            Params: true,
            Param: true,
            Fn: true, // fn-sphere library naming convention
          },
        },
      ],
    },
  },
  {
    // Block v validator import from convex/values (use Zod instead)
    // Exception: crud.ts legitimately needs v for dynamic validator building
    files: ["**/*.ts", "**/*.tsx"],
    ignores: ["**/utils/crud.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "convex/values",
              importNames: ["v"],
              message:
                "Use Zod schemas instead of v validator. See packages/backend/convex/schema.ts for examples.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "starter-saas": {
        rules: {
          "prefer-cn": preferCn,
        },
      },
    },
    rules: {
      "starter-saas/prefer-cn": "warn",
      // FormatJS rules removed after migration to Lingui
      // i18n linting now handled by eslint-plugin-lingui in apps/web/eslint.config.js
    },
  },
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/.next-e2e/**",
      "**/.next-e2e-*/**", // Dynamic port E2E build directories
      "**/.convex-e2e-test*/**", // Dynamic port Convex test directories
      "**/dist/**",
      "**/convex/_generated/**",
      "**/.worktree/**",
      "**/.worktrees/**",
      "**/storybook-static/**",
      "**/*.js",
      "**/*.stories.tsx",
      "**/packages/emails/**", // emails use server-side rendering, no react-intl
      "**/story-helpers.tsx",
      // Web app has its own ESLint config with feature-boundaries rules
      // Root config doesn't have eslint-plugin-import configured
      "apps/web/src/**",
    ],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: false,
    },
  },
  // Playwright tests (E2E only - avoid matching Vitest specs)
  {
    ...playwright.configs["flat/recommended"],
    files: ["**/e2e/**/*.spec.ts", "**/storybook/**/*.spec.ts"],
    rules: {
      ...playwright.configs["flat/recommended"].rules,
      // Disable overly strict rules
      "playwright/no-networkidle": "off", // sometimes needed for reliable tests
    },
  },
  // Vitest tests
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/__tests__/**/*.ts"],
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
      // Recognize type assertion helpers as valid assertions
      "vitest/expect-expect": [
        "error",
        {
          assertFunctionNames: ["expect", "expectTypeOf", "assertType"],
        },
      ],
    },
  },
];
