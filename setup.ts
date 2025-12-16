#!/usr/bin/env bun
/**
 * Starter SaaS Setup Script
 *
 * This script guides you through setting up your new SaaS project.
 * Run with: bun setup.ts
 */

import { $ } from "bun";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import * as readline from "readline";

const rl = readline.createInterface({
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
    Bun.spawn(["open", url]);
  } else if (platform === "win32") {
    Bun.spawn(["cmd", "/c", "start", url]);
  } else {
    Bun.spawn(["xdg-open", url]);
  }
}

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║           🚀 Starter SaaS Setup Wizard 🚀                  ║
║                                                            ║
║  This wizard will help you configure:                      ║
║  • Convex backend                                          ║
║  • Better Auth authentication                              ║
║  • Environment variables                                   ║
║  • Email provider (optional)                               ║
╚═══════════════════════════════════════════════════════════╝
`);

  const totalSteps = 5;
  let envContent = "";

  // Check if .env.local exists
  const envLocalPath = join(process.cwd(), ".env.local");
  if (existsSync(envLocalPath)) {
    envContent = readFileSync(envLocalPath, "utf-8");
    console.log("📄 Found existing .env.local file\n");
  }

  // Step 1: Install dependencies
  printStep(1, totalSteps, "Installing Dependencies");
  console.log("Running bun install...");
  await $`bun install`;
  console.log("✅ Dependencies installed!");

  // Step 2: Set up Convex
  printStep(2, totalSteps, "Convex Setup");
  console.log(`
Convex is your real-time backend. You need a Convex project.

1. Create a free account at convex.dev (if you don't have one)
2. Create a new project in the Convex dashboard
3. Get your deployment URL and deploy key
`);

  await ask("Press Enter to open Convex dashboard...");
  openUrl("https://dashboard.convex.dev");

  const convexUrl = await ask("\nEnter your Convex deployment URL (e.g., https://xxx-xxx.convex.cloud): ");
  if (convexUrl) {
    envContent += `\n# Convex\nCONVEX_URL=${convexUrl}\n`;
  }

  // Step 3: Set up Better Auth
  printStep(3, totalSteps, "Better Auth Setup");
  console.log(`
Better Auth handles authentication. You need to configure:

1. A secret key (generated automatically)
2. OAuth providers (optional - Google, GitHub, etc.)

Generating a secure secret...
`);

  // Generate a random secret
  const secret = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64");
  console.log(`✅ Generated BETTER_AUTH_SECRET`);

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

  // Step 4: Email setup (optional)
  printStep(4, totalSteps, "Email Setup (Optional)");
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

  // Step 5: Write .env.local and finalize
  printStep(5, totalSteps, "Finalizing Setup");

  // Add default port config
  envContent += `
# Development Ports
PORT=3001
STORYBOOK_PORT=6006
`;

  writeFileSync(envLocalPath, envContent.trim() + "\n");
  console.log("✅ Created .env.local with your configuration\n");

  // Run Convex setup
  console.log("Setting up Convex...");
  try {
    await $`cd packages/backend && bunx convex dev --once`;
    console.log("✅ Convex schema deployed!");
  } catch (e) {
    console.log("⚠️  Convex setup skipped (run 'bun run dev:setup' manually)");
  }

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                    🎉 Setup Complete! 🎉                   ║
╚═══════════════════════════════════════════════════════════╝

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
• Next.js: https://nextjs.org/docs

Happy building! 🚀
`);

  rl.close();
}

main().catch(console.error);
