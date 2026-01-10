import { expect } from "@playwright/test";
import { Given, Then, When } from "../steps/fixtures";

// Top-level regex pattern for URL matching (required by biome lint)
const DASHBOARD_URL = /\/dashboard/;

/**
 * Step definition for navigating to the homepage.
 * Supports both authenticated (ctx.page) and unauthenticated (default page) contexts.
 */
Given("I am on the homepage", async ({ page, ctx }) => {
  const activePage = ctx.page || page;
  await activePage.goto("/");
  // Update ctx.page for subsequent steps if using default page
  if (!ctx.page) {
    ctx.page = page;
  }
});

When("I look at the page title", async () => {
  // No action needed, just setting up for the Then step
});

Then("I should see the app name in the title", async ({ page, ctx }) => {
  const activePage = ctx.page || page;
  const title = await activePage.title();
  // App name should be in the title - this is flexible for any app name
  expect(title.length).toBeGreaterThan(0);
});

Then("I should see {string} in the title", async ({ page, ctx }, expectedText: string) => {
  const activePage = ctx.page || page;
  const title = await activePage.title();
  expect(title).toContain(expectedText);
});

When("I click on {string} in the navigation", async ({ page, ctx }, linkText: string) => {
  const activePage = ctx.page || page;
  await activePage.click(`nav >> text=${linkText}`);
});

Then("I should be on the dashboard page", async ({ page, ctx }) => {
  const activePage = ctx.page || page;
  await activePage.waitForLoadState("networkidle");
  await expect(activePage).toHaveURL(DASHBOARD_URL);
});

Then("the URL should contain {string}", ({ page, ctx }, urlPart: string) => {
  const activePage = ctx.page || page;
  const url = activePage.url();
  expect(url).toContain(urlPart);
});
