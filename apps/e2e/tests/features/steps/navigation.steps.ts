import { expect } from "@playwright/test";
import { isMobileViewport } from "../../../lib/viewport-utils";
import { Given, Then, When, waitForConvexConnection } from "./fixtures";

// Top-level regex pattern for URL matching (required by biome lint)
const TODOS_URL = /\/todos/;

/**
 * Step definition for navigating to the homepage.
 * When used after "I am authenticated", navigates to /todos (dashboard home with sidebar).
 * When used standalone (unauthenticated), navigates to / (public landing page).
 */
Given("I am on the homepage", async ({ page, ctx }) => {
  const activePage = ctx.page || page;
  // Check if user is already authenticated (has visited /todos with user-menu)
  const currentUrl = activePage.url();
  const isAuthenticated = currentUrl.includes("/todos") || currentUrl.includes("/settings");

  if (isAuthenticated) {
    // When authenticated, "homepage" means dashboard home (/todos) where sidebar exists
    await activePage.goto("/todos");
  } else {
    // Unauthenticated - go to public landing page
    await activePage.goto("/");
  }
  // Wait for Convex to connect (avoids "Connection Problem" overlay)
  await waitForConvexConnection(activePage);
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

Then("I should be on the todos page", async ({ page, ctx }) => {
  const activePage = ctx.page || page;
  await activePage.waitForLoadState("networkidle");
  await expect(activePage).toHaveURL(TODOS_URL);
});

Then("the URL should contain {string}", async ({ page, ctx }, urlPart: string) => {
  const activePage = ctx.page || page;
  await expect(activePage).toHaveURL(new RegExp(urlPart));
});

/**
 * Step definition for authenticating a user before protected route navigation.
 * Creates a new account and logs in automatically.
 * After login, waits for redirect to /todos where the user menu is visible.
 */
Given("I am authenticated", async ({ page, ctx }) => {
  const activePage = ctx.page || page;

  // Generate unique email to avoid conflicts
  const uniqueEmail = `nav-test+${Date.now()}@example.com`;

  // Navigate to login to access sign-up form
  await activePage.goto("/login");
  // Wait for Convex to connect (avoids "Connection Problem" overlay)
  await waitForConvexConnection(activePage);

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

  // Wait for redirect to /todos (app redirects there after login)
  await activePage.waitForURL(/\/todos/, { timeout: 15_000 });

  // Wait for authentication to complete with appropriate check
  if (isMobileViewport(activePage)) {
    // On mobile, sidebar has no trigger - verify auth by checking for page content
    await activePage.locator("h1, h2").first().waitFor({ state: "visible", timeout: 10_000 });
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
