/**
 * Integration Test Example
 * Tests workflow across multiple features/components
 */

import { test, expect } from '../../src/fixtures/test.fixture';
import { DataGenerator, Logger } from '../../src/utils/test-utils';

test.describe('Integration - Complete User Workflow', () => {
  /**
   * Complete workflow test
   * Demonstrates multiple page objects working together
   */
  test('should complete full user workflow: signup -> login -> logout', async ({
    loginPage,
    dashboardPage,
    page,
  }) => {
    // Step 1: Navigate to login page
    Logger.info('Step 1: Navigate to login page');
    await loginPage.goto();
    await expect(page).toHaveURL(/login/);

    // Step 2: Navigate to sign up (if needed to create new account)
    Logger.info('Step 2: Navigate to sign up');
    await loginPage.clickSignUp();
    await expect(page).toHaveURL(/sign-up|register/);

    // Step 3: Go back to login
    Logger.info('Step 3: Go back to login');
    await page.goBack();
    await expect(page).toHaveURL(/login/);

    // Step 4: Login
    Logger.info('Step 4: Login with credentials');
    await loginPage.login('user@example.com', 'password123');
    await expect(page).toHaveURL(/dashboard/);

    // Step 5: Verify dashboard loaded
    Logger.info('Step 5: Verify dashboard');
    const isDashboardLoaded = await dashboardPage.verifyDashboardLoaded();
    expect(isDashboardLoaded).toBeTruthy();

    // Step 6: Logout
    Logger.info('Step 6: Logout');
    await dashboardPage.logout();
    await expect(page).toHaveURL(/login/);

    Logger.info('Workflow completed successfully');
  });

  /**
   * Test: Using generated test data
   */
  test('should login with generated test user data', async ({
    loginPage,
    dashboardPage,
    page,
  }) => {
    // Generate dynamic test data
    const generatedEmail = DataGenerator.generateEmail('test');
    const generatedPassword = DataGenerator.generatePassword(12);

    Logger.info(`Generated email: ${generatedEmail}`);
    Logger.info(`Generated password: ${generatedPassword}`);

    // Note: In real scenario, would need to create this user first
    await loginPage.goto();
    await loginPage.fillForm(generatedEmail, generatedPassword);

    // Verify form is filled
    const usernameValue = await loginPage.getUsernameValue();
    expect(usernameValue).toBe(generatedEmail);
  });

  /**
   * Test: Multiple form interactions
   */
  test('should fill and submit form correctly', async ({ loginPage, page }) => {
    // Generate test data
    const testUsername = DataGenerator.generateEmail('multitest');
    const testPassword = DataGenerator.generatePassword();

    Logger.info('Starting multi-step form test');

    // Step 1: Navigate to login
    await loginPage.goto();

    // Step 2: Fill username
    await loginPage.usernameInput.fill(testUsername);
    let filledUsername = await loginPage.getUsernameValue();
    expect(filledUsername).toBe(testUsername);

    // Step 3: Fill password
    await loginPage.passwordInput.fill(testPassword);
    let filledPassword = await loginPage.getPasswordValue();
    expect(filledPassword).toBe(testPassword);

    // Step 4: Check remember me
    await loginPage.rememberMeCheckbox.check();
    let isChecked = await loginPage.isRememberMeChecked();
    expect(isChecked).toBeTruthy();

    // Step 5: Uncheck remember me
    await loginPage.rememberMeCheckbox.uncheck();
    isChecked = await loginPage.isRememberMeChecked();
    expect(isChecked).toBeFalsy();

    // Step 6: Clear form
    await loginPage.clearForm();
    filledUsername = await loginPage.getUsernameValue();
    expect(filledUsername).toBe('');
  });
});

test.describe('Integration - Search and Navigation', () => {
  /**
   * Test: Dashboard search workflow
   */
  test('should search and verify results', async ({ authenticatedPage, dashboardPage, page }) => {
    // Arrange
    const searchQuery = 'test query';

    // Act
    await dashboardPage.search(searchQuery);

    // Assert
    const currentUrl = page.url();
    expect(currentUrl.toLowerCase()).toContain('search');
  });

  /**
   * Test: Profile navigation workflow
   */
  test('should navigate through profile menu', async ({
    authenticatedPage,
    dashboardPage,
    page,
  }) => {
    // Act - Open profile menu
    await dashboardPage.openProfileMenu();

    // Assert
    await expect(dashboardPage.profileMenu).toBeVisible();

    // Act - Navigate to settings
    await dashboardPage.goToSettings();

    // Assert
    await expect(page).toHaveURL(/settings/);
  });
});
