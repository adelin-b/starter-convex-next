"use strict";
const fs = require("node:fs");
const path = require("node:path");

const MAX_LINE_LENGTH = 100;

// Dynamically get package/app names from monorepo
function getMonorepoPackages() {
  const packages = [];
  const directories = ["apps", "packages"];

  for (const dir of directories) {
    const dirPath = path.join(__dirname, dir);
    if (fs.existsSync(dirPath)) {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith(".")) {
          packages.push(entry.name);
        }
      }
    }
  }

  return packages;
}

// Base scopes that are always available
const baseScopes = [
  // Infrastructure scopes
  "ci",
  "infra",
  "dx",
  "monitoring",
  "deps",
  "deps-dev",
  "release",
  "mobile",
  // Business/feature scopes
  "dashboard",
  "admin",
  "auth",
  "billing",
  "documents",
  "users",
  "organizations",
  "settings",
];

// Combine dynamic packages with base scopes (deduplicated)
const allScopes = [...new Set([...getMonorepoPackages(), ...baseScopes])];

module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
      ],
    ],
    // Dynamic scopes: packages/apps + base scopes
    // Set to warning (1) so new features/scopes don't block commits
    "scope-enum": [1, "always", allScopes],
    "scope-empty": [0],
    "subject-case": [2, "never", ["sentence-case", "start-case", "pascal-case", "upper-case"]],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "header-max-length": [2, "always", MAX_LINE_LENGTH],
    "body-max-line-length": [2, "always", MAX_LINE_LENGTH],
    "footer-max-line-length": [2, "always", MAX_LINE_LENGTH],
  },
};
