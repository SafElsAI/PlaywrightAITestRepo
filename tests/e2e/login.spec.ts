/**
 * Example E2E Test Suite: Login Flow
 * Reference: https://playwright.dev/docs/writing-tests
 *
 * Demonstrates:
 * - Using custom fixtures (loginPage, authenticatedPage)
 * - Web-first assertions (auto-retry)
 * - Page Object Model usage
 * - Proper test organization
 * - Error handling and validation
 */

import { test, expect } from '../../src/fixtures/test.fixture';
import { Logger } from '../../src/utils/test-utils';

test.describe('Login Flow', () => {
  /**
   * Test annotations for filtering and metadata
   * Reference: https://playwright.dev/docs/test-annotations
   */
  test.beforeEach(async ({ page }) => {
    Logger.info('Starting login flow test');
    // Could add common setup here
  });

  test.afterEach(async ({ page }, testInfo) => {
    Logger.info(`Test ${testInfo.title} finished with status: ${testInfo.status}`);
    // Could add common teardown or cleanup
  });

  /**
   * Test: Successful login with valid credentials
   *
   * Demonstrates:
   * - Using loginPage fixture
   * - Chaining page object methods
   * - Web-first assertions with auto-retry
   * - URL matching
   */
  test('should login successfully with valid credentials', async ({ loginPage, page }) => {
    // Arrange
    const testUsername = 'user@example.com';
    const testPassword = 'password123';

    // Act
    await loginPage.goto();
    await loginPage.login(testUsername, testPassword);

    // Assert - Web-first assertion with auto-retry
    // This automatically retries until the assertion passes or timeout occurs
    // Reference: https://playwright.dev/docs/test-assertions#auto-waiting
    await expect(page).toHaveURL(/dashboard/);

    // Additional assertion - verify we're on dashboard page
    await expect(page.locator('h1')).toContainText(/dashboard/i);
  });

  /**
   * Test: Login fails with invalid credentials
   *
   * Demonstrates:
   * - Testing error scenarios
   * - Checking error messages
   * - Form validation
   */
  test('should show error with invalid credentials', async ({ loginPage }) => {
    // Arrange
    const invalidUsername = 'invalid@example.com';
    const invalidPassword = 'wrongpassword';

    // Act
    await loginPage.goto();
    await loginPage.login(invalidUsername, invalidPassword);

    // Assert
    // Wait for error message with auto-retry
    const isErrorDisplayed = await loginPage.isErrorDisplayed();
    expect(isErrorDisplayed).toBeTruthy();

    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Invalid credentials');
  });

  /**
   * Test: Login button is disabled with empty fields
   *
   * Demonstrates:
   * - Checking element state
   * - Form validation before submission
   */
  test('should disable login button with empty fields', async ({ loginPage }) => {
    // Arrange & Act
    await loginPage.goto();

    // Assert - button should be disabled initially
    const isEnabled = await loginPage.isLoginButtonEnabled();
    expect(isEnabled).toBeFalsy();
  });

  /**
   * Test: Clear form fields
   *
   * Demonstrates:
   * - Form field manipulation
   * - Getting field values
   */
  test('should clear form fields correctly', async ({ loginPage }) => {
    // Arrange
    await loginPage.goto();
    const testUsername = 'test@example.com';
    const testPassword = 'password123';

    // Act
    await loginPage.fillForm(testUsername, testPassword);
    const usernameBeforeClear = await loginPage.getUsernameValue();
    expect(usernameBeforeClear).toBe(testUsername);

    await loginPage.clearForm();
    const usernameAfterClear = await loginPage.getUsernameValue();

    // Assert
    expect(usernameAfterClear).toBe('');
  });

  /**
   * Test: Remember me functionality
   *
   * Demonstrates:
   * - Checkbox interaction
   * - Checking element state
   */
  test('should toggle remember me checkbox', async ({ loginPage }) => {
    // Arrange & Act
    await loginPage.goto();

    // Assert - checkbox should be unchecked initially
    let isChecked = await loginPage.isRememberMeChecked();
    expect(isChecked).toBeFalsy();

    // Act - Check the checkbox
    await loginPage.rememberMeCheckbox.check();
    isChecked = await loginPage.isRememberMeChecked();

    // Assert
    expect(isChecked).toBeTruthy();
  });

  /**
   * Test: Navigation to forgot password
   */
  test('should navigate to forgot password page', async ({ loginPage, page }) => {
    // Arrange & Act
    await loginPage.goto();
    await loginPage.clickForgotPassword();

    // Assert
    await expect(page).toHaveURL(/forgot-password|reset-password/);
  });

  /**
   * Test: Navigation to sign up
   */
  test('should navigate to sign up page', async ({ loginPage, page }) => {
    // Arrange & Act
    await loginPage.goto();
    await loginPage.clickSignUp();

    // Assert
    await expect(page).toHaveURL(/sign-up|register/);
  });

  /**
   * Test with @tag annotation
   * Use tags to run specific test groups
   * Usage: npx playwright test --grep @smoke
   */
  test('should login successfully @smoke', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login('user@example.com', 'password123');
    await expect(page).toHaveURL(/dashboard/);
  });

  /**
   * Test marked as slow
   * Playwright will allocate more time for this test
   */
  test('should handle slow network login @slow', async ({ loginPage, page }) => {
    // Slow tests might take longer due to network conditions
    test.slow();
    await loginPage.goto();
    await loginPage.login('user@example.com', 'password123');
    await expect(page).toHaveURL(/dashboard/);
  });

  /**
   * Skipped test - use when test is not ready
   */
  test.skip('should implement social login @future', async ({ loginPage }) => {
    // This test is skipped until feature is implemented
    await loginPage.goto();
  });

  /**
   * Fixme test - use for known failures
   */
  test.fixme('should handle session timeout @known-issue', async ({ loginPage }) => {
    // Known issue that needs fixing
    await loginPage.goto();
  });
});

/**
 * Data-driven tests
 * Reference: https://playwright.dev/docs/test-parameterize
 */
test.describe('Login - Data-Driven Tests', () => {
  const testCases = [
    {
      username: 'user1@example.com',
      password: 'password1',
      shouldSucceed: true,
      description: 'Valid credentials 1',
    },
    {
      username: 'user2@example.com',
      password: 'password2',
      shouldSucceed: true,
      description: 'Valid credentials 2',
    },
    {
      username: 'invalid@example.com',
      password: 'wrong',
      shouldSucceed: false,
      description: 'Invalid credentials',
    },
  ];

  for (const testCase of testCases) {
    test(`should handle: ${testCase.description}`, async ({ loginPage, page }) => {
      await loginPage.goto();
      await loginPage.login(testCase.username, testCase.password);

      if (testCase.shouldSucceed) {
        await expect(page).toHaveURL(/dashboard/);
      } else {
        const isErrorDisplayed = await loginPage.isErrorDisplayed();
        expect(isErrorDisplayed).toBeTruthy();
      }
    });
  }
});
