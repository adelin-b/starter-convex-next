import { test as base, expect, type Page } from "@playwright/test";

/**
 * Test fixtures for DeeDee E2E tests with authentication support.
 */

export interface AuthHelpers {
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  createTestUser: () => Promise<{ email: string; password: string; name: string }>;
}

export const test = base.extend<{ auth: AuthHelpers }>({
  auth: async ({ page }, use) => {
    const helpers: AuthHelpers = {
      signUp: async (name: string, email: string, password: string) => {
        await page.goto("/auth/sign-up");
        await page.getByLabel(/name/i).fill(name);
        await page.getByLabel(/email/i).fill(email);
        // Use exact match to avoid matching "Confirm Password"
        await page.getByLabel("Password", { exact: true }).fill(password);
        await page.getByLabel("Confirm Password").fill(password);
        await page.getByRole("button", { name: /sign up/i }).click();

        // Wait for redirect to dashboard
        await page.waitForURL(/dashboard/, { timeout: 15_000 });
      },

      signIn: async (email: string, password: string) => {
        await page.goto("/auth/sign-in");
        await page.getByLabel(/email/i).fill(email);
        await page.getByLabel(/password/i).fill(password);
        await page.getByRole("button", { name: /sign in/i }).click();

        // Wait for redirect to dashboard
        await page.waitForURL(/dashboard/, { timeout: 15_000 });
      },

      signOut: async () => {
        // Look for user menu or sign out button
        const userMenu = page.locator('[data-testid="user-menu"]');
        if (await userMenu.isVisible()) {
          await userMenu.click();
          await page.getByRole("menuitem", { name: /sign out/i }).click();
        } else {
          // Try direct API call
          await page.evaluate(async () => {
            await fetch("/api/auth/sign-out", {
              method: "POST",
              credentials: "include",
            });
          });
          await page.reload();
        }
      },

      createTestUser: async () => {
        const timestamp = Date.now();
        const user = {
          name: `Test User ${timestamp}`,
          email: `test+${timestamp}@example.com`,
          password: "TestPassword123!",
        };

        await helpers.signUp(user.name, user.email, user.password);
        return user;
      },
    };

    await use(helpers);
  },
});

export { expect };
