#!/usr/bin/env bun
/**
 * Lint unused step definitions - fails if any are found
 */
import { $ } from "bun";

const result = await $`bunx bddgen export --unused-steps`.text();

// Output the result
console.log(result);

// Check if there are unused steps (look for "Unused steps (N):" where N > 0)
const match = result.match(/Unused steps \((\d+)\):/);
if (match) {
  const count = Number.parseInt(match[1], 10);
  if (count > 0) {
    console.error(`\n❌ Found ${count} unused step definitions. Please remove them.`);
    process.exit(1);
  }
}

console.log("✅ No unused step definitions found.");
