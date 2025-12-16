#!/usr/bin/env bun

/**
 * upload-env-to-convex-watch.ts - Watch and upload environment variables to Convex
 */

import { spawn } from "node:child_process";
import { watch } from "node:fs";
import { access, readFile } from "node:fs/promises";

// Colors for console output
const colors = {
  GREEN: "\u001B[32m",
  YELLOW: "\u001B[33m",
  RED: "\u001B[31m",
  BLUE: "\u001B[34m",
  CYAN: "\u001B[36m",
  NC: "\u001B[0m",
} as const;

// Regex patterns for environment variable parsing
const ENV_VAR_NAME_REGEX = /^[A-Z_a-z]\w*=/;
const ENV_VAR_FULL_REGEX = /^([A-Z_a-z]\w*)=(.*)$/;

type ExistingEnv = {
  [key: string]: string;
};

type UploadResult = {
  total: number;
  unchanged: number;
  skipped: number;
  uploaded: number;
  failed: number;
};

class ConvexEnvUploader {
  private readonly envFile: string;
  private readonly batchSize = 5;

  constructor(envFile = ".env.local") {
    this.envFile = envFile;
  }

  private log(message: string, color?: keyof typeof colors): void {
    const colorCode = color ? colors[color] : "";
    const resetCode = color ? colors.NC : "";
    console.log(`${colorCode}${message}${resetCode}`);
  }

  private async checkBunAvailable(): Promise<boolean> {
    try {
      const { stdout } = await this.execCommand("which bun");
      return stdout.trim().length > 0;
    } catch {
      return false;
    }
  }

  private async checkEnvFileExists(): Promise<boolean> {
    try {
      await access(this.envFile);
      return true;
    } catch {
      return false;
    }
  }

  private async checkConvexProject(): Promise<boolean> {
    try {
      await access("convex/_generated/api.d.ts");
      return true;
    } catch {
      try {
        await access("convex");
        return true;
      } catch {
        return false;
      }
    }
  }

  private execCommand(command: string): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const [cmd, ...args] = command.split(" ");
      const child = spawn(cmd, args, {
        shell: true,
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      child.stdout?.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr?.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("close", (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        }
      });

      child.on("error", (error) => {
        reject(error);
      });
    });
  }

  private async fetchExistingEnv(): Promise<ExistingEnv> {
    try {
      const { stdout } = await this.execCommand("bunx convex env list");
      const existingEnv: ExistingEnv = {};

      const lines = stdout.split("\n");
      for (const line of lines) {
        // Skip empty lines and headers
        if (
          !line ||
          line.includes("Environment Variables") ||
          (line.includes("=") && !ENV_VAR_NAME_REGEX.test(line))
        ) {
          continue;
        }

        const match = line.match(ENV_VAR_FULL_REGEX);
        if (match) {
          const [, key, value] = match;
          existingEnv[key] = value;
        }
      }

      this.log(`Found ${Object.keys(existingEnv).length} existing environment variables`, "CYAN");
      return existingEnv;
    } catch {
      this.log(
        "Warning: Could not fetch existing environment variables. Will upload all variables.",
        "YELLOW",
      );
      return {};
    }
  }

  private async parseEnvFile(): Promise<Array<{ key: string; value: string }>> {
    const content = await readFile(this.envFile, "utf8");
    const lines = content.split("\n");
    const envVariables: Array<{ key: string; value: string }> = [];

    for (const line of lines) {
      // Skip comments and empty lines
      if (line.trim().startsWith("#") || !line.trim() || !line.includes("=")) {
        continue;
      }

      const equalIndex = line.indexOf("=");
      if (equalIndex === -1) {
        continue;
      }

      const key = line.slice(0, Math.max(0, equalIndex)).trim();
      const value = line.slice(Math.max(0, equalIndex + 1));

      if (!key) {
        continue;
      }

      envVariables.push({ key, value });
    }

    return envVariables;
  }

  private normalizeValue(value: string): string {
    let normalized = value;

    // Remove surrounding quotes
    if (
      (normalized.startsWith('"') && normalized.endsWith('"')) ||
      (normalized.startsWith("'") && normalized.endsWith("'"))
    ) {
      normalized = normalized.slice(1, -1);
    }

    return normalized;
  }

  private async uploadVariable(key: string, value: string): Promise<boolean> {
    try {
      // Check if value is already quoted
      const command =
        value.startsWith('"') || value.startsWith("'")
          ? `bunx convex env set "${key}" ${value}`
          : `bunx convex env set "${key}" "${value}"`;

      await this.execCommand(command);
      return true;
    } catch {
      return false;
    }
  }

  private async uploadBatch(
    variables: Array<{ key: string; value: string }>,
  ): Promise<Array<{ key: string; success: boolean }>> {
    const promises = variables.map(async ({ key, value }) => {
      const success = await this.uploadVariable(key, value);
      return { key, success };
    });

    return await Promise.all(promises);
  }

  private async runValidationChecks(): Promise<void> {
    if (!(await this.checkBunAvailable())) {
      this.log("Error: Bun is not installed.", "RED");
      throw new Error("Bun not available");
    }

    if (!(await this.checkEnvFileExists())) {
      this.log(`Error: Environment file '${this.envFile}' not found.`, "RED");
      throw new Error("Env file not found");
    }

    if (!(await this.checkConvexProject())) {
      this.log("Error: This doesn't appear to be a Convex project.", "RED");
      throw new Error("Not a Convex project");
    }
  }

  private shouldSkipVariable(key: string): boolean {
    return key.startsWith("CONVEX_") && key !== "CONVEX_DEPLOY_KEY";
  }

  private isVariableUnchanged(key: string, value: string, existingEnv: ExistingEnv): boolean {
    if (!existingEnv[key]) {
      return false;
    }

    const localNormalized = this.normalizeValue(value);
    const existingNormalized = this.normalizeValue(existingEnv[key]);

    return localNormalized === existingNormalized;
  }

  private categorizeVariables(
    envVariables: Array<{ key: string; value: string }>,
    existingEnv: ExistingEnv,
  ): {
    toUpload: Array<{ key: string; value: string }>;
    totalVars: number;
    skippedVars: number;
    unchangedVars: number;
  } {
    const toUpload: Array<{ key: string; value: string }> = [];
    let totalVariables = 0;
    let skippedVariables = 0;
    let unchangedVariables = 0;

    for (const { key, value } of envVariables) {
      totalVariables += 1;

      if (this.shouldSkipVariable(key)) {
        this.log(`Skipping Convex system variable: ${key}`, "YELLOW");
        skippedVariables += 1;
        continue;
      }

      if (this.isVariableUnchanged(key, value, existingEnv)) {
        this.log(`Unchanged: ${key}`, "CYAN");
        unchangedVariables += 1;
        continue;
      }

      if (existingEnv[key]) {
        this.log(`Changed: ${key}`, "YELLOW");
      } else {
        this.log(`New: ${key}`, "GREEN");
      }

      toUpload.push({ key, value });
    }

    return {
      toUpload,
      totalVars: totalVariables,
      skippedVars: skippedVariables,
      unchangedVars: unchangedVariables,
    };
  }

  private logUpToDateSummary(
    totalVariables: number,
    unchangedVariables: number,
    skippedVariables: number,
  ): void {
    console.log("");
    this.log("All environment variables are up to date!", "GREEN");
    console.log("");
    this.log("Upload Summary:", "BLUE");
    console.log("===============");
    console.log(`Total variables found: ${totalVariables}`);
    console.log(`Unchanged: ${unchangedVariables}`);
    console.log(`Skipped: ${skippedVariables}`);
    console.log("Uploaded: 0");
    console.log("Failed: 0");
  }

  private async processBatchUploads(
    toUpload: Array<{ key: string; value: string }>,
  ): Promise<{ uploaded: number; failed: number }> {
    console.log("");
    this.log(`Uploading ${toUpload.length} variables in batches of ${this.batchSize}...`, "GREEN");
    console.log("");

    let uploaded = 0;
    let failed = 0;

    for (let index = 0; index < toUpload.length; index += this.batchSize) {
      const batch = toUpload.slice(index, index + this.batchSize);
      const batchNumber = Math.floor(index / this.batchSize) + 1;
      const batchEnd = Math.min(index + this.batchSize, toUpload.length);

      this.log(`Batch ${batchNumber}: Processing variables ${index + 1}-${batchEnd}`, "BLUE");

      for (const { key } of batch) {
        this.log(`  Uploading ${key}`, "GREEN");
      }

      const results = await this.uploadBatch(batch);

      for (const { key, success } of results) {
        if (success) {
          uploaded += 1;
          this.log(`  ✓ Successfully uploaded: ${key}`, "GREEN");
        } else {
          failed += 1;
          this.log(`  ✗ Failed to upload: ${key}`, "RED");
        }
      }

      console.log("");
    }

    return { uploaded, failed };
  }

  private logFinalSummary(result: UploadResult): void {
    this.log("Upload Summary:", "BLUE");
    console.log("===============");
    console.log(`Total variables found: ${result.total}`);
    console.log(`Unchanged: ${result.unchanged}`);
    console.log(`Skipped: ${result.skipped}`);
    console.log(`Successfully uploaded: ${result.uploaded}`);
    console.log(`Failed: ${result.failed}`);

    if (result.uploaded > 0) {
      console.log("");
      this.log("Environment variables successfully uploaded to Convex!", "GREEN");
      if (result.failed > 0) {
        this.log(`Note: ${result.failed} variables failed to upload.`, "YELLOW");
      }
    } else if (result.unchanged > 0) {
      console.log("");
      this.log("All variables are already up to date in Convex!", "CYAN");
    } else {
      console.log("");
      this.log("No variables were uploaded.", "YELLOW");
    }
  }

  async performUpload(): Promise<UploadResult> {
    this.log(`[${new Date().toLocaleTimeString()}] Upload Environment Variables to Convex`, "BLUE");
    this.log("========================================");

    await this.runValidationChecks();

    this.log(`Reading environment variables from: ${this.envFile}`, "GREEN");
    this.log("Fetching existing Convex environment variables...", "CYAN");

    const existingEnv = await this.fetchExistingEnv();
    const envVariables = await this.parseEnvFile();

    this.log(`Processing in parallel batches of ${this.batchSize}`, "BLUE");

    const { toUpload, totalVars, skippedVars, unchangedVars } = this.categorizeVariables(
      envVariables,
      existingEnv,
    );

    if (toUpload.length === 0) {
      this.logUpToDateSummary(totalVars, unchangedVars, skippedVars);
      return {
        total: totalVars,
        unchanged: unchangedVars,
        skipped: skippedVars,
        uploaded: 0,
        failed: 0,
      };
    }

    const { uploaded, failed } = await this.processBatchUploads(toUpload);

    const result: UploadResult = {
      total: totalVars,
      unchanged: unchangedVars,
      skipped: skippedVars,
      uploaded,
      failed,
    };

    this.logFinalSummary(result);

    return result;
  }
}

// Main execution
async function main() {
  const envFile = process.argv[2] || ".env.local";
  const uploader = new ConvexEnvUploader(envFile);

  console.log("\u001B[34mStarting Convex Environment Variable Watcher\u001B[0m");
  console.log("=============================================");
  console.log(`\u001B[32mWatching: ${envFile}\u001B[0m`);
  console.log("\u001B[33mPress Ctrl+C to stop watching\u001B[0m");
  console.log("");

  // Initial upload
  console.log("\u001B[36mPerforming initial upload...\u001B[0m");
  try {
    await uploader.performUpload();
  } catch (error) {
    console.error("\u001B[31mInitial upload failed:\u001B[0m", error);
    process.exit(1);
  }
  console.log("");

  // Start watching for changes
  console.log("\u001B[36mStarting file watcher...\u001B[0m");

  const watcher = watch(envFile, async (eventType) => {
    if (eventType === "change") {
      console.log("\u001B[33mFile changed, uploading...\u001B[0m");
      try {
        await uploader.performUpload();
      } catch (error) {
        console.error("\u001B[31mUpload failed:\u001B[0m", error);
      }
      console.log("");
    }
  });

  // Handle Ctrl+C gracefully
  process.on("SIGINT", () => {
    console.log("\n\u001B[33mStopping watcher...\u001B[0m");
    watcher.close();
    process.exit(0);
  });

  // Keep the process running
  process.on("exit", () => {
    watcher.close();
  });
}

// Run if this file is executed directly
if (import.meta.main) {
  main().catch((error) => {
    console.error("\u001B[31mFatal error:\u001B[0m", error);
    process.exit(1);
  });
}
