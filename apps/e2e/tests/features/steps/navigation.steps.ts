import { expect } from "@playwright/test";
import { isMobileViewport } from "../../../lib/viewport-utils";
import { Given, Then, When } from "./fixtures";

// Top-level regex pattern for URL matching (required by biome lint)
const VEHICLES_URL = /\/vehicles/;
const LOGIN_URL = /\/login/;

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

Then("I should see {string} in the title", async ({ page, ctx }, expectedText: string) => {
  const activePage = ctx.page || page;
  const title = await activePage.title();
  expect(title.toLowerCase()).toContain(expectedText.toLowerCase());
});

/**
 * Click on a navigation item in the sidebar.
 * Uses the data-sidebar attribute from the shadcn/ui sidebar component.
 * On mobile, opens the sidebar Sheet first via the SidebarTrigger.
 */
When("I click on {string} in the sidebar", async ({ page, ctx }, linkText: string) => {
  const activePage = ctx.page || page;

  if (isMobileViewport(activePage)) {
    // On mobile, sidebar is in a Sheet - need to open it first via SidebarTrigger
    const sidebarTrigger = activePage.locator('[data-sidebar="trigger"]');
    await sidebarTrigger.click();
    // Wait for the Sheet to open (data-state="open")
    await activePage.waitForSelector('[data-sidebar="sidebar"][data-mobile="true"]', {
      timeout: 5000,
    });
  }

  // The sidebar uses SidebarMenuButton with data-sidebar="menu-button"
  // and contains links with the text inside a span
  const sidebarLink = activePage.locator(`[data-sidebar="menu-button"]:has-text("${linkText}")`);
  await sidebarLink.click();
});

Then("I should be on the vehicles page", async ({ page, ctx }) => {
  const activePage = ctx.page || page;
  await activePage.waitForLoadState("networkidle");
  await expect(activePage).toHaveURL(VEHICLES_URL);
});

Then("the URL should contain {string}", async ({ page, ctx }, urlPart: string) => {
  const activePage = ctx.page || page;
  await expect(activePage).toHaveURL(new RegExp(urlPart));
});

/**
 * Step definition for authenticating a user before protected route navigation.
 * Creates a new account and logs in automatically.
 */
Given("I am authenticated", async ({ page, ctx }) => {
  const activePage = ctx.page || page;

  // Generate unique email to avoid conflicts
  const uniqueEmail = `nav-test+${Date.now()}@example.com`;

  // Navigate to dashboard to access sign-up form
  await activePage.goto("/dashboard");

  // Wait for form to load
  await activePage.waitForSelector('input[name="email"]', { state: "visible", timeout: 10_000 });

  // Check if we're on sign-in form (no name field) - switch to sign-up
  const nameField = activePage.locator('input[name="name"]');
  const isOnSignUpForm = await nameField.isVisible().catch(() => false);

  if (!isOnSignUpForm) {
    const signUpButton = activePage.getByRole("button", { name: /sign up/i });
    await signUpButton.waitFor({ state: "visible", timeout: 5000 });
    await signUpButton.click();
    await nameField.waitFor({ state: "visible", timeout: 5000 });
  }

  // Fill sign-up form
  await activePage.locator('input[name="name"]').fill("Navigation Test User");
  await activePage.locator('input[name="email"]').fill(uniqueEmail);
  await activePage.locator('input[name="password"]').fill("TestPassword123");

  // Submit
  const submitButton = activePage.getByRole("button", { name: /sign up/i }).first();
  await submitButton.click();

  // Wait for authentication to complete with appropriate check
  if (isMobileViewport(activePage)) {
    // On mobile, sidebar has no trigger - verify auth by checking for authenticated-only content
    await activePage.locator("text=privateData:").waitFor({ state: "visible", timeout: 15_000 });
  } else {
    // Desktop - wait for the user-menu
    await activePage
      .locator('[data-testid="user-menu"]')
      .waitFor({ state: "visible", timeout: 15_000 });
  }

  // Update context
  if (!ctx.page) {
    ctx.page = page;
  }
});

/**
 * Step definition for verifying redirect to login page.
 */
Then("I should be redirected to login", async ({ page, ctx }) => {
  const activePage = ctx.page || page;
  await activePage.waitForLoadState("networkidle");
  await expect(activePage).toHaveURL(LOGIN_URL);
});
