import { expect } from "@playwright/test";
import { EXTENDED_TIMEOUT } from "../../../lib/constants";
import { Then, When } from "./fixtures";

/**
 * Step definition for visiting the homepage.
 */
When("I visit the homepage", async ({ page, ctx }) => {
  ctx.page = ctx.page || page;
  await ctx.page.goto("/");
});

/**
 * Step definition for verifying the title banner is visible.
 */
Then("I should see the title banner", async ({ ctx }) => {
  const preBanner = ctx.page.locator("pre");
  await expect(preBanner).toBeVisible();
  await expect(preBanner).toContainText("██");
});

/**
 * Step definition for verifying the API status section is visible.
 */
Then("I should see the API status section", async ({ ctx }) => {
  const apiStatusSection = ctx.page.locator("section").filter({ hasText: "API Status" });
  await expect(apiStatusSection).toBeVisible();
});

/**
 * Step definition for waiting for the API to connect.
 */
When("I wait for the API to connect", async ({ ctx }) => {
  const statusText = ctx.page.locator("section").filter({ hasText: "API Status" }).locator("span");
  await statusText.filter({ hasText: "Connected" }).waitFor({ timeout: EXTENDED_TIMEOUT });
});

/**
 * Step definition for verifying the API status.
 */
Then("the API status should be {string}", async ({ ctx }, expectedStatus: string) => {
  const statusText = ctx.page.locator("section").filter({ hasText: "API Status" }).locator("span");
  await expect(statusText).toContainText(expectedStatus);
});

/**
 * Step definition for verifying a heading is visible.
 */
Then("I should see the {string} heading", async ({ ctx }, headingText: string) => {
  const heading = ctx.page.getByRole("heading", { name: headingText });
  await expect(heading).toBeVisible();
});

/**
 * Step definition for pressing the Tab key.
 */
When("I press the Tab key", async ({ ctx }) => {
  await ctx.page.keyboard.press("Tab");
});

/**
 * Step definition for verifying an element has focus.
 */
Then("an element should have focus", async ({ ctx }) => {
  const focusedElement = ctx.page.locator(":focus");
  await expect(focusedElement).toBeVisible();
});
