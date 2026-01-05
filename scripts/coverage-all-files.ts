import fs from "node:fs";
import path from "node:path";
import { glob } from "glob";

const ROOT = process.cwd();

// Source file patterns to include
const INCLUDE_PATTERNS = [
  "apps/web/src/**/*.{ts,tsx}",
  "packages/ui/src/**/*.{ts,tsx}",
  "packages/backend/convex/**/*.ts",
];

// Patterns to exclude
const EXCLUDE_PATTERNS = [
  "**/*.test.{ts,tsx}",
  "**/*.spec.{ts,tsx}",
  "**/*.stories.{ts,tsx}",
  "**/story-helpers.tsx",
  "**/*.d.ts",
];

type CoverageEntry = {
  path: string;
  statementMap: Record<string, unknown>;
  fnMap: Record<string, unknown>;
  branchMap: Record<string, unknown>;
  s: Record<string, number>;
  f: Record<string, number>;
  b: Record<string, number[]>;
};

function createEmptyCoverage(filePath: string): CoverageEntry {
  return {
    path: filePath,
    statementMap: {},
    fnMap: {},
    branchMap: {},
    s: {},
    f: {},
    b: {},
  };
}

async function main() {
  // Find all source files
  const allFiles: string[] = [];
  for (const pattern of INCLUDE_PATTERNS) {
    const files = await glob(pattern, {
      cwd: ROOT,
      ignore: EXCLUDE_PATTERNS,
      absolute: true,
    });
    allFiles.push(...files);
  }

  console.log(`Found ${allFiles.length} source files`);

  // Load existing coverage
  const nycOutputDir = path.join(ROOT, ".nyc_output");

  if (!fs.existsSync(nycOutputDir)) {
    fs.mkdirSync(nycOutputDir, { recursive: true });
  }

  // Read existing coverage files
  const coverageFiles = fs.readdirSync(nycOutputDir).filter((f) => f.endsWith(".json"));
  const existingCoverage: Record<string, CoverageEntry> = {};

  for (const file of coverageFiles) {
    const content = JSON.parse(fs.readFileSync(path.join(nycOutputDir, file)));
    for (const [key, value] of Object.entries(content)) {
      existingCoverage[key] = value as CoverageEntry;
    }
  }

  console.log(`Loaded ${Object.keys(existingCoverage).length} existing coverage entries`);

  // Add empty coverage for uncovered files
  const allFilesCoverage: Record<string, CoverageEntry> = { ...existingCoverage };
  let addedCount = 0;

  for (const file of allFiles) {
    if (!existingCoverage[file]) {
      allFilesCoverage[file] = createEmptyCoverage(file);
      addedCount += 1;
    }
  }

  console.log(`Added ${addedCount} uncovered files to coverage`);

  // Write combined coverage
  fs.writeFileSync(
    path.join(nycOutputDir, "all-files.json"),
    JSON.stringify(allFilesCoverage, null, 2),
  );

  // Remove individual files and keep only all-files.json
  for (const file of coverageFiles) {
    fs.unlinkSync(path.join(nycOutputDir, file));
  }

  console.log("Coverage file written. Run: nyc report");
}

main().catch(console.error);
