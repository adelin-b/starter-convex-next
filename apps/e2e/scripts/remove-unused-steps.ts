#!/usr/bin/env bun
/**
 * Remove unused step definitions from step files.
 * Run: bun scripts/remove-unused-steps.ts
 */
import { $ } from "bun";

declare const Bun: typeof import("bun");

// Get unused steps from bddgen
const output = await $`bunx bddgen export --unused-steps`.text();

// Parse the output to get file:line entries
const linePattern = /tests\/features\/steps\/([^:]+):(\d+)/g;
const unusedByFile = new Map<string, Set<number>>();

let match: RegExpExecArray | null;
// biome-ignore lint/suspicious/noAssignInExpressions: standard regex iteration pattern
while ((match = linePattern.exec(output)) !== null) {
  const file = match[1];
  const line = Number.parseInt(match[2], 10);
  if (!unusedByFile.has(file)) {
    unusedByFile.set(file, new Set());
  }
  unusedByFile.get(file)?.add(line);
}

console.log("Unused steps by file:");
for (const [file, lines] of unusedByFile) {
  console.log(`  ${file}: ${lines.size} steps`);
}

/**
 * Count parentheses in a line, ignoring string contents.
 * Returns { open, close } counts.
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: string parsing requires nested conditions
function countParens(line: string): { open: number; close: number } {
  let open = 0;
  let close = 0;
  let inString: string | null = null;
  let escaped = false;

  for (const char of line) {
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }

    // Handle string boundaries
    if (inString === null) {
      if (char === '"' || char === "'" || char === "`") {
        inString = char;
        continue;
      }
    } else {
      if (char === inString) {
        inString = null;
      }
      continue; // Skip characters inside strings
    }

    // Count parens when not in a string
    if (char === "(") {
      open++;
    } else if (char === ")") {
      close++;
    }
  }

  return { open, close };
}

// Process each file
for (const [fileName, unusedLines] of unusedByFile) {
  const filePath = `tests/features/steps/${fileName}`;
  const file = Bun.file(filePath);
  const content = await file.text();
  const lines = content.split("\n");

  console.log(`\nProcessing ${filePath}...`);

  // Find all step definition ranges using parenthesis matching
  const stepRanges: Array<{ start: number; end: number; isUnused: boolean }> = [];

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    // Check if this line starts a step definition (Given/When/Then)
    if (/^(Given|When|Then)\(/.test(line.trim())) {
      const startLine = index + 1; // 1-indexed for comparison with bddgen output

      // Find the end of this step definition by counting parentheses
      let parenCount = 0;
      let foundOpenParen = false;
      let endIndex = index;

      for (let index_ = index; index_ < lines.length; index_++) {
        const counts = countParens(lines[index_]);
        parenCount += counts.open - counts.close;

        if (counts.open > 0) {
          foundOpenParen = true;
        }

        if (foundOpenParen && parenCount === 0) {
          endIndex = index_;
          break;
        }
      }

      stepRanges.push({
        start: index,
        end: endIndex,
        isUnused: unusedLines.has(startLine),
      });
    }
  }

  // Build new content excluding unused steps
  const linesToKeep = new Set<number>();
  for (let index = 0; index < lines.length; index++) {
    linesToKeep.add(index);
  }

  let removedCount = 0;
  for (const range of stepRanges) {
    if (range.isUnused) {
      removedCount++;
      // Remove the step lines
      for (let index = range.start; index <= range.end; index++) {
        linesToKeep.delete(index);
      }
      // Also remove the preceding empty line if any
      if (range.start > 0 && lines[range.start - 1].trim() === "") {
        linesToKeep.delete(range.start - 1);
      }
    }
  }

  // Build the new file content
  const newLines: string[] = [];
  for (const [index, line] of lines.entries()) {
    if (linesToKeep.has(index)) {
      newLines.push(line);
    }
  }

  // Clean up multiple consecutive empty lines
  const cleanedLines: string[] = [];
  let prevEmpty = false;
  for (const line of newLines) {
    const isEmpty = line.trim() === "";
    if (isEmpty && prevEmpty) {
      continue; // Skip consecutive empty lines
    }
    cleanedLines.push(line);
    prevEmpty = isEmpty;
  }

  await Bun.write(filePath, cleanedLines.join("\n"));
  console.log(`  Removed ${removedCount} step definitions`);
  console.log(`  Saved ${filePath}`);
}

console.log("\nDone! Run 'bun run lint:steps' to verify.");
