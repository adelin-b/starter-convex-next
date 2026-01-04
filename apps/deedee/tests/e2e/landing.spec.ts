import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("displays hero section with main value proposition", async ({ page }) => {
    await page.goto("/");

    // Wait for loading to complete
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 10_000 });

    // Check main headline
    await expect(page.getByRole("heading", { name: /never lose a lead/i })).toBeVisible();

    // Check CTA buttons - hero has "Start Capturing Leads" and nav has "Get Started"
    await expect(page.getByRole("button", { name: /start capturing leads/i })).toBeVisible();
    await expect(page.getByRole("navigation").getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("displays pricing section with three tiers", async ({ page }) => {
    await page.goto("/");

    // Wait for loading to complete
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 10_000 });

    // Scroll to pricing or check it's present
    await expect(page.getByText(/starter/i).first()).toBeVisible();
    await expect(page.getByText(/professional/i).first()).toBeVisible();
    await expect(page.getByText(/enterprise/i).first()).toBeVisible();
  });

  test("navigates to sign up when clicking Start Capturing Leads", async ({ page }) => {
    await page.goto("/");

    // Wait for loading to complete
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 10_000 });

    await page.getByRole("button", { name: /start capturing leads/i }).click();

    await expect(page).toHaveURL(/sign-up/);
  });

  test("navigates to sign in when clicking Sign In", async ({ page }) => {
    await page.goto("/");

    // Wait for loading to complete
    await expect(page.getByText(/loading/i)).not.toBeVisible({ timeout: 10_000 });

    // Use navigation Sign In button to be specific
    await page.getByRole("navigation").getByRole("button", { name: /sign in/i }).click();

    await expect(page).toHaveURL(/sign-in/);
  });
});
