import fs from "node:fs";
import path from "node:path";

/**
 * Feature-Sliced Design Inspired Feature Boundaries ESLint Rules
 *
 * Dynamically generates ESLint import/no-restricted-paths rules to enforce:
 * 1. No direct cross-feature imports (features cannot import from other features' internals)
 * 2. Cross-feature communication via @x public API folders
 * 3. Unidirectional architecture (shared -> features -> app)
 *
 * @see https://feature-sliced.design/docs/reference/public-api
 * @see https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md
 */

/**
 * Auto-detect feature folders in the given directory
 * @param {string} featuresDir - Absolute path to features directory
 * @returns {string[]} Array of feature folder names
 */
export function detectFeatures(featuresDir) {
  if (!fs.existsSync(featuresDir)) {
    console.warn(`[feature-boundaries] Features directory not found: ${featuresDir}`);
    return [];
  }

  const entries = fs.readdirSync(featuresDir, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

/**
 * Generate cross-feature restriction zones with @x public API support
 *
 * Each feature can only import from:
 * 1. Itself (own feature)
 * 2. Other features' @x/{thisFeature} public API folders
 *
 * Example: agencies can import from vehicles/@x/agencies but NOT from vehicles/components
 *
 * @param {string[]} features - Array of feature folder names
 * @param {string} featuresPath - Relative path to features (e.g., "./src/features")
 * @returns {Array<{target: string, from: string, except: string[], message: string}>}
 */
function generateCrossFeatureZones(features, featuresPath) {
  return features.flatMap((feature) => {
    // Get other features (not this feature)
    const otherFeatures = features.filter((f) => f !== feature);
    if (otherFeatures.length === 0) return [];

    // Create a zone for each other feature that this feature cannot import from
    // (except via @x public API)
    return otherFeatures.map((otherFeature) => ({
      target: `${featuresPath}/${feature}/**/*`,
      // Restrict imports from each other feature's directory
      from: `${featuresPath}/${otherFeature}`,
      // Allow @x public API folder
      // containsPath checks if import is a descendant of exception directory
      // @x folder contains files like agencies.ts (for agencies feature to import)
      except: ["@x"],
      message:
        `Cross-feature import detected in "${feature}". ` +
        `Features can only import from other features via their @x public API. ` +
        `Either:\n` +
        `  1. Export the component from features/${otherFeature}/@x/${feature}.ts\n` +
        `  2. Move truly shared code to components/, hooks/, or lib/\n` +
        `@see https://feature-sliced.design/docs/reference/public-api`,
    }));
  });
}

/**
 * Generate unidirectional architecture zones
 * Enforces: shared modules -> features -> app
 *
 * @param {string} srcPath - Relative path to src (e.g., "./src")
 * @returns {Array<{target: string|string[], from: string|string[], message: string}>}
 */
function generateUnidirectionalZones(srcPath) {
  return [
    // Features cannot import from app
    {
      target: `${srcPath}/features`,
      from: `${srcPath}/app`,
      message: "Features cannot import from app. Data flows from shared -> features -> app.",
    },
    // Shared modules cannot import from features or app
    {
      target: [
        `${srcPath}/components`,
        `${srcPath}/hooks`,
        `${srcPath}/lib`,
        `${srcPath}/types`,
        `${srcPath}/utils`,
        `${srcPath}/config`,
      ],
      from: [`${srcPath}/features`, `${srcPath}/app`],
      message:
        "Shared modules (components, hooks, lib, types, utils, config) cannot import from features or app. " +
        "They should only contain reusable code with no feature-specific dependencies.",
    },
  ];
}

/**
 * Create feature boundaries zones for ESLint configuration
 * Pre-generates the zones synchronously for simple config setups
 *
 * @param {Object} options - Configuration options
 * @param {string} options.featuresDir - Absolute path to features directory (for auto-detection)
 * @param {string} [options.srcPath="./src"] - Relative path from eslint config to src directory
 * @param {string[]} [options.additionalFeatures=[]] - Additional feature names to include
 * @param {boolean} [options.enableUnidirectional=true] - Enable unidirectional architecture rules
 * @returns {Array} Array of zone configurations for import/no-restricted-paths
 */
export function createFeatureBoundariesZones(options) {
  const {
    featuresDir,
    srcPath = "./src",
    additionalFeatures = [],
    enableUnidirectional = true,
  } = options;

  const featuresPath = `${srcPath}/features`;

  // Auto-detect features
  const detectedFeatures = detectFeatures(featuresDir);
  const allFeatures = [...new Set([...detectedFeatures, ...additionalFeatures])];

  if (allFeatures.length === 0) {
    return [];
  }

  // Build restriction zones
  return [
    ...generateCrossFeatureZones(allFeatures, featuresPath),
    ...(enableUnidirectional ? generateUnidirectionalZones(srcPath) : []),
  ];
}
