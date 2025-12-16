import type { Page } from "@playwright/test";
import { test as base, createBdd } from "playwright-bdd";

/**
 * Context object that holds the authenticated page instance.
 * This allows sharing state between BDD steps while managing
 * browser context lifecycle properly.
 */
export type TestContext = {
  page: Page;
};

/**
 * Extended test fixture that provides a ctx object for auth-in-steps pattern.
 * The ctx is initialized empty and populated by the authentication step.
 * This pattern allows dynamic authentication based on user roles/scenarios.
 */
export const test = base.extend<{ ctx: TestContext }>({
  /* biome-ignore lint/correctness/noEmptyPattern: Playwright fixture API requires empty destructure for fixtures without dependencies */
  ctx: async ({}, use, testInfo) => {
    const context = {} as TestContext;
    await use(context);

    // Clean up the browser context after test completes
    // Skip cleanup on timeout to avoid hanging
    if (testInfo.status === "timedOut") {
      return;
    }
    await context.page?.context().close();
  },
});

export const { Given, When, Then } = createBdd(test);
