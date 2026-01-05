import { execSync } from "node:child_process";
import { chmodSync, createWriteStream, existsSync, mkdirSync, unlinkSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createGunzip } from "node:zlib";

const CACHE_DIR = join(homedir(), ".convex-e2e", "releases");
const GITHUB_API = "https://api.github.com/repos/get-convex/convex-backend/releases";

type GitHubRelease = {
  tag_name: string;
  assets: Array<{
    name: string;
    browser_download_url: string;
  }>;
};

function getPlatformString(): string {
  const platform = process.platform;
  const arch = process.arch;

  if (platform === "darwin") {
    return arch === "arm64" ? "aarch64-apple-darwin" : "x86_64-apple-darwin";
  }
  if (platform === "linux") {
    return arch === "arm64" ? "aarch64-unknown-linux-gnu" : "x86_64-unknown-linux-gnu";
  }
  if (platform === "win32") {
    return "x86_64-pc-windows-msvc";
  }

  throw new Error(`Unsupported platform: ${platform} ${arch}`);
}

async function fetchLatestRelease(): Promise<GitHubRelease> {
  console.log("[download-convex-binary] Fetching latest release from GitHub...");

  const baseHeaders: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "starter-saas-e2e-tests",
  };

  // Try with auth first (avoids rate limiting), fall back to unauthenticated for public repos
  const attempts: Array<{ name: string; headers: Record<string, string> }> = [];

  if (process.env.GITHUB_TOKEN) {
    attempts.push({
      name: "authenticated (Bearer)",
      headers: { ...baseHeaders, Authorization: `Bearer ${process.env.GITHUB_TOKEN}` },
    });
  }
  // Always include unauthenticated as fallback (works for public repos)
  attempts.push({ name: "unauthenticated", headers: baseHeaders });

  let lastError: Error | null = null;
  for (const attempt of attempts) {
    console.log(`[download-convex-binary] Trying ${attempt.name} request...`);
    const response = await fetch(GITHUB_API, { headers: attempt.headers });
    console.log(`[download-convex-binary] Response status: ${response.status}`);

    if (response.ok) {
      const releases = (await response.json()) as GitHubRelease[];
      const latestRelease = releases.find(
        (r) => !(r.tag_name.includes("prerelease") || r.tag_name.includes("rc")),
      );

      if (!latestRelease) {
        throw new Error("No stable release found");
      }

      return latestRelease;
    }

    lastError = new Error(`Failed to fetch releases: ${response.statusText}`);
    console.log(`[download-convex-binary] ${attempt.name} failed, trying next...`);
  }

  throw lastError || new Error("All fetch attempts failed");
}

async function downloadAndExtract(
  url: string,
  destinationPath: string,
  destinationDir: string,
): Promise<void> {
  const response = await fetch(url);
  if (!(response.ok && response.body)) {
    throw new Error(`Failed to download: ${response.statusText}`);
  }

  const isZip = url.endsWith(".zip");
  const isGzip = url.endsWith(".gz");

  if (isZip) {
    // Download ZIP to temp file, then extract
    const temporaryZip = join(destinationDir, "temp.zip");
    const fileStream = createWriteStream(temporaryZip);
    const nodeStream = Readable.fromWeb(response.body);
    await pipeline(nodeStream, fileStream);

    // Extract using unzip command
    execSync(`unzip -o "${temporaryZip}" -d "${destinationDir}"`, { stdio: "pipe" });

    // Clean up temp file
    unlinkSync(temporaryZip);
  } else if (isGzip) {
    const gunzip = createGunzip();
    const fileStream = createWriteStream(destinationPath);
    const nodeStream = Readable.fromWeb(response.body);
    await pipeline(nodeStream, gunzip, fileStream);
  } else {
    const fileStream = createWriteStream(destinationPath);
    const nodeStream = Readable.fromWeb(response.body);
    await pipeline(nodeStream, fileStream);
  }

  // Make executable on Unix-like systems
  if (process.platform !== "win32") {
    chmodSync(destinationPath, 0o755);
  }
}

export async function downloadConvexBinary(): Promise<string> {
  console.log("[download-convex-binary] downloadConvexBinary() called");
  const platformString = getPlatformString();
  console.log(`[download-convex-binary] Platform: ${platformString}`);

  // Ensure cache directory exists
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
  }

  // Fetch latest release
  const release = await fetchLatestRelease();
  const version = release.tag_name;

  // Check if already cached
  const binaryName =
    process.platform === "win32" ? "convex-local-backend.exe" : "convex-local-backend";
  const cachedPath = join(CACHE_DIR, `${version}-${platformString}`, binaryName);

  if (existsSync(cachedPath)) {
    console.log(`Using cached Convex binary: ${cachedPath}`);
    return cachedPath;
  }

  // Find the right asset
  const asset = release.assets.find(
    (a) => a.name.includes("convex-local-backend") && a.name.includes(platformString),
  );

  if (!asset) {
    throw new Error(`No binary found for platform ${platformString} in release ${version}`);
  }

  console.log(`Downloading Convex binary ${version} for ${platformString}...`);

  // Create version directory
  const versionDir = join(CACHE_DIR, `${version}-${platformString}`);
  if (!existsSync(versionDir)) {
    mkdirSync(versionDir, { recursive: true });
  }

  // Download and extract
  await downloadAndExtract(asset.browser_download_url, cachedPath, versionDir);

  console.log(`Downloaded Convex binary to: ${cachedPath}`);
  return cachedPath;
}
