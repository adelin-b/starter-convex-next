#!/usr/bin/env tsx
/**
 * Ensures LiveKit model files are downloaded before starting the agent.
 * This script checks for the turn-detector model and downloads if missing.
 */

import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, "..");

// Check for model files in common cache locations
function findModelCache(): string | null {
  const possiblePaths = [
    // Bun's node_modules cache
    resolve(
      packageRoot,
      "../../node_modules/.bun/@huggingface+transformers@3.7.2/node_modules/@huggingface/transformers/.cache/livekit/turn-detector"
    ),
    // Standard huggingface cache
    resolve(
      packageRoot,
      "../../node_modules/@huggingface/transformers/.cache/livekit/turn-detector"
    ),
  ];

  for (const path of possiblePaths) {
    if (existsSync(path)) {
      return path;
    }
  }
  return null;
}

function checkModelFiles(): boolean {
  const cacheDir = findModelCache();
  if (!cacheDir) {
    return false;
  }

  // Check for the turn-detector tokenizer files (downloaded by livekit)
  const tokenizerFile = resolve(cacheDir, "v1.2.2-en/tokenizer.json");
  return existsSync(tokenizerFile);
}

async function main() {
  console.log("🔍 Checking for LiveKit model files...");

  if (checkModelFiles()) {
    console.log("✅ Model files found, starting agent...\n");
  } else {
    console.log("📥 Model files not found, downloading...\n");
    try {
      execSync("bun run download-files", {
        cwd: packageRoot,
        stdio: "inherit",
      });
      console.log("\n✅ Model files downloaded successfully!\n");
    } catch (error) {
      console.error("❌ Failed to download model files:", error);
      process.exit(1);
    }
  }

  // Now run the actual dev command
  execSync("tsx src/agent.ts dev", {
    cwd: packageRoot,
    stdio: "inherit",
  });
}

main().catch(console.error);
