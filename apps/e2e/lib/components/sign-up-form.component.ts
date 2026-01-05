import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { fillFormField, fillPasswordField, submitFormButton } from "../form-utils";

export type SignUpCredentials = {
  name: string;
  email: string;
  password: string;
};

/**
 * Component Object Model for the Sign Up form.
 * Located at /login when user clicks "Sign Up".
 */
export class SignUpFormComponent {
  readonly page: Page;
  readonly heading: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly switchToSignInButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('h1:has-text("Create Account")');
    this.nameInput = page.locator("input#name");
    this.emailInput = page.locator("input#email");
    this.passwordInput = page.locator("input#password");
    this.submitButton = page.locator('button[type="submit"]:has-text("Sign Up")');
    this.switchToSignInButton = page.getByRole("button", {
      name: /already have an account\? sign in/i,
    });
  }

  /**
   * Check if this form is currently visible (sign-up has name field).
   */
  async isVisible(): Promise<boolean> {
    const heading = await this.heading.isVisible();
    const hasNameField = await this.nameInput.isVisible().catch(() => false);
    return heading && hasNameField;
  }

  /**
   * Wait for the sign-up form to be ready.
   */
  async waitForReady(timeout = 10_000): Promise<void> {
    await this.heading.waitFor({ state: "visible", timeout });
    await this.nameInput.waitFor({ state: "visible", timeout });
  }

  /**
   * Assert that the sign-up form is visible.
   */
  async expectVisible(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.nameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
  }

  /**
   * Fill the sign-up form with credentials.
   * Uses type() with delay for React controlled inputs.
   */
  async fill(credentials: SignUpCredentials): Promise<void> {
    // Fill name field
    await fillFormField(this.nameInput, credentials.name);

    // Fill email field
    await fillFormField(this.emailInput, credentials.email);

    // Fill password field with verification
    await fillPasswordField(this.passwordInput, credentials.password);
  }

  /**
   * Submit the form after filling it.
   */
  async submit(): Promise<void> {
    await submitFormButton(this.page, this.submitButton, this.passwordInput);
  }

  /**
   * Complete sign-up flow: fill form and submit.
   */
  async signUp(credentials: SignUpCredentials): Promise<void> {
    await this.waitForReady();
    await this.fill(credentials);
    await this.submit();
  }

  /**
   * Switch to the sign-in form.
   */
  async switchToSignIn(): Promise<void> {
    await this.switchToSignInButton.click();
  }
}
