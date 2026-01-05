#!/usr/bin/env bun
/**
 * Smart BDD Generator - Only updates specs that actually changed
 *
 * This wrapper around bddgen:
 * 1. Generates specs to a temp directory
 * 2. Compares each file with the existing spec
 * 3. Only copies files with actual content changes
 *
 * This prevents Playwright UI from re-running all tests when only one feature changed.
 */

import { execSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";

const TEMP_OUTPUT_DIR = "tests/features-gen-temp";
const FINAL_OUTPUT_DIR = "tests/features-gen";

function getAllFiles(dir: string, files: string[] = []): string[] {
  if (!existsSync(dir)) {
    return files;
  }

  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function ensureDir(dir: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function copyFile(src: string, destination: string) {
  ensureDir(dirname(destination));
  writeFileSync(destination, readFileSync(src));
}

function log(verbose: boolean, message: string) {
  if (verbose) {
    console.log(message);
  }
}

function createTemporaryConfig(configPath: string): string {
  const configContent = readFileSync(configPath, "utf8");
  const temporaryConfigPath = "playwright.config.bddgen-temp.ts";
  const modifiedConfig = configContent.replace(
    /outputDir:\s*["']tests\/features-gen["']/,
    `outputDir: "${TEMP_OUTPUT_DIR}"`,
  );
  writeFileSync(temporaryConfigPath, modifiedConfig);
  return temporaryConfigPath;
}

function runBddgen(temporaryConfigPath: string, bddgenArgs: string, verbose: boolean) {
  execSync(`npx bddgen -c ${temporaryConfigPath} ${bddgenArgs}`, {
    stdio: verbose ? "inherit" : "pipe",
  });
}

function processFile(
  temporaryFile: string,
  verbose: boolean,
): { action: "created" | "updated" | "skipped" } {
  const relativePath = relative(TEMP_OUTPUT_DIR, temporaryFile);
  const finalPath = join(FINAL_OUTPUT_DIR, relativePath);
  const temporaryContent = readFileSync(temporaryFile, "utf8");

  if (existsSync(finalPath)) {
    const existingContent = readFileSync(finalPath, "utf8");
    if (temporaryContent === existingContent) {
      log(verbose, `  ⏭️  ${relativePath} (unchanged)`);
      return { action: "skipped" };
    }
    log(verbose, `  📝 ${relativePath} (updated)`);
    copyFile(temporaryFile, finalPath);
    return { action: "updated" };
  }

  log(verbose, `  ✨ ${relativePath} (new)`);
  copyFile(temporaryFile, finalPath);
  return { action: "created" };
}

async function main() {
  const startTime = Date.now();
  const args = process.argv.slice(2);
  const verbose = args.includes("--verbose") || args.includes("-v");

  // Clean temp dir
  rmSync(TEMP_OUTPUT_DIR, { recursive: true, force: true });

  const bddgenArgs = args.filter((a) => a !== "--verbose" && a !== "-v").join(" ");

  log(verbose, "📦 Generating specs to temp directory...");

  // Ensure temp dir exists for bddgen
  mkdirSync(TEMP_OUTPUT_DIR, { recursive: true });

  const temporaryConfigPath = createTemporaryConfig("playwright.config.ts");

  try {
    runBddgen(temporaryConfigPath, bddgenArgs, verbose);
  } finally {
    rmSync(temporaryConfigPath, { force: true });
  }

  // Compare and copy only changed files
  const temporaryFiles = getAllFiles(TEMP_OUTPUT_DIR);
  let copied = 0;
  let skipped = 0;
  let created = 0;

  for (const temporaryFile of temporaryFiles) {
    const result = processFile(temporaryFile, verbose);
    if (result.action === "created") {
      created++;
    } else if (result.action === "updated") {
      copied++;
    } else {
      skipped++;
    }
  }

  // Clean up temp dir
  rmSync(TEMP_OUTPUT_DIR, { recursive: true, force: true });

  const elapsed = Date.now() - startTime;
  console.log(
    `✅ BDD specs: ${created} created, ${copied} updated, ${skipped} unchanged (${elapsed}ms)`,
  );
}

main().catch((error) => {
  console.error("❌ bddgen-smart failed:", error.message);
  process.exit(1);
});
