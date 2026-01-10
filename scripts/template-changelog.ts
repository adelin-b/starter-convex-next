#!/usr/bin/env bun
/**
 * Template Changelog Generator
 *
 * Generates an LLM-friendly changelog of template changes since a given commit/tag.
 * Users can use this to see what changed in the template and update their projects.
 *
 * Usage:
 *   bun run scripts/template-changelog.ts --since <commit|tag>
 *   bun run scripts/template-changelog.ts --since v1.0.0
 *   bun run scripts/template-changelog.ts --since abc123 --format json
 *
 * Output formats:
 *   - markdown (default): Human-readable with LLM-friendly structure
 *   - json: Machine-parseable for automation
 */

import { execSync } from "node:child_process";
import { basename, extname } from "node:path";

// Top-level regex for conventional commit parsing (biome performance rule)
const CONVENTIONAL_COMMIT_REGEX = /^(\w+)(?:\(([^)]+)\))?!?:\s*(.+)$/;

type FileChange = {
  path: string;
  status: "added" | "modified" | "deleted" | "renamed";
  oldPath?: string;
  category: string;
  diff?: string;
  summary?: string;
};

type Commit = {
  hash: string;
  shortHash: string;
  subject: string;
  body: string;
  author: string;
  date: string;
  type: string;
  scope?: string;
};

type ChangelogOutput = {
  meta: {
    templateRepo: string;
    sinceRef: string;
    toRef: string;
    generatedAt: string;
    totalCommits: number;
    totalFilesChanged: number;
  };
  summary: {
    breaking: string[];
    features: string[];
    fixes: string[];
    chores: string[];
    other: string[];
  };
  filesByCategory: Record<string, FileChange[]>;
  commits: Commit[];
  migrationGuide: string;
};

function exec(command: string): string {
  try {
    return execSync(command, { encoding: "utf8", maxBuffer: 50 * 1024 * 1024 }).trim();
  } catch {
    return "";
  }
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: CLI arg parsing with multiple flags
function parseArgs(): { since: string; format: "markdown" | "json"; includeDiff: boolean } {
  const args = process.argv.slice(2);
  let since = "";
  let format: "markdown" | "json" = "markdown";
  let includeDiff = false;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--since" && args[i + 1]) {
      since = args[i + 1];
      i += 1; // eslint-disable-line sonarjs/updated-loop-counter
    } else if (arg === "--format" && args[i + 1]) {
      format = args[i + 1] === "json" ? "json" : "markdown";
      i += 1; // eslint-disable-line sonarjs/updated-loop-counter
    } else if (arg === "--include-diff") {
      includeDiff = true;
    } else if (arg === "--help" || arg === "-h") {
      console.log(`
Template Changelog Generator

Usage:
  bun run scripts/template-changelog.ts --since <commit|tag> [options]

Options:
  --since <ref>      Starting commit/tag to compare from (required)
  --format <type>    Output format: markdown (default) or json
  --include-diff     Include file diffs in output (verbose)
  --help, -h         Show this help message

Examples:
  bun run scripts/template-changelog.ts --since v1.0.0
  bun run scripts/template-changelog.ts --since abc123 --format json
  bun run scripts/template-changelog.ts --since HEAD~10 --include-diff
`);
      process.exit(0);
    }
  }

  if (!since) {
    console.error("Error: --since <ref> is required");
    console.error("Run with --help for usage information");
    process.exit(1);
  }

  return { since, format, includeDiff };
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: simple path-to-category mapping
function categorizeFile(path: string): string {
  if (path.startsWith("apps/web/")) {
    return "frontend";
  }
  if (path.startsWith("apps/e2e/")) {
    return "e2e-tests";
  }
  if (path.startsWith("apps/storybook/")) {
    return "storybook";
  }
  if (path.startsWith("packages/backend/")) {
    return "backend";
  }
  if (path.startsWith("packages/ui/")) {
    return "ui-components";
  }
  if (path.startsWith("packages/shared/")) {
    return "shared-utils";
  }
  if (path.startsWith("packages/emails/")) {
    return "emails";
  }
  if (path.startsWith(".claude/") || path.startsWith(".rulesync/")) {
    return "claude-config";
  }
  if (path.startsWith(".github/")) {
    return "ci-cd";
  }
  if (path.startsWith("scripts/")) {
    return "scripts";
  }
  if (basename(path).startsWith(".") || path.includes("config")) {
    return "config";
  }
  if (extname(path) === ".md") {
    return "documentation";
  }
  if (path === "package.json" || path === "bun.lockb" || path.includes("package.json")) {
    return "dependencies";
  }
  return "other";
}

function parseConventionalCommit(subject: string): {
  type: string;
  scope?: string;
  message: string;
} {
  const match = subject.match(CONVENTIONAL_COMMIT_REGEX);
  if (match) {
    return {
      type: match[1],
      scope: match[2],
      message: match[3],
    };
  }
  return { type: "other", message: subject };
}

function getCommits(since: string): Commit[] {
  // Use null byte as record separator, newline as field separator within record
  const format = "%H%n%h%n%s%n%an%n%aI%x00";
  const log = exec(`git log ${since}..HEAD --format="${format}" --no-merges`);
  if (!log) {
    return [];
  }

  return log
    .split("\u0000")
    .filter((record) => record.trim())
    .map((record) => {
      const lines = record.trim().split("\n");
      const [hash, shortHash, subject, author, date] = lines;
      if (!(hash && subject)) {
        return null;
      }
      const parsed = parseConventionalCommit(subject);
      return {
        hash,
        shortHash,
        subject,
        body: "", // Skip body to avoid parsing issues
        author,
        date,
        type: parsed.type,
        scope: parsed.scope,
      };
    })
    .filter((c): c is Commit => c !== null);
}

function getFileChanges(since: string, includeDiff: boolean): FileChange[] {
  const diffNameStatus = exec(`git diff --name-status ${since}..HEAD`);
  if (!diffNameStatus) {
    return [];
  }

  const changes: FileChange[] = [];

  for (const line of diffNameStatus.split("\n").filter(Boolean)) {
    const parts = line.split("\t");
    const statusCode = parts[0];

    let status: FileChange["status"];
    let path: string;
    let oldPath: string | undefined;

    if (statusCode.startsWith("R")) {
      status = "renamed";
      oldPath = parts[1];
      path = parts[2];
    } else {
      path = parts[1];
      switch (statusCode) {
        case "A": {
          status = "added";
          break;
        }
        case "D": {
          status = "deleted";
          break;
        }
        case "M": {
          status = "modified";
          break;
        }
        default: {
          status = "modified";
        }
      }
    }

    const category = categorizeFile(path);
    let diff: string | undefined;

    if (includeDiff && status !== "deleted") {
      diff = exec(`git diff ${since}..HEAD -- "${path}" 2>/dev/null`);
    }

    changes.push({
      path,
      status,
      oldPath,
      category,
      diff,
    });
  }

  return changes;
}

function groupByCategory(changes: FileChange[]): Record<string, FileChange[]> {
  const grouped: Record<string, FileChange[]> = {};

  for (const change of changes) {
    if (!grouped[change.category]) {
      grouped[change.category] = [];
    }
    grouped[change.category].push(change);
  }

  return grouped;
}

function categorizeCommits(commits: Commit[]): ChangelogOutput["summary"] {
  const summary: ChangelogOutput["summary"] = {
    breaking: [],
    features: [],
    fixes: [],
    chores: [],
    other: [],
  };

  for (const commit of commits) {
    const desc = commit.scope ? `**${commit.scope}**: ${commit.subject}` : commit.subject;

    if (commit.subject.includes("!:") || commit.body.includes("BREAKING CHANGE")) {
      summary.breaking.push(desc);
    } else if (commit.type === "feat") {
      summary.features.push(desc);
    } else if (commit.type === "fix") {
      summary.fixes.push(desc);
    } else if (
      ["chore", "ci", "build", "docs", "style", "refactor", "test"].includes(commit.type)
    ) {
      summary.chores.push(desc);
    } else {
      summary.other.push(desc);
    }
  }

  return summary;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: multiple conditional sections for migration guide
function generateMigrationGuide(changes: FileChange[], commits: Commit[]): string {
  const lines: string[] = [];

  // Check for breaking changes
  const hasBreaking = commits.some(
    (c) => c.subject.includes("!:") || c.body.includes("BREAKING CHANGE"),
  );
  if (hasBreaking) {
    lines.push(
      "## ⚠️ Breaking Changes Detected",
      "",
      "Review the breaking changes section above carefully before updating.",
      "",
    );
  }

  // Dependency updates
  const depChanges = changes.filter(
    (c) => c.path.includes("package.json") && c.status !== "deleted",
  );
  if (depChanges.length > 0) {
    lines.push(
      "## Dependencies",
      "",
      "Run `bun install` after pulling template changes to update dependencies.",
      "",
    );
  }

  // Schema changes
  const schemaChanges = changes.filter(
    (c) => c.path.includes("schema.ts") || c.path.includes("schema/"),
  );
  if (schemaChanges.length > 0) {
    lines.push(
      "## Database Schema",
      "",
      "Schema files were modified. Review changes and run migrations:",
      "```bash",
      "bun run dev:server  # Convex will auto-deploy schema changes",
      "```",
      "",
    );
  }

  // Config changes
  const configChanges = changes.filter((c) => c.category === "config");
  if (configChanges.length > 0) {
    lines.push(
      "## Configuration",
      "",
      "Configuration files were updated. Compare with your local config:",
      ...configChanges.slice(0, 5).map((c) => `- \`${c.path}\` (${c.status})`),
      ...(configChanges.length > 5 ? [`- ... and ${configChanges.length - 5} more`] : []),
      "",
    );
  }

  // New files to add
  const newFiles = changes.filter((c) => c.status === "added");
  if (newFiles.length > 0) {
    lines.push(
      "## New Files",
      "",
      "These files were added to the template. Consider adding them to your project:",
      ...newFiles.slice(0, 10).map((c) => `- \`${c.path}\``),
      ...(newFiles.length > 10 ? [`- ... and ${newFiles.length - 10} more`] : []),
      "",
    );
  }

  // Deleted files
  const deletedFiles = changes.filter((c) => c.status === "deleted");
  if (deletedFiles.length > 0) {
    lines.push(
      "## Removed Files",
      "",
      "These files were removed from the template. Consider removing from your project:",
      ...deletedFiles.slice(0, 10).map((c) => `- \`${c.path}\``),
      ...(deletedFiles.length > 10 ? [`- ... and ${deletedFiles.length - 10} more`] : []),
      "",
    );
  }

  return lines.join("\n");
}

function getStatusIcon(status: FileChange["status"]): string {
  switch (status) {
    case "added": {
      return "+";
    }
    case "deleted": {
      return "-";
    }
    case "renamed": {
      return "→";
    }
    case "modified": {
      return "~";
    }
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: markdown generation with multiple sections
function formatMarkdown(output: ChangelogOutput): string {
  const lines: string[] = [
    "# Template Changelog",
    "",
    "## Overview",
    "",
    `- **Since**: \`${output.meta.sinceRef}\``,
    `- **To**: \`${output.meta.toRef}\``,
    `- **Generated**: ${output.meta.generatedAt}`,
    `- **Commits**: ${output.meta.totalCommits}`,
    `- **Files Changed**: ${output.meta.totalFilesChanged}`,
    "",
  ];

  // Summary by type
  if (output.summary.breaking.length > 0) {
    lines.push(
      "## ⚠️ Breaking Changes",
      "",
      ...output.summary.breaking.map((item) => `- ${item}`),
      "",
    );
  }

  if (output.summary.features.length > 0) {
    lines.push("## ✨ Features", "", ...output.summary.features.map((item) => `- ${item}`), "");
  }

  if (output.summary.fixes.length > 0) {
    lines.push("## 🐛 Bug Fixes", "", ...output.summary.fixes.map((item) => `- ${item}`), "");
  }

  if (output.summary.chores.length > 0) {
    lines.push("## 🔧 Maintenance", "", ...output.summary.chores.map((item) => `- ${item}`), "");
  }

  // Files by category
  lines.push("## Files Changed by Category", "");

  const categoryOrder = [
    "backend",
    "frontend",
    "ui-components",
    "shared-utils",
    "dependencies",
    "config",
    "e2e-tests",
    "scripts",
    "claude-config",
    "documentation",
    "other",
  ];

  for (const category of categoryOrder) {
    const files = output.filesByCategory[category];
    if (!files || files.length === 0) {
      continue;
    }

    const categoryTitle = category
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    lines.push(
      `### ${categoryTitle}`,
      "",
      ...files.map((file) => {
        const statusIcon = getStatusIcon(file.status);
        const oldPathInfo = file.oldPath ? ` (from \`${file.oldPath}\`)` : "";
        return `- \`${statusIcon}\` \`${file.path}\`${oldPathInfo}`;
      }),
      "",
    );
  }

  // Migration guide + LLM instruction section
  lines.push(
    "---",
    "",
    "# Migration Guide",
    "",
    output.migrationGuide,
    "---",
    "",
    "# Instructions for LLM",
    "",
    "When updating a project based on this template:",
    "",
    "1. **Review breaking changes first** - These require manual attention",
    "2. **Update dependencies** - Run `bun install` after merging package.json changes",
    "3. **Apply file changes category by category** - Start with backend, then frontend",
    "4. **Test after each major category** - Run `bun run check` and `bun run test`",
    "5. **Skip project-specific files** - Don't overwrite customized configs",
    "",
    "Files to typically preserve (user customizations):",
    "- `.env*` files",
    "- `CLAUDE.md` project-specific instructions",
    "- Custom features in `apps/web/src/features/`",
    "- Project-specific schema extensions",
    "",
  );

  return lines.join("\n");
}

function main() {
  const { since, format, includeDiff } = parseArgs();

  // Verify the ref exists
  const refCheck = exec(`git rev-parse --verify ${since} 2>/dev/null`);
  if (!refCheck) {
    console.error(`Error: Reference '${since}' not found`);
    console.error("Make sure the commit hash or tag exists in this repository");
    process.exit(1);
  }

  const commits = getCommits(since);
  const fileChanges = getFileChanges(since, includeDiff);
  const filesByCategory = groupByCategory(fileChanges);
  const summary = categorizeCommits(commits);
  const migrationGuide = generateMigrationGuide(fileChanges, commits);

  const output: ChangelogOutput = {
    meta: {
      templateRepo: exec("git remote get-url origin 2>/dev/null") || "unknown",
      sinceRef: since,
      toRef: exec("git rev-parse --short HEAD"),
      generatedAt: new Date().toISOString(),
      totalCommits: commits.length,
      totalFilesChanged: fileChanges.length,
    },
    summary,
    filesByCategory,
    commits,
    migrationGuide,
  };

  if (format === "json") {
    console.log(JSON.stringify(output, null, 2));
  } else {
    console.log(formatMarkdown(output));
  }
}

try {
  main();
} catch (error) {
  console.error("Fatal error:", error);
  process.exit(1);
}
