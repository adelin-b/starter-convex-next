import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { FORM_VALIDATION_DELAY } from "../../../lib/constants";
import { isMobileViewport } from "../../../lib/viewport-utils";
import { Given, Then, When, waitForConvexConnection } from "./fixtures";

/**
 * Helper to wait for authentication to complete.
 * After login, user is redirected to /todos.
 * On desktop: waits for user-menu to be visible
 * On mobile: waits for Todos heading since sidebar is collapsed
 */
async function waitForAuthenticated(page: Page, timeout = 15_000): Promise<void> {
  // Wait for redirect to /todos
  await page.waitForURL(/\/todos/, { timeout });

  if (isMobileViewport(page)) {
    // On mobile, verify by checking for page header title (uses exact match to avoid matching "No todos yet")
    const pageTitle = page.locator('[data-slot="page-header-title"]');
    await pageTitle.waitFor({ state: "visible", timeout: 10_000 });
  } else {
    // Desktop - wait for the user-menu
    const userMenu = page.locator('[data-testid="user-menu"]');
    await userMenu.waitFor({ state: "visible", timeout });
  }
}

/**
 * Step definition for navigating to the login page.
 * Shows sign-up form by default, with option to switch to sign-in.
 *
 * Usage in feature files:
 *   Given I am on the login page
 */
Given("I am on the login page", async ({ ctx }) => {
  await ctx.page.goto("/login");
  // Wait for Convex to connect (avoids "Connection Problem" overlay)
  await waitForConvexConnection(ctx.page);
});

/**
 * Step definition for signing in manually during a test.
 * The sign-in form appears on /login when unauthenticated.
 * First clicks "Sign In" link to show the sign-in form (default is sign-up form).
 * If a matching account was created earlier, uses the stored unique email.
 *
 * Usage in feature files:
 *   When I sign in with email "test@example.com" and password "password123"
 */
When(
  "I sign in with email {string} and password {string}",
  async ({ ctx }, email: string, password: string) => {
    // Use stored email if available (from "I have an account" step)
    // Only use stored credentials when password matches (valid sign-in test)
    // For invalid password tests, use stored email but wrong password from feature
    const actualEmail = ctx.accountEmail || email;
    const actualPassword = ctx.accountPassword === password ? ctx.accountPassword : password;

    // Wait for form to be ready (either sign-up or sign-in form)
    await ctx.page.waitForSelector('input[name="email"]', { state: "visible", timeout: 10_000 });

    // Now check which form we're on (sign-up has name field, sign-in doesn't)
    const nameField = ctx.page.locator('input[name="name"]');
    const isOnSignUpForm = await nameField.isVisible();

    if (isOnSignUpForm) {
      // On mobile, button clicks can be flaky - use more reliable approach
      const switchButton = ctx.page.getByRole("button", { name: /already have an account/i });
      await switchButton.scrollIntoViewIfNeeded();

      // Wait a moment for any animations to settle
      await ctx.page.waitForTimeout(100);

      // Click and wait for form transition
      await switchButton.click();

      // Wait for name field to disappear (form switch animation)
      // Use polling to handle mobile viewport delays
      await ctx.page
        .waitForFunction(
          () =>
            !document.querySelector('input[name="name"]') ||
            document.querySelector('input[name="name"]')?.closest('[style*="display: none"]'),
          { timeout: 10_000, polling: 200 },
        )
        .catch(async () => {
          // Retry click if form didn't switch
          process.stderr.write("[Auth] Form switch didn't happen, retrying click...\n");
          await switchButton.click();
          await nameField.waitFor({ state: "hidden", timeout: 5000 });
        });
    }

    // Wait for sign-in form email field to be ready
    const emailInput = ctx.page.locator('input[name="email"]');
    await emailInput.waitFor({ state: "visible", timeout: 5000 });

    // Use fill() for controlled inputs - clears and sets value directly
    await emailInput.fill(actualEmail);

    const passwordInput = ctx.page.locator('input[name="password"]');
    await passwordInput.fill(actualPassword);

    // Blur and wait for form validation to complete
    await passwordInput.blur();
    await ctx.page
      .waitForFunction(() => !document.querySelector('button[type="submit"]:disabled'), {
        timeout: FORM_VALIDATION_DELAY * 10,
      })
      .catch((error) => {
        // Form validation timeout - may still be validating, log warning and continue
        process.stderr.write(`[Auth] Form validation wait timed out: ${error.message}\n`);
      });

    // Use submit button inside form (type="submit"), not the switch button
    const submitButton = ctx.page.locator('button[type="submit"]');
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Wait for either success (authenticated content) or error (toast)
    await Promise.race([
      waitForAuthenticated(ctx.page, 15_000),
      ctx.page.waitForSelector('[data-sonner-toast][data-type="error"]', { timeout: 15_000 }),
    ]);
  },
);

/**
 * Step definition for signing up a new user during a test.
 * The sign-up form is shown by default on /login when unauthenticated.
 *
 * Usage in feature files:
 *   When I sign up with name "Test User", email "new@example.com" and password "password123"
 */
When(
  "I sign up with name {string}, email {string} and password {string}",
  async ({ ctx }, name: string, email: string, password: string) => {
    // Generate unique email to avoid conflicts between test runs
    const [localPart, domain] = email.split("@");
    const uniqueEmail = `${localPart}+${Date.now()}@${domain}`;

    // Navigate to login which shows sign-up form by default when unauthenticated
    await ctx.page.goto("/login");
    // Wait for Convex to connect (avoids "Connection Problem" overlay)
    await waitForConvexConnection(ctx.page);

    // Wait for either sign-in or sign-up form to appear
    await ctx.page.waitForSelector('input[name="email"]', { state: "visible", timeout: 10_000 });

    // Check if we're on the sign-in form (no name field) - need to switch to sign-up
    const nameField = ctx.page.locator('input[name="name"]');
    const isOnSignUpForm = await nameField.isVisible().catch(() => false);

    if (!isOnSignUpForm) {
      // Click "Need an account? Sign Up" button to switch to sign-up form
      const signUpButton = ctx.page.getByRole("button", { name: /sign up/i });
      await signUpButton.waitFor({ state: "visible", timeout: 5000 });
      await signUpButton.click();

      // Wait for name field to appear (sign-up form loaded)
      await nameField.waitFor({ state: "visible", timeout: 5000 });
    }

    // Sign-up form is now ready
    await ctx.page.waitForSelector('input[name="name"]', { timeout: 10_000 });

    // Use type() with delays to properly trigger input events on mobile
    await ctx.page.locator('input[name="name"]').click();
    await ctx.page.locator('input[name="name"]').type(name, { delay: 10 });

    await ctx.page.locator('input[name="email"]').click();
    await ctx.page.locator('input[name="email"]').type(uniqueEmail, { delay: 10 });

    await ctx.page.locator('input[name="password"]').click();
    await ctx.page.locator('input[name="password"]').type(password, { delay: 10 });

    // Blur and wait for form validation to complete
    await ctx.page.locator('input[name="password"]').blur();
    await ctx.page
      .waitForFunction(() => !document.querySelector('button[type="submit"]:disabled'), {
        timeout: FORM_VALIDATION_DELAY * 10,
      })
      .catch((error) => {
        // Form validation timeout - may still be validating, log warning and continue
        process.stderr.write(`[Auth] Form validation wait timed out: ${error.message}\n`);
      });

    // Click submit button
    const submitButton = ctx.page.getByRole("button", { name: /sign up/i }).first();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Wait for either:
    // 1. Successful authentication (user-menu or privateData appears)
    // 2. Error toast from server (duplicate email, etc.)
    // 3. Client-side validation error (inline form errors)
    await Promise.race([
      waitForAuthenticated(ctx.page, 15_000),
      ctx.page.waitForSelector('[data-sonner-toast][data-type="error"]', { timeout: 15_000 }),
      ctx.page.locator("text=Invalid email").waitFor({ state: "visible", timeout: 15_000 }),
      ctx.page.locator("text=Password must be").waitFor({ state: "visible", timeout: 15_000 }),
      ctx.page.locator("text=Name must be").waitFor({ state: "visible", timeout: 15_000 }),
    ]);
  },
);

/**
 * Step definition for logging out.
 * On mobile, uses signOut API directly since sidebar has no trigger.
 *
 * Usage in feature files:
 *   When I log out
 */
When("I log out", async ({ ctx }) => {
  if (isMobileViewport(ctx.page)) {
    // On mobile, sidebar has no trigger - call signOut via page context
    try {
      await ctx.page.evaluate(async () => {
        const response = await fetch("/api/auth/sign-out", {
          method: "POST",
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error(`Sign-out failed: ${response.status} ${response.statusText}`);
        }
      });
    } catch (error) {
      process.stderr.write(`[Auth] Mobile sign-out failed: ${(error as Error).message}\n`);
      throw error;
    }
    // Reload to reflect signed-out state
    await ctx.page.reload();
  } else {
    // On desktop, click user menu to reveal logout option
    const userMenu = ctx.page.locator('[data-testid="user-menu"]');
    await userMenu.scrollIntoViewIfNeeded();
    await userMenu.click();

    // Click sign out button
    const signOutButton = ctx.page.getByRole("menuitem", { name: /sign out/i });
    await signOutButton.click();
  }

  // Wait for auth to be cleared (Sign In link appears)
  await ctx.page.waitForSelector('button:has-text("Sign In")', { timeout: 10_000 });
});

/**
 * Step definition for verifying authenticated state.
 * After login, user is redirected to /todos. Verifies by checking URL and user menu.
 * On mobile, checks for todos page content since user-menu is in sidebar.
 *
 * Usage in feature files:
 *   Then I should be logged in
 */
Then("I should be logged in", async ({ ctx }) => {
  // Wait for redirect to /todos (app redirects there after login)
  await ctx.page.waitForURL(/\/todos/, { timeout: 15_000 });

  if (isMobileViewport(ctx.page)) {
    // On mobile, verify by checking for page header title (uses exact match to avoid matching "No todos yet")
    const pageTitle = ctx.page.locator('[data-slot="page-header-title"]');
    await expect(pageTitle).toBeVisible({ timeout: 10_000 });
  } else {
    // On desktop, check for user menu which only appears when authenticated
    const userMenu = ctx.page.locator('[data-testid="user-menu"]');
    await expect(userMenu).toBeVisible({ timeout: 10_000 });
  }
});

/**
 * Step definition for verifying unauthenticated state.
 *
 * Usage in feature files:
 *   Then I should be logged out
 */
Then("I should be logged out", async ({ ctx }) => {
  // Check for sign-in link indicating logged out state
  const signInButton = ctx.page.locator('button:has-text("Sign In")');
  await expect(signInButton).toBeVisible({ timeout: 5000 });
});

/**
 * Step definition for navigating to a page with authenticated context.
 *
 * Usage in feature files:
 *   When I go to "/dashboard"
 */

/**
 * Step definition for verifying sign-in option is visible.
 * When unauthenticated, the login page shows sign-up form with a link to sign-in.
 *
 * Usage in feature files:
 *   Then I should see the sign in option
 */
Then("I should see the sign in option", async ({ ctx }) => {
  // The login page shows sign-up by default with "Already have an account? Sign In" button
  // Use more specific selector to avoid matching "Sign in with Google"
  const signInOption = ctx.page.getByRole("button", { name: /already have an account/i });
  await expect(signInOption).toBeVisible({ timeout: 10_000 });
});

/**
 * Step definition for verifying sign-up form is visible.
 * The dashboard shows sign-up form by default when unauthenticated.
 *
 * Usage in feature files:
 *   Then I should see the sign up form
 */
Then("I should see the sign up form", async ({ ctx }) => {
  // Wait for either form to be visible
  await ctx.page.waitForSelector('input[name="email"]', { state: "visible", timeout: 10_000 });

  // Check if we're on the sign-in form (no name field) - switch to sign-up
  const nameInput = ctx.page.locator('input[name="name"]');
  const isOnSignUpForm = await nameInput.isVisible().catch(() => false);

  if (!isOnSignUpForm) {
    // Click "Need an account? Sign Up" button to switch to sign-up form
    const signUpButton = ctx.page.getByRole("button", { name: /sign up/i });
    await signUpButton.waitFor({ state: "visible", timeout: 5000 });
    await signUpButton.click();

    // Wait for name field to appear
    await nameInput.waitFor({ state: "visible", timeout: 5000 });
  }

  // Now verify sign-up form elements
  const emailInput = ctx.page.locator('input[name="email"]');
  const passwordInput = ctx.page.locator('input[name="password"]');
  await expect(nameInput).toBeVisible({ timeout: 10_000 });
  await expect(emailInput).toBeVisible();
  await expect(passwordInput).toBeVisible();
});

/**
 * Step definition for creating a test account before signing in.
 * This creates an account via the sign-up form, then logs out.
 * Stores the actual email/password in context for subsequent sign-in steps.
 *
 * Usage in feature files:
 *   Given I have an account with email "test@example.com" and password "password123"
 */
Given(
  "I have an account with email {string} and password {string}",
  async ({ ctx }, email: string, password: string) => {
    // Generate unique email to avoid conflicts between test runs
    const [localPart, domain] = email.split("@");
    const uniqueEmail = `${localPart}+${Date.now()}@${domain}`;

    // Store credentials in context for sign-in step to use
    ctx.accountEmail = uniqueEmail;
    ctx.accountPassword = password;

    await ctx.page.goto("/login");
    // Wait for Convex to connect (avoids "Connection Problem" overlay)
    await waitForConvexConnection(ctx.page);

    // Wait for either sign-in or sign-up form to appear
    await ctx.page.waitForSelector('input[name="email"]', { state: "visible", timeout: 10_000 });

    // Check if we're on the sign-in form (no name field) - need to switch to sign-up
    const nameField = ctx.page.locator('input[name="name"]');
    const isOnSignUpForm = await nameField.isVisible().catch(() => false);

    if (!isOnSignUpForm) {
      // Click "Need an account? Sign Up" button to switch to sign-up form
      const signUpButton = ctx.page.getByRole("button", { name: /sign up/i });
      await signUpButton.waitFor({ state: "visible", timeout: 5000 });
      await signUpButton.click();

      // Wait for name field to appear (sign-up form loaded)
      await nameField.waitFor({ state: "visible", timeout: 5000 });
    }

    // Sign-up form is now ready
    await ctx.page.waitForSelector('input[name="name"]', { timeout: 10_000 });

    // Use type() with delays to properly trigger input events on mobile
    await ctx.page.locator('input[name="name"]').click();
    await ctx.page.locator('input[name="name"]').type("Test User", { delay: 10 });

    await ctx.page.locator('input[name="email"]').click();
    await ctx.page.locator('input[name="email"]').type(uniqueEmail, { delay: 10 });

    await ctx.page.locator('input[name="password"]').click();
    await ctx.page.locator('input[name="password"]').type(password, { delay: 10 });

    // Blur and wait for form validation to complete
    await ctx.page.locator('input[name="password"]').blur();
    await ctx.page
      .waitForFunction(() => !document.querySelector('button[type="submit"]:disabled'), {
        timeout: FORM_VALIDATION_DELAY * 10,
      })
      .catch((error) => {
        // Form validation timeout - may still be validating, log warning and continue
        process.stderr.write(`[Auth] Form validation wait timed out: ${error.message}\n`);
      });

    // Click submit button
    const submitButton = ctx.page.getByRole("button", { name: /sign up/i }).first();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Wait for successful signup (handles mobile sidebar)
    await waitForAuthenticated(ctx.page, 15_000);

    // Log out so we can test sign-in
    if (isMobileViewport(ctx.page)) {
      // On mobile, sidebar has no trigger - call signOut via API
      try {
        await ctx.page.evaluate(async () => {
          const response = await fetch("/api/auth/sign-out", {
            method: "POST",
            credentials: "include",
          });
          if (!response.ok) {
            throw new Error(`Sign-out failed: ${response.status} ${response.statusText}`);
          }
        });
      } catch (error) {
        process.stderr.write(`[Auth] Mobile sign-out failed: ${(error as Error).message}\n`);
        throw error;
      }
      await ctx.page.reload();
    } else {
      // On desktop, click user menu
      const userMenu = ctx.page.locator('[data-testid="user-menu"]');
      await userMenu.scrollIntoViewIfNeeded();
      await userMenu.click();

      // Click sign out button
      const signOutButton = ctx.page.getByRole("menuitem", { name: /sign out/i });
      await signOutButton.click();
    }

    // Wait for auth to be cleared
    await ctx.page.waitForSelector('button:has-text("Sign In")', { timeout: 10_000 });
  },
);

/**
 * Step definition for verifying authentication error is displayed.
 *
 * Usage in feature files:
 *   Then I should see an authentication error
 */
Then("I should see an authentication error", async ({ ctx }) => {
  // Look for Sonner error toast - Better-Auth uses toast.error() for auth failures
  const errorToast = ctx.page.locator('[data-sonner-toast][data-type="error"]');
  await expect(errorToast).toBeVisible({ timeout: 10_000 });
});

/**
 * Step definition for verifying user menu is not visible (user is unauthenticated).
 * On mobile, checks for unauthenticated content (login form) instead.
 *
 * Usage in feature files:
 *   Then I should not see the user menu
 */
Then("I should not see the user menu", async ({ ctx }) => {
  if (isMobileViewport(ctx.page)) {
    // On mobile, user-menu is always hidden - verify by checking for login form (email input visible)
    const emailInput = ctx.page.locator('input[name="email"]');
    await expect(emailInput).toBeVisible({ timeout: 5000 });
  } else {
    const userMenu = ctx.page.locator('[data-testid="user-menu"]');
    await expect(userMenu).not.toBeVisible();
  }
});

/**
 * Step definition for verifying validation error message is displayed.
 *
 * Usage in feature files:
 *   Then I should see validation error "Invalid email address"
 */
Then("I should see validation error {string}", async ({ ctx }, errorMessage: string) => {
  const errorElement = ctx.page.locator(`text=${errorMessage}`);
  await expect(errorElement).toBeVisible({ timeout: 5000 });
});

/**
 * Step definition for attempting to sign up with an existing email.
 * Uses the email stored in ctx.accountEmail from "I have an account" step.
 *
 * Usage in feature files:
 *   When I try to sign up with the existing email and password "password123"
 */
When(
  "I try to sign up with the existing email and password {string}",
  async ({ ctx }, password: string) => {
    if (!ctx.accountEmail) {
      throw new Error("No account email stored in context. Use 'I have an account' step first.");
    }

    // Wait for either sign-in or sign-up form to appear
    await ctx.page.waitForSelector('input[name="email"]', { state: "visible", timeout: 10_000 });

    // Check if we're on the sign-in form (no name field) - need to switch to sign-up
    const nameField = ctx.page.locator('input[name="name"]');
    const isOnSignUpForm = await nameField.isVisible().catch(() => false);

    if (!isOnSignUpForm) {
      // Click "Need an account? Sign Up" button to switch to sign-up form
      const signUpButton = ctx.page.getByRole("button", { name: /sign up/i });
      await signUpButton.waitFor({ state: "visible", timeout: 5000 });
      await signUpButton.click();

      // Wait for name field to appear (sign-up form loaded)
      await nameField.waitFor({ state: "visible", timeout: 5000 });
    }

    // Wait for sign-up form to be ready
    await ctx.page.waitForSelector('input[name="name"]', { timeout: 10_000 });

    // Fill form with the existing email (no timestamp suffix)
    await ctx.page.locator('input[name="name"]').click();
    await ctx.page.locator('input[name="name"]').type("Duplicate User", { delay: 10 });

    await ctx.page.locator('input[name="email"]').click();
    await ctx.page.locator('input[name="email"]').type(ctx.accountEmail, { delay: 10 });

    await ctx.page.locator('input[name="password"]').click();
    await ctx.page.locator('input[name="password"]').type(password, { delay: 10 });

    // Blur and wait for form validation to complete
    await ctx.page.locator('input[name="password"]').blur();
    await ctx.page
      .waitForFunction(() => !document.querySelector('button[type="submit"]:disabled'), {
        timeout: FORM_VALIDATION_DELAY * 10,
      })
      .catch((error) => {
        process.stderr.write(`[Auth] Form validation wait timed out: ${error.message}\n`);
      });

    // Click submit
    const submitButton = ctx.page.getByRole("button", { name: /sign up/i }).first();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Wait for error response (don't wait for success since we expect failure)
    await ctx.page.waitForSelector('[data-sonner-toast][data-type="error"]', { timeout: 15_000 });
  },
);

/**
 * Step definition for switching to sign-in form.
 *
 * Usage in feature files:
 *   When I switch to sign in form
 */
When("I switch to sign in form", async ({ ctx }) => {
  // Wait for either form to be visible
  await ctx.page.waitForSelector('input[name="email"]', { state: "visible", timeout: 10_000 });

  // Check if we're already on sign-in form (no name field)
  const nameField = ctx.page.locator('input[name="name"]');
  const isOnSignUpForm = await nameField.isVisible().catch(() => false);

  if (isOnSignUpForm) {
    // On sign-up form, click to switch to sign-in
    const switchButton = ctx.page.getByRole("button", { name: /already have an account/i });
    await switchButton.waitFor({ state: "visible", timeout: 5000 });
    await switchButton.click();

    // Wait for name field to disappear (indicates sign-in form)
    await nameField.waitFor({ state: "hidden", timeout: 5000 });
  }
  // If already on sign-in form, no action needed
});

/**
 * Step definition for verifying the sign-in form is visible.
 *
 * Usage in feature files:
 *   Then I should see the sign in form
 */
Then("I should see the sign in form", async ({ ctx }) => {
  // Sign-in form has email and password but NOT name field
  const emailInput = ctx.page.locator('input[name="email"]');
  const passwordInput = ctx.page.locator('input[name="password"]');
  const nameInput = ctx.page.locator('input[name="name"]');
  await expect(emailInput).toBeVisible({ timeout: 5000 });
  await expect(passwordInput).toBeVisible();
  await expect(nameInput).not.toBeVisible();
});
