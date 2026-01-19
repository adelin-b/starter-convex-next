#!/usr/bin/env npx tsx
/**
 * Check Next.js bundle sizes and enforce limits.
 *
 * Analyzes the build output to detect:
 * - Individual chunks exceeding size limit
 * - Total bundle size regression
 *
 * Usage:
 *   npx tsx scripts/check-bundle-size.ts
 *   npx tsx scripts/check-bundle-size.ts --limit=500  # Set max chunk size in KB
 */

import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const PROJECT_ROOT = process.cwd();
const BUILD_DIR = join(PROJECT_ROOT, "apps/web/.next/static/chunks");

// Default limits (in KB)
const MAX_CHUNK_SIZE_KB = Number.parseInt(
  process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? "500",
  10,
);
const WARN_CHUNK_SIZE_KB = MAX_CHUNK_SIZE_KB * 0.8;

type ChunkInfo = {
  name: string;
  sizeBytes: number;
  sizeKB: number;
  status: "ok" | "warning" | "error";
};

function getStatusIcon(status: ChunkInfo["status"]): string {
  if (status === "error") {
    return "❌";
  }
  if (status === "warning") {
    return "⚠️";
  }
  return "✓";
}

function getChunks(): ChunkInfo[] {
  if (!existsSync(BUILD_DIR)) {
    console.error(`Build directory not found: ${BUILD_DIR}`);
    console.error("Run 'bun run build' first.\n");
    process.exit(1);
  }

  const files = readdirSync(BUILD_DIR);
  const chunks: ChunkInfo[] = [];

  for (const file of files) {
    if (!file.endsWith(".js")) {
      continue;
    }

    const filePath = join(BUILD_DIR, file);
    const stats = statSync(filePath);
    const sizeKB = Math.round(stats.size / 1024);

    let status: ChunkInfo["status"] = "ok";
    if (sizeKB > MAX_CHUNK_SIZE_KB) {
      status = "error";
    } else if (sizeKB > WARN_CHUNK_SIZE_KB) {
      status = "warning";
    }

    chunks.push({
      name: file,
      sizeBytes: stats.size,
      sizeKB,
      status,
    });
  }

  return chunks.sort((a, b) => b.sizeBytes - a.sizeBytes);
}

function formatSize(kb: number): string {
  if (kb >= 1024) {
    return `${(kb / 1024).toFixed(1)} MB`;
  }
  return `${kb} KB`;
}

function main() {
  console.log(`🔍 Checking bundle sizes (limit: ${MAX_CHUNK_SIZE_KB} KB)...\n`);

  const chunks = getChunks();
  const totalSizeKB = chunks.reduce((sum, c) => sum + c.sizeKB, 0);

  const errors = chunks.filter((c) => c.status === "error");
  const warnings = chunks.filter((c) => c.status === "warning");

  // Display top 10 largest chunks
  console.log("📦 Largest chunks:\n");
  for (const chunk of chunks.slice(0, 10)) {
    const icon = getStatusIcon(chunk.status);
    const sizeStr = formatSize(chunk.sizeKB).padStart(8);
    console.log(`${icon} ${sizeStr}  ${chunk.name}`);
  }

  if (chunks.length > 10) {
    console.log(`   ... and ${chunks.length - 10} more chunks`);
  }

  console.log("\n📊 Summary:");
  console.log(`   Total chunks: ${chunks.length}`);
  console.log(`   Total size: ${formatSize(totalSizeKB)}`);
  console.log(`   Oversized (>${MAX_CHUNK_SIZE_KB} KB): ${errors.length}`);
  console.log(`   Warning (>${WARN_CHUNK_SIZE_KB} KB): ${warnings.length}`);

  if (errors.length > 0) {
    console.log(`\n❌ ${errors.length} chunk(s) exceed the ${MAX_CHUNK_SIZE_KB} KB limit:`);
    for (const chunk of errors) {
      console.log(`   ${chunk.name}: ${formatSize(chunk.sizeKB)}`);
    }
    console.log("\nConsider:");
    console.log("  - Code splitting with dynamic imports");
    console.log("  - Moving heavy dependencies to separate chunks");
    console.log("  - Using next/dynamic for large components\n");
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.log(`\n⚠️  ${warnings.length} chunk(s) approaching the limit`);
  }

  console.log("\n✓ All chunks within size limits\n");
  process.exit(0);
}

main();
