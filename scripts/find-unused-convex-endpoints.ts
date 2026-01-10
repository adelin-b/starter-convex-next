#!/usr/bin/env npx tsx

/**
 * Find unused Convex API endpoints.
 *
 * Parses the generated api.d.ts to get accurate list of endpoints,
 * then checks usage in the codebase.
 *
 * Usage: npx tsx scripts/find-unused-convex-endpoints.ts
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const CONVEX_DIR = join(process.cwd(), "packages/backend/convex");
const PROJECT_ROOT = process.cwd();
const API_DTS_PATH = join(CONVEX_DIR, "_generated/api.d.ts");

type Endpoint = {
  module: string; // e.g., "items", "testing/testing"
  name: string; // e.g., "list", "createTestUser"
  apiPath: string; // e.g., "api.items.list", "api.testing.testing.createTestUser"
  isInternal: boolean;
  file: string; // absolute path to source file
  funcType: string; // e.g., "mutation", "query", "internalMutation"
};

/**
 * Parse api.d.ts to extract all public API endpoints from the fullApi type.
 * The file structure looks like:
 *   import type * as agencies from "../agencies.js";
 *   ...
 *   declare const fullApi: ApiFromModules<{ agencies: typeof agencies; ... }>;
 *
 * And then the actual modules export functions like:
 *   export const list = query({...});
 */
// Top-level regex patterns (biome: useTopLevelRegex)
const QUOTED_MODULE_PATTERN = /"([^"]+)":\s*typeof\s+(\w+)/g;
const UNQUOTED_MODULE_PATTERN = /^\s*(\w+):\s*typeof\s+(\w+)/gm;
const FUNC_PATTERN =
  /export\s+const\s+(\w+)\s*=\s*(query|mutation|action|internalQuery|internalMutation|internalAction|testingMutation|testingQuery|zQuery|zMutation|zAction)\s*[(<]/g;
const SKIP_KEYWORDS = new Set(["const", "declare", "export", "type", "import"]);
const API_PREFIX_PATTERN = /^api\./;

function extractModulesFromContent(content: string): Array<{ apiPath: string; importVar: string }> {
  const modules: Array<{ apiPath: string; importVar: string }> = [];

  // Match quoted paths (e.g., "testing/testing": typeof testing_testing)
  const quotedMatches = content.matchAll(QUOTED_MODULE_PATTERN);
  for (const match of quotedMatches) {
    modules.push({
      apiPath: match[1],
      importVar: match[2],
    });
  }

  // Match unquoted paths (e.g., agencies: typeof agencies)
  const unquotedMatches = content.matchAll(UNQUOTED_MODULE_PATTERN);
  for (const match of unquotedMatches) {
    // Skip keywords that might match the pattern
    if (SKIP_KEYWORDS.has(match[1])) {
      continue;
    }
    modules.push({
      apiPath: match[1],
      importVar: match[2],
    });
  }

  return modules;
}

function extractEndpointsFromApiDts(): Endpoint[] {
  const content = readFileSync(API_DTS_PATH, "utf8");
  const endpoints: Endpoint[] = [];

  const modules = extractModulesFromContent(content);

  console.log(`  Found ${modules.length} modules in api.d.ts`);

  // For each module, read the actual source file to find exported functions
  for (const module_ of modules) {
    const sourceFile = join(CONVEX_DIR, `${module_.apiPath}.ts`);
    if (!existsSync(sourceFile)) {
      continue;
    }

    const sourceContent = readFileSync(sourceFile, "utf8");

    // Find all exported const = query/mutation/action patterns
    const funcMatches = sourceContent.matchAll(FUNC_PATTERN);
    for (const funcMatch of funcMatches) {
      const name = funcMatch[1];
      const funcType = funcMatch[2];
      const isInternal = funcType.startsWith("internal");

      // Build API path: api.module.submodule.function
      const moduleParts = module_.apiPath.split("/");
      const apiPath = `api.${moduleParts.join(".")}.${name}`;

      endpoints.push({
        module: module_.apiPath,
        name,
        apiPath,
        isInternal,
        file: sourceFile,
        funcType,
      });
    }
  }

  return endpoints;
}

function grepApiReferencesInDir(dir: string): string[] {
  const fullDir = join(PROJECT_ROOT, dir);
  if (!existsSync(fullDir)) {
    return [];
  }

  console.log(`  Scanning ${dir}/...`);

  try {
    // Use grep with explicit excludes (faster than relying on gitignore)
    const result = execSync(
      String.raw`grep -rohE "(api|internal)\.[a-zA-Z_][a-zA-Z0-9_]+\.[a-zA-Z_][a-zA-Z0-9_]+(\.[a-zA-Z_][a-zA-Z0-9_]+)?" --include="*.ts" --include="*.tsx" ${dir} 2>/dev/null || true`,
      {
        cwd: PROJECT_ROOT,
        encoding: "utf8",
        maxBuffer: 50 * 1024 * 1024,
      },
    );
    return result.split("\n");
  } catch {
    // grep may fail if no matches
    return [];
  }
}

function deduplicateMatches(allMatches: string[]): { public: Set<string>; internal: Set<string> } {
  const publicUsages = new Set<string>();
  const internalUsages = new Set<string>();

  for (const line of allMatches) {
    const trimmed = line.trim();
    if (trimmed.startsWith("api.")) {
      publicUsages.add(trimmed);
    } else if (trimmed.startsWith("internal.")) {
      internalUsages.add(trimmed);
    }
  }

  return { public: publicUsages, internal: internalUsages };
}

/**
 * Find all api.xxx.xxx AND internal.xxx.xxx usages in the codebase in a single pass (FAST)
 */
function findAllApiUsages(): { public: Set<string>; internal: Set<string> } {
  console.log("  Scanning for API references...");

  // Directories to scan (skip node_modules, .git, etc.)
  const scanDirectories = ["apps", "packages"];
  const allMatches: string[] = [];

  for (const dir of scanDirectories) {
    allMatches.push(...grepApiReferencesInDir(dir));
  }

  console.log(`  Found ${allMatches.length} raw matches, deduplicating...`);

  return deduplicateMatches(allMatches);
}

type UnusedEndpoint = Endpoint & { reason: string; severity: "warning" | "info" };
type UsedEndpoint = Endpoint & { count: number };

// Modules/functions that are intentionally dev-only or testing utilities
const DEV_ONLY_MODULES = new Set(["testing/testing", "devAuth"]);

// Functions that are kept for future use or seeding (add here if needed)
const ALLOWED_UNUSED = new Set<string>();

function categorizeEndpoints(
  allEndpoints: Endpoint[],
  publicUsages: Set<string>,
  internalUsages: Set<string>,
): { unused: UnusedEndpoint[]; used: UsedEndpoint[] } {
  const unused: UnusedEndpoint[] = [];
  const used: UsedEndpoint[] = [];

  for (const endpoint of allEndpoints) {
    // For internal functions, check internal.xxx pattern
    // For public functions, check api.xxx pattern
    const internalPath = endpoint.apiPath.replace(API_PREFIX_PATTERN, "internal.");
    const isUsed = endpoint.isInternal
      ? internalUsages.has(internalPath)
      : publicUsages.has(endpoint.apiPath);

    if (isUsed) {
      used.push({ ...endpoint, count: 1 });
    } else {
      // Determine severity based on module/function type
      const isDevModule = DEV_ONLY_MODULES.has(endpoint.module);
      // eslint-disable-next-line sonarjs/no-empty-collection -- Set can be populated when needed
      const isAllowed = ALLOWED_UNUSED.has(endpoint.apiPath);
      const severity: "warning" | "info" = isDevModule || isAllowed ? "info" : "warning";

      unused.push({
        ...endpoint,
        severity,
        reason: endpoint.isInternal
          ? `Internal function not referenced via internal.${endpoint.module}.${endpoint.name}`
          : "No usages found",
      });
    }
  }

  return { unused, used };
}

function printUnusedReport(unused: UnusedEndpoint[], usedCount: number): number {
  // Group by file for ESLint-style output
  const byFile = new Map<string, UnusedEndpoint[]>();
  for (const ep of unused) {
    const relativePath = relative(PROJECT_ROOT, ep.file);
    const list = byFile.get(relativePath) ?? [];
    list.push(ep);
    byFile.set(relativePath, list);
  }

  const warnings = unused.filter((ep) => ep.severity === "warning");
  const infos = unused.filter((ep) => ep.severity === "info");

  for (const [file, endpoints] of byFile) {
    console.log(`\n${file}`);
    for (const ep of endpoints) {
      const tag = ep.isInternal ? "internal" : "public";
      console.log(`  ${ep.severity}  Unused ${tag} endpoint: ${ep.name} (${ep.funcType})`);
    }
  }

  console.log(
    `\n✖ ${unused.length} unused endpoints (${warnings.length} warnings, ${infos.length} info) — ${usedCount} used`,
  );

  // Return warning count (only warnings should fail the check)
  return warnings.length;
}

function printDebugInfo(publicUsages: Set<string>, internalUsages: Set<string>): void {
  console.log("\n[DEBUG] Public API paths found in codebase:");
  for (const p of [...publicUsages].sort()) {
    console.log(`  ${p}`);
  }
  console.log("\n[DEBUG] Internal API paths found in codebase:");
  for (const p of [...internalUsages].sort()) {
    console.log(`  ${p}`);
  }
}

function main() {
  console.log("🔍 Scanning Convex endpoints (using api.d.ts)...\n");

  const allEndpoints = extractEndpointsFromApiDts();
  console.log(`Found ${allEndpoints.length} exported endpoints`);
  console.log("\nFinding all API usages in codebase (one-pass scan)...");

  const { public: publicUsages, internal: internalUsages } = findAllApiUsages();
  console.log(
    `Found ${publicUsages.size} public (api.*) + ${internalUsages.size} internal references\n`,
  );

  const { unused, used } = categorizeEndpoints(allEndpoints, publicUsages, internalUsages);

  // Report - ESLint-style formatting
  let warningCount = 0;
  if (unused.length === 0) {
    console.log("✓ All Convex endpoints are used\n");
  } else {
    warningCount = printUnusedReport(unused, used.length);
  }

  // Show what's in the used set for debugging
  if (process.argv.includes("--verbose")) {
    printDebugInfo(publicUsages, internalUsages);
  }

  // Return exit code based on warnings only (info-level findings don't fail)
  process.exit(warningCount > 0 ? 1 : 0);
}

main();
