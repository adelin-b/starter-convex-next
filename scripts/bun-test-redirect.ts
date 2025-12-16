import { spawnSync } from "node:child_process";

const args = process.argv.slice(2).filter((argument) => !argument.includes("bun-test-redirect"));

const result = spawnSync("bun", ["run", "test", ...args], {
  stdio: "inherit",
  cwd: process.cwd(),
});

process.exit(result.status ?? 0);
