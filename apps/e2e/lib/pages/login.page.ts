import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { SignInFormComponent, SignUpFormComponent } from "../components";
import { BasePage } from "./base.page";

/**
 * Page Object for the Login page (/login).
 * Handles both sign-in and sign-up flows.
 */
export class LoginPage extends BasePage {
  readonly signInForm: SignInFormComponent;
  readonly signUpForm: SignUpFormComponent;

  constructor(page: Page) {
    super(page);
    this.signInForm = new SignInFormComponent(page);
    this.signUpForm = new SignUpFormComponent(page);
  }

  /**
   * Navigate to the login page.
   */
  async goto(): Promise<void> {
    await this.page.goto("/login");
  }

  /**
   * Wait for the login page to be ready.
   */
  async waitForReady(timeout = 10_000): Promise<void> {
    // Wait for either sign-in or sign-up form to be visible
    await this.page
      .locator('h1:has-text("Welcome Back"), h1:has-text("Create Account")')
      .first()
      .waitFor({ state: "visible", timeout });
  }

  /**
   * Assert that we're on the login page.
   */
  async expectToBeOnLoginPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/login/);
  }

  /**
   * Check if the sign-in form is currently displayed.
   */
  async isSignInFormVisible(): Promise<boolean> {
    return this.signInForm.isVisible();
  }

  /**
   * Check if the sign-up form is currently displayed.
   */
  async isSignUpFormVisible(): Promise<boolean> {
    return this.signUpForm.isVisible();
  }

  /**
   * Complete sign-in flow with credentials.
   */
  async signIn(email: string, password: string): Promise<void> {
    await this.signInForm.signIn({ email, password });
  }

  /**
   * Complete sign-up flow with credentials.
   */
  async signUp(name: string, email: string, password: string): Promise<void> {
    await this.signUpForm.signUp({ name, email, password });
  }
}
