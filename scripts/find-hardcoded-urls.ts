#!/usr/bin/env npx tsx
/**
 * Find hardcoded URLs that should use environment variables.
 *
 * Detects:
 * - Vercel preview URLs (*.vercel.app)
 * - Localhost references in production code
 * - External CDN/API URLs without configuration
 *
 * Usage: npx tsx scripts/find-hardcoded-urls.ts
 */

import { execSync } from "node:child_process";

const PROJECT_ROOT = process.cwd();

// Top-level regex patterns (biome: useTopLevelRegex)
const VERCEL_APP_PATTERN = /\.vercel\.app/;
const LOCALHOST_PATTERN = /localhost|127\.0\.0\.1/;
const DEV_FILE_PATTERN = /dev|config|setup|\.env/;
const GREP_LINE_PATTERN = /^([^:]+):(\d+):(.+)$/;

type UrlFinding = {
  file: string;
  line: number;
  url: string;
  category: "preview" | "localhost" | "external" | "safe";
  severity: "error" | "warning" | "info";
};

// Patterns that are safe and should be ignored
const SAFE_PATTERNS = [
  /schema\.org/,
  /w3\.org/,
  /feature-sliced\.design/, // Documentation reference
  /github\.com/, // GitHub links in comments
  /example\.com/, // Test fixtures
  /localhost:\d+/, // Allowed in dev files
  /127\.0\.0\.1/,
  /0\.0\.0\.0/,
  /react\.email/, // React Email default templates
  /caniemail\.com/, // Email compatibility tool
  /emailonacid\.com/, // Email testing tool
  /vercel\.com/, // Vercel docs/links
  /nextjs\.org/, // Next.js docs
  /convex\.dev/, // Convex docs
  /better-auth\.com/, // Better-Auth docs
  /tweakcn\.com/, // Dev tools
  /polar\.sh/, // Polar billing docs
  /docs\.convex/, // Convex docs
  /-git-develop-/, // OAuth staging URLs (intentional for preview)
  /evil\.com/, // Test fixture for URL validation
];

// Files/directories to skip
const SKIP_PATTERNS = [
  /\.stories\.tsx?$/,
  /\.test\.tsx?$/,
  /\.spec\.tsx?$/,
  /node_modules/,
  /\.next/,
  /dist/,
  /__tests__/,
  /fixtures/,
  /mocks/,
  /\.react-email/, // Generated react-email preview folder
  /_generated/, // Convex generated files
];

function categorizeUrl(url: string, filePath: string): UrlFinding["category"] {
  // Check safe patterns first
  for (const pattern of SAFE_PATTERNS) {
    if (pattern.test(url)) {
      return "safe";
    }
  }

  // Vercel preview URLs
  if (VERCEL_APP_PATTERN.test(url)) {
    return "preview";
  }

  // Localhost in non-dev files
  if (LOCALHOST_PATTERN.test(url)) {
    const isDevFile = DEV_FILE_PATTERN.test(filePath);
    return isDevFile ? "safe" : "localhost";
  }

  return "external";
}

function getSeverity(category: UrlFinding["category"]): UrlFinding["severity"] {
  if (category === "preview") {
    return "error"; // Preview URLs should never be hardcoded
  }
  if (category === "localhost") {
    return "warning"; // Localhost might be intentional
  }
  // external or safe
  return "info";
}

function getSeverityIcon(severity: UrlFinding["severity"]): string {
  if (severity === "error") {
    return "error";
  }
  if (severity === "warning") {
    return "warning";
  }
  return "info";
}

function grepUrlsInDir(dir: string): string[] {
  try {
    const result = execSync(
      String.raw`grep -rnoE 'https?://[^"'"'"'\s>]+' --include="*.ts" --include="*.tsx" ${dir} 2>/dev/null || true`,
      {
        cwd: PROJECT_ROOT,
        encoding: "utf8",
        maxBuffer: 10 * 1024 * 1024,
      },
    );
    return result.split("\n");
  } catch {
    return [];
  }
}

function parseUrlLine(line: string): UrlFinding | null {
  if (!line.trim()) {
    return null;
  }

  const match = line.match(GREP_LINE_PATTERN);
  if (!match) {
    return null;
  }

  const [, file, lineNum, url] = match;

  // Skip excluded files
  if (SKIP_PATTERNS.some((p) => p.test(file))) {
    return null;
  }

  const category = categorizeUrl(url, file);
  if (category === "safe") {
    return null;
  }

  return {
    file,
    line: Number.parseInt(lineNum, 10),
    url: url.trim(),
    category,
    severity: getSeverity(category),
  };
}

function findHardcodedUrls(): UrlFinding[] {
  const findings: UrlFinding[] = [];
  const scanDirectories = ["apps/web/src", "packages"];

  for (const dir of scanDirectories) {
    const lines = grepUrlsInDir(dir);
    for (const line of lines) {
      const finding = parseUrlLine(line);
      if (finding) {
        findings.push(finding);
      }
    }
  }

  return findings;
}

function main() {
  console.log("🔍 Scanning for hardcoded URLs...\n");

  const findings = findHardcodedUrls();

  if (findings.length === 0) {
    console.log("✓ No problematic hardcoded URLs found\n");
    process.exit(0);
  }

  // Group by severity
  const errors = findings.filter((f) => f.severity === "error");
  const warnings = findings.filter((f) => f.severity === "warning");

  // Group by file for display
  const byFile = new Map<string, UrlFinding[]>();
  for (const finding of findings) {
    const list = byFile.get(finding.file) ?? [];
    list.push(finding);
    byFile.set(finding.file, list);
  }

  // ESLint-style output
  for (const [file, fileFindings] of byFile) {
    console.log(`\n${file}`);
    for (const f of fileFindings) {
      const icon = getSeverityIcon(f.severity);
      console.log(
        `  ${f.line}:1  ${icon}  Hardcoded ${f.category} URL: ${f.url.slice(0, 60)}${f.url.length > 60 ? "..." : ""}`,
      );
    }
  }

  console.log(
    `\n✖ ${findings.length} hardcoded URLs (${errors.length} errors, ${warnings.length} warnings)`,
  );

  // Exit with error only if there are error-level findings
  process.exit(errors.length > 0 ? 1 : 0);
}

main();
