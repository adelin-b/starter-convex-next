#!/usr/bin/env npx tsx
/**
 * Find @deprecated exports and their usages.
 *
 * Detects:
 * - Functions/types marked with @deprecated JSDoc
 * - Usages of those deprecated exports in the codebase
 *
 * Usage: npx tsx scripts/find-deprecated-usage.ts
 */

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT_ROOT = process.cwd();

// Top-level regex patterns (biome: useTopLevelRegex)
const SKIP_DIRS_PATTERN = /node_modules|\.next|dist|_generated/;
const GREP_LINE_PATTERN = /^([^:]+):(\d+):(.+)$/;
const DEPRECATED_MSG_PATTERN = /@deprecated\s*(.*)$/;
const EXPORT_PATTERN = /export\s+(?:const|function|class|type|interface)\s+(\w+)/;
const IMPORT_PATTERN = /import\s*{[^}]*}\s*from/;

// Known deprecated items that are actively being migrated (don't fail check)
// Remove from this list once migration is complete
const MIGRATION_IN_PROGRESS = new Set<string>([
  // Add deprecated items here that are being actively migrated
]);

type DeprecatedItem = {
  file: string;
  line: number;
  name: string;
  message: string;
};

function grepDeprecatedInDir(dir: string): string[] {
  try {
    const result = execSync(
      `grep -rn "@deprecated" --include="*.ts" --include="*.tsx" ${dir} 2>/dev/null || true`,
      {
        cwd: PROJECT_ROOT,
        encoding: "utf8",
        maxBuffer: 10 * 1024 * 1024,
      },
    );
    return result.split("\n");
  } catch {
    return [];
  }
}

function extractExportName(
  file: string,
  lineNumber: number,
): { name: string; exportLine: number } | null {
  try {
    const fileContent = readFileSync(join(PROJECT_ROOT, file), "utf8");
    const lines = fileContent.split("\n");

    // Look for export in the next 5 lines
    for (let i = lineNumber; i < Math.min(lineNumber + 5, lines.length); i += 1) {
      const exportLine = lines[i];
      const exportMatch = exportLine?.match(EXPORT_PATTERN);
      if (exportMatch) {
        return { name: exportMatch[1], exportLine: i + 1 };
      }
    }
  } catch {
    // File read failed
  }
  return null;
}

function parseDeprecatedLine(line: string): DeprecatedItem | null {
  if (!line.trim() || SKIP_DIRS_PATTERN.test(line)) {
    return null;
  }

  const match = line.match(GREP_LINE_PATTERN);
  if (!match) {
    return null;
  }

  const [, file, lineNum, content] = match;
  const lineNumber = Number.parseInt(lineNum, 10);

  // Extract deprecation message
  const msgMatch = content.match(DEPRECATED_MSG_PATTERN);
  const message = msgMatch?.[1]?.trim() || "No message";

  const exportInfo = extractExportName(file, lineNumber);
  if (!exportInfo) {
    return null;
  }

  return {
    file,
    line: exportInfo.exportLine,
    name: exportInfo.name,
    message,
  };
}

function findDeprecatedExports(): DeprecatedItem[] {
  const deprecated: DeprecatedItem[] = [];
  const scanDirectories = ["apps", "packages"];

  for (const dir of scanDirectories) {
    const lines = grepDeprecatedInDir(dir);
    for (const line of lines) {
      const item = parseDeprecatedLine(line);
      if (item) {
        deprecated.push(item);
      }
    }
  }

  return deprecated;
}

function findUsages(
  exportName: string,
  sourceFile: string,
): Array<{ file: string; line: number; context: string }> {
  const usages: Array<{ file: string; line: number; context: string }> = [];

  try {
    // Search for usage of the export name
    const result = execSync(
      String.raw`grep -rn "\b${exportName}\b" --include="*.ts" --include="*.tsx" apps packages 2>/dev/null || true`,
      {
        cwd: PROJECT_ROOT,
        encoding: "utf8",
        maxBuffer: 10 * 1024 * 1024,
      },
    );

    for (const line of result.split("\n")) {
      if (!line.trim()) {
        continue;
      }
      if (SKIP_DIRS_PATTERN.test(line)) {
        continue;
      }

      const match = line.match(GREP_LINE_PATTERN);
      if (!match) {
        continue;
      }

      const [, file, lineNum, context] = match;

      // Skip the definition itself
      if (file === sourceFile) {
        continue;
      }

      // Skip imports (we want actual usage)
      if (IMPORT_PATTERN.test(context) && !context.includes("(")) {
        continue;
      }

      usages.push({
        file,
        line: Number.parseInt(lineNum, 10),
        context: context.trim().slice(0, 80),
      });
    }
  } catch {
    // grep failed
  }

  return usages;
}

function main() {
  console.log("🔍 Finding @deprecated exports and their usages...\n");

  const deprecated = findDeprecatedExports();

  if (deprecated.length === 0) {
    console.log("✓ No @deprecated exports found\n");
    process.exit(0);
  }

  console.log(`Found ${deprecated.length} @deprecated exports:\n`);

  let totalUsages = 0;

  for (const item of deprecated) {
    const usages = findUsages(item.name, item.file);
    totalUsages += usages.length;

    console.log(`${item.file}:${item.line}`);
    console.log(`  @deprecated ${item.name}: ${item.message}`);

    if (usages.length > 0) {
      console.log(`  ⚠️  ${usages.length} usage(s) found:`);
      for (const usage of usages.slice(0, 5)) {
        console.log(`     ${usage.file}:${usage.line}`);
      }
      if (usages.length > 5) {
        console.log(`     ... and ${usages.length - 5} more`);
      }
    } else {
      console.log("  ✓ No usages found - safe to remove");
    }
    console.log();
  }

  console.log("─".repeat(60));
  console.log(`Summary: ${deprecated.length} deprecated exports, ${totalUsages} total usages`);

  // Count usages excluding items in migration
  const blockingUsages = deprecated
    .filter((item) => !MIGRATION_IN_PROGRESS.has(item.name))
    .reduce((sum, item) => sum + findUsages(item.name, item.file).length, 0);

  if (blockingUsages > 0) {
    console.log("\n⚠️  Deprecated code is still being used. Consider migrating.");
    process.exit(1);
  }

  if (totalUsages > 0) {
    console.log("\nℹ️  Some deprecated code has known migration in progress.");
  }

  console.log("✓ No blocking deprecated usages found");
  process.exit(0);
}

main();
