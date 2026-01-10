#!/usr/bin/env npx tsx
/**
 * Find and optionally clean stale git worktrees.
 *
 * Detects:
 * - Worktrees for branches that have been deleted on remote
 * - Worktrees for branches that have been merged
 * - Orphaned worktree directories
 *
 * Usage:
 *   npx tsx scripts/cleanup-worktrees.ts        # List stale worktrees
 *   npx tsx scripts/cleanup-worktrees.ts --dry  # Same as above
 *   npx tsx scripts/cleanup-worktrees.ts --clean # Actually remove them
 */

import { execSync } from "node:child_process";

const PROJECT_ROOT = process.cwd();
const DRY_RUN = !process.argv.includes("--clean");

type WorktreeStatus = "active" | "gone" | "merged" | "orphan";

type WorktreeInfo = {
  path: string;
  branch: string;
  commit: string;
  status: WorktreeStatus;
  reason?: string;
};

function getStatusIcon(status: WorktreeStatus): string {
  if (status === "gone") {
    return "🗑️";
  }
  if (status === "merged") {
    return "✅";
  }
  return "❓";
}

function parseWorktreeLine(line: string, current: Partial<WorktreeInfo>): Partial<WorktreeInfo> {
  if (line.startsWith("worktree ")) {
    return { ...current, path: line.slice(9) };
  }
  if (line.startsWith("HEAD ")) {
    return { ...current, commit: line.slice(5, 12) };
  }
  if (line.startsWith("branch ")) {
    return { ...current, branch: line.slice(7).replace("refs/heads/", "") };
  }
  if (line === "detached") {
    return { ...current, branch: "DETACHED" };
  }
  return current;
}

function getWorktrees(): WorktreeInfo[] {
  const worktrees: WorktreeInfo[] = [];

  try {
    const result = execSync("git worktree list --porcelain", {
      cwd: PROJECT_ROOT,
      encoding: "utf8",
    });

    let current: Partial<WorktreeInfo> = {};

    for (const line of result.split("\n")) {
      if (line === "") {
        if (current.path && current.path !== PROJECT_ROOT) {
          worktrees.push({
            path: current.path,
            branch: current.branch || "unknown",
            commit: current.commit || "unknown",
            status: "active",
          });
        }
        current = {};
      } else {
        current = parseWorktreeLine(line, current);
      }
    }
  } catch (error) {
    console.error("Failed to list worktrees:", error);
  }

  return worktrees;
}

function isBranchGone(branch: string): boolean {
  try {
    const remoteCheck = execSync(
      String.raw`git branch -vv 2>/dev/null | grep "\[.*${branch}.*\]" || true`,
      { cwd: PROJECT_ROOT, encoding: "utf8" },
    );
    return remoteCheck.includes(": gone]");
  } catch {
    return false;
  }
}

function isMergedInto(commit: string, target: string): boolean {
  try {
    execSync(`git merge-base --is-ancestor ${commit} origin/${target} 2>/dev/null`, {
      cwd: PROJECT_ROOT,
    });
    return true;
  } catch {
    return false;
  }
}

function fetchRemote(): void {
  try {
    execSync("git fetch --prune 2>/dev/null", {
      cwd: PROJECT_ROOT,
      encoding: "utf8",
    });
  } catch {
    // Ignore fetch errors
  }
}

function checkBranchStatus(worktree: WorktreeInfo): WorktreeInfo {
  if (worktree.branch === "DETACHED" || worktree.branch === "unknown") {
    return { ...worktree, status: "orphan", reason: "Detached HEAD or unknown branch" };
  }

  fetchRemote();

  if (isBranchGone(worktree.branch)) {
    return { ...worktree, status: "gone", reason: "Remote branch deleted" };
  }

  if (isMergedInto(worktree.commit, "develop")) {
    return { ...worktree, status: "merged", reason: "Branch merged into develop" };
  }

  if (isMergedInto(worktree.commit, "main")) {
    return { ...worktree, status: "merged", reason: "Branch merged into main" };
  }

  return worktree;
}

function removeWorktree(worktree: WorktreeInfo): boolean {
  try {
    console.log(`  Removing worktree: ${worktree.path}`);
    execSync(`git worktree remove --force "${worktree.path}"`, {
      cwd: PROJECT_ROOT,
      encoding: "utf8",
    });

    // Also delete the branch if it's gone from remote
    if (worktree.status === "gone" && worktree.branch !== "DETACHED") {
      try {
        execSync(`git branch -D "${worktree.branch}" 2>/dev/null`, {
          cwd: PROJECT_ROOT,
        });
        console.log(`  Deleted branch: ${worktree.branch}`);
      } catch {
        // Branch might not exist locally
      }
    }

    return true;
  } catch (error) {
    console.error(`  Failed to remove: ${error}`);
    return false;
  }
}

function main() {
  console.log("🔍 Checking git worktrees...\n");

  const worktrees = getWorktrees();

  if (worktrees.length === 0) {
    console.log("✓ No additional worktrees found\n");
    process.exit(0);
  }

  console.log(`Found ${worktrees.length} worktree(s), checking status...\n`);

  // Check status of each worktree
  const checked = worktrees.map((wt) => checkBranchStatus(wt));

  // Group by status
  const stale = checked.filter(
    (w) => w.status === "gone" || w.status === "merged" || w.status === "orphan",
  );
  const active = checked.filter((w) => w.status === "active");

  // Display results
  if (active.length > 0) {
    console.log("✓ Active worktrees:");
    for (const w of active) {
      console.log(`   ${w.branch} → ${w.path}`);
    }
    console.log();
  }

  if (stale.length === 0) {
    console.log("✓ No stale worktrees found\n");
    process.exit(0);
  }

  console.log(`⚠️  ${stale.length} stale worktree(s):\n`);
  for (const w of stale) {
    const icon = getStatusIcon(w.status);
    console.log(`${icon} ${w.branch} (${w.status})`);
    console.log(`   Path: ${w.path}`);
    console.log(`   Reason: ${w.reason}`);
    console.log();
  }

  if (DRY_RUN) {
    console.log("─".repeat(60));
    console.log("Dry run mode. To remove stale worktrees, run:");
    console.log("  npx tsx scripts/cleanup-worktrees.ts --clean\n");
    process.exit(0);
  }

  // Actually clean up
  console.log("Cleaning up stale worktrees...\n");
  let removed = 0;
  for (const w of stale) {
    if (removeWorktree(w)) {
      removed += 1;
    }
  }

  console.log(`\n✓ Removed ${removed}/${stale.length} stale worktrees`);
  process.exit(removed === stale.length ? 0 : 1);
}

main();
