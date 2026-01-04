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
 * Uses .first() since pages may have multiple buttons with similar text (e.g., "Get Started" in hero and pricing cards).
 */
Then("I should see {string} button", async ({ ctx }, buttonText: string) => {
  const button = ctx.page.getByRole("button", { name: new RegExp(buttonText, "i") }).first();
  await expect(button).toBeVisible();
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
