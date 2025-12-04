import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { Logger } from '../utils/test-utils';

/**
 * Login Page Object Model
 * Reference: https://playwright.dev/docs/pom
 *
 * Encapsulates:
 * - Locators for login form elements using web-first selectors
 * - Methods for user interactions
 * - Page-specific assertions
 *
 * Benefits:
 * - Centralized element management
 * - Reusable methods across tests
 * - Easy to maintain when UI changes
 * - Clear test intent
 */
export class LoginPage extends BasePage {
  // Page URL - can be overridden via constructor
  readonly url = '/login';

  // Locators using web-first selectors
  // Reference: https://playwright.dev/docs/locators#picking-a-locator

  // Use getByRole for accessibility-first approach
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly forgotPasswordLink: Locator;
  readonly signUpLink: Locator;

  // Error messages
  readonly errorMessage: Locator;
  readonly usernameError: Locator;
  readonly passwordError: Locator;

  // Success indicator
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page, '/login');

    // Initialize locators using various strategies based on available selectors
    // Primary: getByLabel (accessibility), getByPlaceholder, getByRole
    // Fallback: locator with data-testid
    // Last resort: CSS selectors (less maintainable)

    this.usernameInput = page.locator('input[type="text"][name="username"], input[placeholder*="Username"]');
    this.passwordInput = page.locator('input[type="password"][name="password"], input[placeholder*="Password"]');
    this.loginButton = page.getByRole('button', { name: /login|sign in/i });
    this.rememberMeCheckbox = page.locator('input[type="checkbox"]');
    this.forgotPasswordLink = page.getByRole('link', { name: /forgot/i });
    this.signUpLink = page.getByRole('link', { name: /sign up|register/i });

    this.errorMessage = page.locator('[role="alert"], .error-message, .alert-danger');
    this.usernameError = page.locator('[data-testid="username-error"]');
    this.passwordError = page.locator('[data-testid="password-error"]');
    this.successMessage = page.locator('[role="alert"].success, .alert-success');
  }

  /**
   * Perform login with username and password
   * Demonstrates chaining multiple interactions
   *
   * Auto-waiting behavior:
   * - Each action waits for element to be actionable
   * - No manual waits needed
   */
  async login(username: string, password: string): Promise<void> {
    Logger.info(`Logging in with username: ${username}`);

    // Fill username - auto-waits for input to be visible and ready
    await this.usernameInput.fill(username);
    Logger.debug('Username filled');

    // Fill password
    await this.passwordInput.fill(password);
    Logger.debug('Password filled');

    // Click login button
    await this.loginButton.click();
    Logger.info('Login button clicked');

    // Wait for navigation to complete
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Login with remember me option
   */
  async loginWithRememberMe(username: string, password: string): Promise<void> {
    Logger.info('Logging in with remember me option');

    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.rememberMeCheckbox.check();
    await this.loginButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Clear form fields
   */
  async clearForm(): Promise<void> {
    Logger.info('Clearing login form');
    await this.usernameInput.clear();
    await this.passwordInput.clear();
  }

  /**
   * Get error message text
   * Demonstrates web-first assertion approach
   */
  async getErrorMessage(): Promise<string> {
    Logger.info('Getting error message');
    // Auto-waits for element to be visible with default timeout
    await this.errorMessage.waitFor({ state: 'visible', timeout: 5000 });
    return this.errorMessage.innerText();
  }

  /**
   * Check if error message is displayed
   */
  async isErrorDisplayed(): Promise<boolean> {
    Logger.debug('Checking if error is displayed');
    return this.errorMessage.isVisible();
  }

  /**
   * Check if login button is enabled
   */
  async isLoginButtonEnabled(): Promise<boolean> {
    Logger.debug('Checking if login button is enabled');
    return this.loginButton.isEnabled();
  }

  /**
   * Get username input value
   */
  async getUsernameValue(): Promise<string | null> {
    return this.usernameInput.inputValue();
  }

  /**
   * Get password input value
   */
  async getPasswordValue(): Promise<string | null> {
    return this.passwordInput.inputValue();
  }

  /**
   * Click forgot password link
   */
  async clickForgotPassword(): Promise<void> {
    Logger.info('Clicking forgot password link');
    await this.forgotPasswordLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Click sign up link
   */
  async clickSignUp(): Promise<void> {
    Logger.info('Clicking sign up link');
    await this.signUpLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Check if remember me is checked
   */
  async isRememberMeChecked(): Promise<boolean> {
    return this.rememberMeCheckbox.isChecked();
  }

  /**
   * Fill form without submitting
   */
  async fillForm(username: string, password: string): Promise<void> {
    Logger.info('Filling login form');
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
  }

  /**
   * Submit login form
   * Separated from login method for more granular control
   */
  async submitForm(): Promise<void> {
    Logger.info('Submitting login form');
    await this.loginButton.click();
    await this.page.waitForLoadState('networkidle');
  }
}
