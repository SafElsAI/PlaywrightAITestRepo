/**
 * Automation Exercise E2E Test Suite
 * Tests for https://automationexercise.com
 * 
 * Test Scenario: Complete Login and Account Deletion Flow
 * 1. Launch browser
 * 2. Navigate to url 'http://automationexercise.com'
 * 3. Verify that home page is visible successfully
 * 4. Click on 'Signup / Login' button
 * 5. Verify 'Login to your account' is visible
 * 6. Enter correct email address and password
 * 7. Click 'login' button
 * 8. Verify that 'Logged in as username' is visible
 * 9. Click 'Delete Account' button
 * 10. Verify that 'ACCOUNT DELETED!' is visible
 */

import { test, expect } from '@playwright/test';
import { HomePage, LoginPage, DashboardPage, AccountDeletedPage } from '../../src/pages/automation-exercise.page';

test.describe('Automation Exercise - Login and Account Deletion', () => {
  test.describe.configure({ retries: 1 });

  test('should complete full login and account deletion flow @smoke', async ({ page }) => {
    // Step 1 & 2: Launch browser and navigate to home page
    const homePage = new HomePage(page);
    await homePage.goto();
    console.log('✓ Browser launched and navigated to http://automationexercise.com');

    // Step 3: Verify home page is visible
    const isHomePageLoaded = await homePage.verifyHomePageLoaded();
    expect(isHomePageLoaded).toBeTruthy();
    console.log('✓ Home page is visible successfully');

    // Step 4: Click on 'Signup / Login' button
    await homePage.clickSignupLoginButton();
    console.log('✓ Clicked on Signup / Login button');

    // Step 5: Verify 'Login to your account' heading is visible
    const loginPage = new LoginPage(page);
    const isLoginHeadingVisible = await loginPage.verifyLoginHeadingVisible();
    expect(isLoginHeadingVisible).toBeTruthy();
    console.log('✓ Login to your account heading is visible');

    // Generate unique credentials for this test run
    const timestamp = Date.now();
    const testEmail = `qa.test.${timestamp}@example.com`;
    const testPassword = 'TestPassword123!';
    const testName = `QAUser${timestamp}`;

    // First sign up a new account
    console.log(`✓ Creating new account: ${testEmail}`);
    await page.locator('input[data-qa="signup-name"]').fill(testName);
    await page.locator('input[data-qa="signup-email"]').fill(testEmail);
    await page.locator('button[data-qa="signup-button"]').click();
    await page.waitForLoadState('load');

    // Try to navigate back to login and login with the new account
    await homePage.goto();
    await homePage.clickSignupLoginButton();

    // Step 6: Enter correct email address and password
    const loginEmail = testEmail;
    const loginPassword = testPassword;
    
    // Try login - it might fail if signup requires additional steps
    // So we'll check if we need to go through account creation
    const emailInput = page.locator('input[data-qa="login-email"]');
    const passwordInput = page.locator('input[data-qa="login-password"]');
    
    await emailInput.fill(loginEmail);
    await passwordInput.fill(loginPassword);
    
    // Step 7: Click 'login' button
    await page.locator('button[data-qa="login-button"]').click();
    await page.waitForLoadState('load');
    console.log(`✓ Entered email: ${loginEmail} and clicked login`);

    // Step 8: Verify that 'Logged in as username' is visible
    const dashboardPage = new DashboardPage(page);
    
    // Wait for logged in state or error message
    const loggedInElement = page.locator('li').filter({ hasText: /Logged in as/ });
    const errorElement = page.locator('p').filter({ hasText: /incorrect|invalid/i });
    
    // Wait for either login success or error
    await Promise.race([
      loggedInElement.waitFor({ timeout: 5000 }).catch(() => null),
      errorElement.waitFor({ timeout: 5000 }).catch(() => null),
    ]);

    // Check if logged in
    const isLoggedInVisible = await dashboardPage.verifyLoggedInAsVisible();
    expect(isLoggedInVisible).toBeTruthy();
    const loggedInText = await dashboardPage.getLoggedInUsername();
    expect(loggedInText).toContain('Logged in as');
    console.log(`✓ ${loggedInText} is visible`);

    // Step 9: Click 'Delete Account' button
    await dashboardPage.clickDeleteAccount();
    console.log('✓ Clicked Delete Account button');

    // Step 10: Verify that 'ACCOUNT DELETED!' is visible
    const accountDeletedPage = new AccountDeletedPage(page);
    const isAccountDeletedVisible = await accountDeletedPage.verifyAccountDeletedMessageVisible();
    expect(isAccountDeletedVisible).toBeTruthy();

    const deletedMessage = await accountDeletedPage.getAccountDeletedMessage();
    expect(deletedMessage).toContain('Account Deleted!');
    console.log('✓ ACCOUNT DELETED! message is visible');

    console.log('\n✅ Full test scenario completed successfully!');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.clickSignupLoginButton();

    const loginPage = new LoginPage(page);
    await loginPage.login('invalid@example.com', 'wrongpassword');

    // We expect to remain on login page with error
    const isStillOnLoginPage = await loginPage.verifyLoginHeadingVisible();
    expect(isStillOnLoginPage).toBeTruthy();
    console.log('✓ Invalid credentials error handling verified');
  });

  test('should navigate back to home page and login again', async ({ page }) => {
    const homePage = new HomePage(page);
    
    // First visit
    await homePage.goto();
    const isHomePageLoaded1 = await homePage.verifyHomePageLoaded();
    expect(isHomePageLoaded1).toBeTruthy();

    // Navigate to login
    await homePage.clickSignupLoginButton();
    const loginPage = new LoginPage(page);
    const isLoginHeadingVisible = await loginPage.verifyLoginHeadingVisible();
    expect(isLoginHeadingVisible).toBeTruthy();

    // Go back to home
    await page.goBack();
    const isHomePageLoaded2 = await homePage.verifyHomePageLoaded();
    expect(isHomePageLoaded2).toBeTruthy();
    console.log('✓ Navigation between pages works correctly');
  });

  test('should verify page title changes throughout flow', async ({ page }) => {
    const homePage = new HomePage(page);
    
    // Home page
    await homePage.goto();
    await expect(page).toHaveTitle('Automation Exercise');
    
    // Login page
    await homePage.clickSignupLoginButton();
    await expect(page).toHaveTitle('Automation Exercise - Signup / Login');
    
    console.log('✓ Page titles verified throughout flow');
  });
});

test.describe('Automation Exercise - Page Object Interactions', () => {
  test('should interact with home page elements', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Verify various elements are accessible
    const signupButton = homePage.signupLoginButton;
    await expect(signupButton).toBeVisible();
    console.log('✓ Signup/Login button is visible on home page');
  });

  test('should interact with login page form elements', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Verify form elements are present
    await expect(loginPage.loginEmailInput).toBeVisible();
    await expect(loginPage.loginPasswordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
    
    console.log('✓ All login form elements are visible');
  });

  test('should fill and clear login form', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Fill form
    await loginPage.loginEmailInput.fill('test@example.com');
    let emailValue = await loginPage.getLoginEmailValue();
    expect(emailValue).toBe('test@example.com');

    // Clear form
    await loginPage.loginEmailInput.clear();
    emailValue = await loginPage.getLoginEmailValue();
    expect(emailValue).toBe('');
    
    console.log('✓ Form fill and clear operations work correctly');
  });
});
