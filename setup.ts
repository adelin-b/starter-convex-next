#!/usr/bin/env bun

/**
 * Starter SaaS Setup Script
 *
 * This script guides you through setting up your new SaaS project.
 * Run with: bun setup.ts
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { createInterface } from "node:readline";
import { $ } from "bun";

const WORD_SPLIT_REGEX = /[\s_-]+/;

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

function printStep(step: number, total: number, title: string) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Step ${step}/${total}: ${title}`);
  console.log("=".repeat(60));
}

function openUrl(url: string) {
  const platform = process.platform;
  if (platform === "darwin") {
    // biome-ignore lint/correctness/noUndeclaredVariables: Bun runtime global
    Bun.spawn(["open", url]);
  } else if (platform === "win32") {
    // biome-ignore lint/correctness/noUndeclaredVariables: Bun runtime global
    Bun.spawn(["cmd", "/c", "start", url]);
  } else {
    // biome-ignore lint/correctness/noUndeclaredVariables: Bun runtime global
    Bun.spawn(["xdg-open", url]);
  }
}

function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replaceAll(/[^\da-z]+/g, "-")
    .replaceAll(/(^-)|(-$)/g, "");
}

function toPascalCase(str: string): string {
  return str
    .split(WORD_SPLIT_REGEX)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

function updatePackageJson(filePath: string, projectName: string, scope: string) {
  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, "utf8");
  const updated = content
    .replaceAll(/"name":\s*"starter-saas"/g, `"name": "${projectName}"`)
    .replaceAll("@starter-saas/", `@${scope}/`);

  writeFileSync(filePath, updated);
}

function updateAllFiles(dir: string, oldScope: string, newScope: string) {
  const extensions = [".ts", ".tsx", ".json", ".md"];
  const ignoreDirectories = new Set([
    "node_modules",
    ".git",
    ".next",
    "storybook-static",
    ".turbo",
  ]);

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: recursive directory traversal requires this structure
  function processDir(currentDir: string) {
    const entries = readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (!ignoreDirectories.has(entry.name)) {
          processDir(fullPath);
        }
      } else if (extensions.some((extension) => entry.name.endsWith(extension))) {
        try {
          const content = readFileSync(fullPath, "utf8");
          if (content.includes(oldScope)) {
            const updated = content.replaceAll(new RegExp(oldScope, "g"), newScope);
            writeFileSync(fullPath, updated);
          }
        } catch {
          // Skip files that can't be read
        }
      }
    }
  }

  processDir(dir);
}

async function checkPrerequisites(): Promise<boolean> {
  console.log("Checking prerequisites...\n");

  // Check Bun version
  try {
    const bunVersion = await $`bun --version`.text();
    console.log(`✅ Bun: v${bunVersion.trim()}`);
  } catch {
    console.log("❌ Bun not found. Please install Bun: https://bun.sh");
    return false;
  }

  // Check Node version
  try {
    const nodeVersion = await $`node --version`.text();
    const major = Number.parseInt(nodeVersion.trim().replace("v", "").split(".")[0], 10);
    if (major >= 18 && major < 25) {
      console.log(`✅ Node.js: ${nodeVersion.trim()}`);
    } else {
      console.log(`⚠️  Node.js ${nodeVersion.trim()} - recommended: v18-v24`);
    }
  } catch {
    console.log("⚠️  Node.js not found (optional, Bun handles most operations)");
  }

  // Check Git
  try {
    await $`git --version`.quiet();
    console.log("✅ Git: installed");
  } catch {
    console.log("⚠️  Git not found (optional, for version control)");
  }

  console.log("");
  return true;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: interactive wizard requires sequential user prompts
async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║           🚀 Starter SaaS Setup Wizard 🚀                  ║
║                                                            ║
║  This wizard will help you configure:                      ║
║  • Project name & branding                                 ║
║  • Convex backend                                          ║
║  • Better Auth authentication                              ║
║  • Email provider (optional)                               ║
║  • Polar payments (optional)                               ║
╚═══════════════════════════════════════════════════════════╝
`);

  const prereqOk = await checkPrerequisites();
  if (!prereqOk) {
    console.log("Please install missing prerequisites and try again.");
    rl.close();
    return;
  }

  const totalSteps = 7;
  let envContent = "";

  // Check if .env.local exists
  const envLocalPath = join(process.cwd(), ".env.local");
  if (existsSync(envLocalPath)) {
    envContent = readFileSync(envLocalPath, "utf8");
    console.log("📄 Found existing .env.local file\n");
  }

  // Step 1: Project Name
  printStep(1, totalSteps, "Project Configuration");

  const currentDirName = basename(process.cwd());
  const defaultName = currentDirName === "starter-convex-next" ? "my-saas-app" : currentDirName;

  console.log(`
Choose a name for your project. This will be used for:
• Package names (@your-project/backend, @your-project/ui, etc.)
• Default branding
• GitHub repository (if you create one)

Examples: my-app, acme-platform, todo-pro
`);

  const projectNameInput = await ask(`Project name (default: ${defaultName}): `);
  const projectName = toKebabCase(projectNameInput || defaultName);
  const projectScope = projectName;
  const projectTitle = toPascalCase(projectName);

  console.log(`\n📦 Updating package names to @${projectScope}/...`);

  // Update root package.json
  updatePackageJson(join(process.cwd(), "package.json"), projectName, projectScope);

  // Update all @starter-saas references
  updateAllFiles(process.cwd(), "@starter-saas", `@${projectScope}`);

  // Update packages
  const packages = [
    "backend",
    "ui",
    "shared",
    "emails",
    "eslint-config",
    "vitest-config",
    "config",
  ];
  for (const package_ of packages) {
    const packagePath = join(process.cwd(), "packages", package_, "package.json");
    if (existsSync(packagePath)) {
      const content = readFileSync(packagePath, "utf8");
      const updated = content.replaceAll("@starter-saas/", `@${projectScope}/`);
      writeFileSync(packagePath, updated);
    }
  }

  // Update apps
  const apps = ["web", "e2e", "storybook"];
  for (const app of apps) {
    const appPath = join(process.cwd(), "apps", app, "package.json");
    if (existsSync(appPath)) {
      const content = readFileSync(appPath, "utf8");
      const updated = content.replaceAll("@starter-saas/", `@${projectScope}/`);
      writeFileSync(appPath, updated);
    }
  }

  console.log(`✅ Project configured as "${projectName}"`);

  // Step 2: Install dependencies
  printStep(2, totalSteps, "Installing Dependencies");
  console.log("Running bun install...");
  await $`bun install`;
  console.log("✅ Dependencies installed!");

  // Step 3: Set up Convex
  printStep(3, totalSteps, "Convex Setup");
  console.log(`
Convex is your real-time backend. You need a Convex project.

1. Create a free account at convex.dev (if you don't have one)
2. Create a new project named "${projectName}"
3. Get your deployment URL
`);

  await ask("Press Enter to open Convex dashboard...");
  openUrl("https://dashboard.convex.dev");

  const convexUrl = await ask(
    "\nEnter your Convex deployment URL (e.g., https://xxx-xxx.convex.cloud): ",
  );
  if (convexUrl) {
    envContent += `\n# Convex\nCONVEX_URL=${convexUrl}\n`;
  }

  // Step 4: Set up Better Auth
  printStep(4, totalSteps, "Better Auth Setup");
  console.log(`
Better Auth handles authentication. You need to configure:

1. A secret key (generated automatically)
2. OAuth providers (optional - Google, GitHub, etc.)

Generating a secure secret...
`);

  // Generate a random secret
  const secret = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64");
  console.log("✅ Generated BETTER_AUTH_SECRET");

  const siteUrl = await ask("\nEnter your site URL (default: http://localhost:3001): ");
  const finalSiteUrl = siteUrl || "http://localhost:3001";

  envContent += `
# Better Auth
BETTER_AUTH_SECRET=${secret}
SITE_URL=${finalSiteUrl}
`;

  // Optional: OAuth setup
  const setupOAuth = await ask("\nDo you want to set up OAuth providers? (y/n): ");
  if (setupOAuth.toLowerCase() === "y") {
    console.log(`
Setting up OAuth providers...

For Google OAuth:
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID
3. Set redirect URI to: ${finalSiteUrl}/api/auth/callback/google
`);
    await ask("Press Enter to open Google Cloud Console...");
    openUrl("https://console.cloud.google.com/apis/credentials");

    const googleClientId = await ask("\nEnter Google Client ID (or press Enter to skip): ");
    if (googleClientId) {
      const googleClientSecret = await ask("Enter Google Client Secret: ");
      envContent += `
# Google OAuth
GOOGLE_CLIENT_ID=${googleClientId}
GOOGLE_CLIENT_SECRET=${googleClientSecret}
`;
    }

    console.log(`
For GitHub OAuth:
1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Create a new OAuth App
3. Set callback URL to: ${finalSiteUrl}/api/auth/callback/github
`);
    await ask("Press Enter to open GitHub Developer Settings...");
    openUrl("https://github.com/settings/developers");

    const githubClientId = await ask("\nEnter GitHub Client ID (or press Enter to skip): ");
    if (githubClientId) {
      const githubClientSecret = await ask("Enter GitHub Client Secret: ");
      envContent += `
# GitHub OAuth
GITHUB_CLIENT_ID=${githubClientId}
GITHUB_CLIENT_SECRET=${githubClientSecret}
`;
    }
  }

  // Step 5: Email setup (optional)
  printStep(5, totalSteps, "Email Setup (Optional)");
  console.log(`
Email is used for:
• Magic link authentication
• Organization invitations
• Notifications

Supported providers: Resend, SendGrid, Postmark
`);

  const setupEmail = await ask("Do you want to set up email? (y/n): ");
  if (setupEmail.toLowerCase() === "y") {
    console.log("\nWe recommend Resend - it's free for 3,000 emails/month.");
    await ask("Press Enter to open Resend...");
    openUrl("https://resend.com/api-keys");

    const resendApiKey = await ask("\nEnter Resend API Key (or press Enter to skip): ");
    if (resendApiKey) {
      const emailFrom = await ask("Enter sender email (e.g., noreply@yourdomain.com): ");
      envContent += `
# Email (Resend)
RESEND_API_KEY=${resendApiKey}
EMAIL_FROM=${emailFrom || "noreply@example.com"}
`;
    }
  }

  // Step 6: Polar Payments setup (optional)
  printStep(6, totalSteps, "Polar Payments Setup (Optional)");
  console.log(`
Polar provides subscription and payment handling for your SaaS.

Features:
• 4% + 40¢ per transaction (no monthly fees)
• Merchant of Record (handles tax compliance)
• Built-in subscription management
• Sandbox mode for testing

You'll need:
1. A Polar account (free)
2. An organization on Polar
3. Products created in the Polar dashboard
`);

  const setupPolar = await ask("Do you want to set up Polar payments? (y/n): ");
  if (setupPolar.toLowerCase() === "y") {
    console.log(`
Setting up Polar...

1. Create an account at polar.sh
2. Create an organization
3. Go to Settings → Developers → Organization Tokens
4. Create a new token with necessary permissions
`);
    await ask("Press Enter to open Polar dashboard...");
    openUrl("https://polar.sh/dashboard");

    const polarToken = await ask("\nEnter Polar Organization Token (or press Enter to skip): ");
    if (polarToken) {
      envContent += `
# Polar Payments
POLAR_ORGANIZATION_TOKEN=${polarToken}
POLAR_SERVER=sandbox
`;

      console.log(`
Now set up webhooks for subscription events:

1. Go to Settings → Developers → Webhooks
2. Create a new webhook
3. Set URL to: {YOUR_CONVEX_HTTP_URL}/polar/webhook
4. Select events: subscription.created, subscription.updated, subscription.canceled
`);
      await ask("Press Enter to open Polar webhook settings...");
      openUrl("https://polar.sh/dashboard/settings/developers/webhooks");

      const polarWebhookSecret = await ask(
        "\nEnter Polar Webhook Secret (or press Enter to skip for now): ",
      );
      if (polarWebhookSecret) {
        envContent += `POLAR_WEBHOOK_SECRET=${polarWebhookSecret}
`;
      } else {
        envContent += `# POLAR_WEBHOOK_SECRET=your_webhook_secret_here
`;
      }

      console.log(`
Optional: Configure product IDs for subscription tiers.
You can create products in Polar dashboard → Products.
Product IDs can be added later to .env.local:

# POLAR_PRODUCT_PRO_MONTHLY=your_product_id
# POLAR_PRODUCT_PRO_YEARLY=your_product_id
# POLAR_PRODUCT_TEAM_MONTHLY=your_product_id
# POLAR_PRODUCT_TEAM_YEARLY=your_product_id
`);
      envContent += `
# Polar Product IDs (configure these after creating products in Polar dashboard)
# POLAR_PRODUCT_PRO_MONTHLY=your_product_id
# POLAR_PRODUCT_PRO_YEARLY=your_product_id
# POLAR_PRODUCT_TEAM_MONTHLY=your_product_id
# POLAR_PRODUCT_TEAM_YEARLY=your_product_id
`;

      console.log("✅ Polar configuration added!");
    }
  }

  // Step 7: Write .env.local and finalize
  printStep(7, totalSteps, "Finalizing Setup");

  // Add default port config
  envContent += `
# Development Ports
PORT=3001
STORYBOOK_PORT=6006
`;

  writeFileSync(envLocalPath, `${envContent.trim()}\n`);
  console.log("✅ Created .env.local with your configuration\n");

  // Run Convex setup
  console.log("Setting up Convex...");
  try {
    await $`cd packages/backend && bunx convex dev --once`;
    console.log("✅ Convex schema deployed!");
  } catch {
    console.log("⚠️  Convex setup skipped (run 'bun run dev:setup' manually)");
  }

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                    🎉 Setup Complete! 🎉                   ║
╚═══════════════════════════════════════════════════════════╝

Your project "${projectTitle}" is ready!

Next steps:

1. Start the development server:
   $ bun run dev

2. Open your browser:
   http://localhost:3001

3. Create your first admin user and organization!

Useful commands:
• bun run dev          - Start all services
• bun run dev:web      - Start web app only
• bun run dev:server   - Start Convex backend only
• bun run test         - Run tests
• bun run check        - Run linting

Documentation:
• Convex: https://docs.convex.dev
• Better Auth: https://www.better-auth.com
• Polar: https://docs.polar.sh
• Next.js: https://nextjs.org/docs

Happy building! 🚀
`);

  rl.close();
}

main().catch(console.error);
