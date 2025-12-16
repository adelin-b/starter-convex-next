import { existsSync, lstatSync } from "node:fs";

const APPS_WEB_PATH_REGEX = /.*apps\/web\//;

function isPathThroughSymlink(filePath) {
  const parts = filePath.split("/");
  let current = "";
  for (const part of parts.slice(0, -1)) {
    current = current ? `${current}/${part}` : part;
    if (existsSync(current)) {
      try {
        if (lstatSync(current).isSymbolicLink()) {
          return true;
        }
      } catch {
        // Ignore stat errors
      }
    }
  }
  return false;
}

function filterSymlinks(files) {
  return files.filter((f) => !isPathThroughSymlink(f));
}

export default {
  "*.{js,jsx,ts,tsx,json,jsonc,css,scss,md,mdx}": (files) => {
    const filtered = filterSymlinks(files);
    const quoted = filtered.map((f) => `"${f}"`);
    return quoted.length ? [`bun x ultracite fix ${quoted.join(" ")}`] : [];
  },
  "apps/web/src/**/*.{ts,tsx}": (files) => {
    const relativePaths = files.map((f) => `"${f.replace(APPS_WEB_PATH_REGEX, "")}"`);
    return [
      `bash -c 'cd apps/web && bunx eslint --max-warnings 0 --no-warn-ignored ${relativePaths.join(" ")}'`,
      "bash -c 'cd apps/web && bun run intl:extract && bun run intl:verify && git add src/locales/en.json'",
    ];
  },
  // Optimize PNG images on commit (compress with max compression level)
  "**/*.png": (files) => {
    const filtered = filterSymlinks(files);
    if (!filtered.length) {
      return [];
    }
    return filtered.map((f) => `bunx sharp -i "${f}" -o "${f}" -f png -c 9`);
  },
  // Optimize JPEG images on commit (quality 85, mozjpeg)
  "**/*.{jpg,jpeg}": (files) => {
    const filtered = filterSymlinks(files);
    if (!filtered.length) {
      return [];
    }
    return filtered.map((f) => `bunx sharp -i "${f}" -o "${f}" -f jpeg -q 85 --mozjpeg`);
  },
  // Optimize SVG with SVGO
  "**/*.svg": (files) => {
    const filtered = filterSymlinks(files);
    if (!filtered.length) {
      return [];
    }
    return [`bunx svgo ${filtered.join(" ")}`];
  },
};
