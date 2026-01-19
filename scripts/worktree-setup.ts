#!/usr/bin/env npx tsx
/**
 * Copies all .env.local files from the main repo to the current worktree.
 * Run this after creating a new worktree to set up environment files.
 */
import { execSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

// Get the main repo path (first entry in git worktree list)
function getMainRepoPath(): string {
  const output = execSync("git worktree list --porcelain", {
    encoding: "utf8",
  });
  const firstWorktree = output.split("\n")[0];
  return firstWorktree.replace("worktree ", "");
}

// Get current worktree path
function getCurrentWorktreePath(): string {
  return process.cwd();
}

// Known .env.local locations relative to repo root
const ENV_LOCAL_PATHS = [
  ".env.local",
  "apps/web/.env.local",
  "apps/storybook/.env.local",
  "packages/backend/.env.local",
  "packages/emails/.env.local",
];

function main() {
  const mainRepo = getMainRepoPath();
  const currentWorktree = getCurrentWorktreePath();

  if (mainRepo === currentWorktree) {
    console.log("Already in main repo, nothing to copy.");
    return;
  }

  console.log(`Main repo: ${mainRepo}`);
  console.log(`Current worktree: ${currentWorktree}`);
  console.log();

  let copied = 0;
  let skipped = 0;

  for (const envPath of ENV_LOCAL_PATHS) {
    const sourcePath = join(mainRepo, envPath);
    const destPath = join(currentWorktree, envPath);

    if (!existsSync(sourcePath)) {
      console.log(`⏭️  Skip: ${envPath} (not found in main repo)`);
      skipped++;
      continue;
    }

    if (existsSync(destPath)) {
      console.log(`⏭️  Skip: ${envPath} (already exists)`);
      skipped++;
      continue;
    }

    // Ensure destination directory exists
    const destDir = dirname(destPath);
    if (!existsSync(destDir)) {
      mkdirSync(destDir, { recursive: true });
    }

    copyFileSync(sourcePath, destPath);
    console.log(`✅ Copied: ${envPath}`);
    copied++;
  }

  console.log();
  console.log(`Done! Copied ${copied} files, skipped ${skipped}.`);
}

main();
