import { expect } from "@playwright/test";
import { Then, When, waitForConvexConnection } from "./fixtures";

/**
 * Step definition for verifying the hero section is visible.
 * The hero section contains the main headline and CTA buttons.
 */
Then("I should see the hero section", async ({ ctx }) => {
  // Wait for Convex connection first
  await waitForConvexConnection(ctx.page);

  // Hero section has the main headline
  const heroHeading = ctx.page.locator("h1");
  await expect(heroHeading).toBeVisible();
  await expect(heroHeading).toContainText("Build Your SaaS");
});

/**
 * Step definition for verifying a button is visible by text.
 * Also checks for links styled as buttons (anchor tags with Button component).
 * Uses .first() since pages may have multiple buttons with similar text.
 */
Then("I should see {string} button", async ({ ctx }, buttonText: string) => {
  const pattern = new RegExp(buttonText, "i");
  // Try button first, then link (for anchor tags styled as buttons)
  const button = ctx.page.getByRole("button", { name: pattern }).first();
  const link = ctx.page.getByRole("link", { name: pattern }).first();

  // Check if either is visible
  const buttonVisible = await button.isVisible().catch(() => false);
  const linkVisible = await link.isVisible().catch(() => false);

  if (buttonVisible) {
    await expect(button).toBeVisible();
  } else if (linkVisible) {
    await expect(link).toBeVisible();
  } else {
    // Force assertion failure with descriptive error
    await expect(button).toBeVisible({ timeout: 5000 });
  }
});

/**
 * Step definition for clicking on a button by text.
 */
When("I click on {string} button", async ({ ctx }, buttonText: string) => {
  const button = ctx.page.getByRole("button", { name: new RegExp(buttonText, "i") });
  await button.click();
});

/**
 * Step definition for verifying we're on the login page.
 */
Then("I should be on the login page", async ({ ctx }) => {
  await ctx.page.waitForURL(/\/login/);
  await expect(ctx.page).toHaveURL(/\/login/);
});
