#!/usr/bin/env bun
/**
 * Lint Claude Skills - Validates YAML frontmatter in SKILL.md files
 *
 * Checks:
 * - Opening `---` on line 1
 * - Closing `---` before Markdown content
 * - Valid YAML syntax (no tabs, correct indentation)
 */

import { readFileSync } from "node:fs";
import { relative } from "node:path";
import { glob } from "glob";
import yaml from "js-yaml";

type LintError = {
  file: string;
  line?: number;
  message: string;
};

type LintResult = {
  file: string;
  errors: LintError[];
  warnings: LintError[];
};

// Top-level regex for extracting line numbers from YAML error messages
const YAML_LINE_REGEX = /line (\d+)/i;

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: validation function with multiple checks
function lintSkillFile(filePath: string): LintResult {
  const errors: LintError[] = [];
  const warnings: LintError[] = [];
  const relativePath = relative(process.cwd(), filePath);

  try {
    const content = readFileSync(filePath, "utf8");
    const lines = content.split("\n");

    // Check 1: Opening --- on line 1
    if (lines.length === 0 || lines[0]?.trim() !== "---") {
      errors.push({
        file: relativePath,
        line: 1,
        message: "Missing opening `---` on line 1",
      });
      return { file: relativePath, errors, warnings };
    }

    // Check 2: Find closing ---
    let closingDashIndex = -1;
    for (let index = 1; index < lines.length; index++) {
      if (lines[index]?.trim() === "---") {
        closingDashIndex = index;
        break;
      }
    }

    if (closingDashIndex === -1) {
      errors.push({
        file: relativePath,
        message: "Missing closing `---` before Markdown content",
      });
      return { file: relativePath, errors, warnings };
    }

    // Extract frontmatter
    const frontmatterLines = lines.slice(1, closingDashIndex);
    const frontmatterText = frontmatterLines.join("\n");

    // Check 3: No tabs in frontmatter
    for (const [index, frontmatterLine] of frontmatterLines.entries()) {
      if (frontmatterLine?.includes("\t")) {
        errors.push({
          file: relativePath,
          line: index + 2, // +2 because line 1 is opening ---, and arrays are 0-indexed
          message: "Tabs are not allowed in YAML frontmatter (use spaces)",
        });
      }
    }

    // Check 4: Validate YAML syntax
    try {
      yaml.load(frontmatterText, { strict: true });
    } catch (yamlError) {
      const error = yamlError as Error;
      // Try to extract line number from error message
      const lineMatch = error.message.match(YAML_LINE_REGEX);
      const yamlLine = lineMatch ? Number.parseInt(lineMatch[1], 10) + 1 : undefined; // +1 because line 1 is opening ---

      errors.push({
        file: relativePath,
        line: yamlLine,
        message: `Invalid YAML syntax: ${error.message}`,
      });
    }

    // Check 5: Validate YAML structure (optional - check for common required fields)
    try {
      const parsed = yaml.load(frontmatterText) as Record<string, unknown>;
      if (!parsed || typeof parsed !== "object") {
        warnings.push({
          file: relativePath,
          message: "Frontmatter should be a YAML object",
        });
      }
    } catch {
      // Already caught in Check 4
    }

    // Check 6: Ensure there's content after frontmatter
    const contentAfterFrontmatter = lines
      .slice(closingDashIndex + 1)
      .join("\n")
      .trim();
    if (!contentAfterFrontmatter) {
      warnings.push({
        file: relativePath,
        message: "No content after frontmatter",
      });
    }
  } catch (error) {
    errors.push({
      file: relativePath,
      message: `Failed to read file: ${error instanceof Error ? error.message : String(error)}`,
    });
  }

  return { file: relativePath, errors, warnings };
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: CLI main function with multiple validation steps
async function main() {
  const skillPatterns = ["**/SKILL.md", ".rulesync/**/*.md", ".claude/**/*.md"];

  const allFiles = new Set<string>();
  for (const pattern of skillPatterns) {
    const files = await glob(pattern, {
      ignore: ["**/node_modules/**", "**/.git/**"],
      absolute: true,
    });
    for (const f of files) {
      allFiles.add(f);
    }
  }

  const skillFiles = [...allFiles].filter((file) => {
    // Filter to only include SKILL.md files or files in skills/agents directories
    return (
      file.endsWith("SKILL.md") ||
      file.includes("/skills/") ||
      file.includes("/agents/") ||
      file.includes("/subagents/")
    );
  });

  if (skillFiles.length === 0) {
    console.log("No skill files found.");
    process.exit(0);
  }

  console.log(`Found ${skillFiles.length} skill file(s) to lint...\n`);

  const results: LintResult[] = [];
  for (const file of skillFiles) {
    results.push(lintSkillFile(file));
  }

  // Report results
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const result of results) {
    if (result.errors.length > 0 || result.warnings.length > 0) {
      console.log(`\n${result.file}:`);

      for (const error of result.errors) {
        totalErrors += 1;
        const location = error.line ? `:${error.line}` : "";
        console.log(`  ❌ Error${location}: ${error.message}`);
      }

      for (const warning of result.warnings) {
        totalWarnings += 1;
        const location = warning.line ? `:${warning.line}` : "";
        console.log(`  ⚠️  Warning${location}: ${warning.message}`);
      }
    }
  }

  // Summary
  console.log(`\n${"=".repeat(50)}`);
  console.log("Summary:");
  console.log(`  Total files checked: ${results.length}`);
  console.log(`  Files with errors: ${results.filter((r) => r.errors.length > 0).length}`);
  console.log(`  Files with warnings: ${results.filter((r) => r.warnings.length > 0).length}`);
  console.log(`  Total errors: ${totalErrors}`);
  console.log(`  Total warnings: ${totalWarnings}`);

  if (totalErrors > 0) {
    console.log("\n❌ Linting failed with errors.");
    process.exit(1);
  } else if (totalWarnings > 0) {
    console.log("\n⚠️  Linting passed with warnings.");
    process.exit(0);
  } else {
    console.log("\n✅ All skill files are valid!");
    process.exit(0);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
