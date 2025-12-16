/**
 * Global teardown for V8 coverage collection.
 *
 * Collects server-side coverage from Next.js via Chrome DevTools Protocol (CDP).
 * The Next.js dev server must be started with NODE_OPTIONS=--inspect=9229.
 *
 * Based on: https://github.com/cenfun/nextjs-with-playwright
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { FullConfig } from "@playwright/test";
import EC from "eight-colors";
import { CDPClient } from "monocart-coverage-reports";
import { addCoverageReport } from "monocart-reporter";

export default async function globalTeardown(config: FullConfig): Promise<void> {
  console.log("[Coverage] Global teardown - collecting server coverage...");

  try {
    // Connect to Next.js router server via CDP
    // The --inspect=9229 option makes Next.js router server available at 9230 (port + 1)
    const client = await CDPClient({
      port: 9230,
    });

    const dir = await client.writeCoverage();
    await client.close();

    if (!fs.existsSync(dir)) {
      EC.logRed("[Coverage] No coverage directory found");
      return;
    }

    const files = fs.readdirSync(dir);
    for (const filename of files) {
      const content = fs.readFileSync(path.resolve(dir, filename)).toString("utf8");
      const json = JSON.parse(content);
      let coverageList = json.result;

      // Filter to only file:// URLs (exclude node internals)
      coverageList = coverageList.filter((entry: { url?: string }) =>
        entry.url?.startsWith("file:"),
      );

      // Filter to Next.js server app files
      coverageList = coverageList.filter((entry: { url: string }) =>
        entry.url.includes("next/server/app"),
      );

      // Exclude manifest files
      coverageList = coverageList.filter(
        (entry: { url: string }) => !entry.url.includes("manifest.js"),
      );

      if (coverageList.length === 0) {
        continue;
      }

      // Attach source content for each file
      for (const entry of coverageList) {
        const filePath = fileURLToPath(entry.url);
        if (fs.existsSync(filePath)) {
          entry.source = fs.readFileSync(filePath).toString("utf8");
        } else {
          EC.logRed(`[Coverage] File not found: ${filePath}`);
        }
      }

      // Add to coverage report (mock test info since we're in teardown)
      const mockTestInfo = { config };
      await addCoverageReport(coverageList, mockTestInfo);
    }

    console.log("[Coverage] Server coverage collected successfully");
  } catch (error) {
    // CDP connection may fail if server wasn't started with --inspect
    EC.logRed(`[Coverage] Failed to collect server coverage: ${error}`);
  }

  console.log("✅ Test run complete");
}
