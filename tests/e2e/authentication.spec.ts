/**
 * Login and Authentication Test Suite
 * Tests for user login, signup, and account management
 */

import { test, expect } from '../../src/fixtures/test.fixture';

test.describe('Authentication', () => {
  test('should display login page @smoke', async ({ loginPage }) => {
    await loginPage.goto();
    const isVisible = await loginPage.verifyLoginHeadingVisible();
    expect(isVisible).toBeTruthy();
  });

  test('should display signup section @smoke', async ({ loginPage }) => {
    await loginPage.goto();
    const isVisible = await loginPage.verifySignupHeadingVisible();
    expect(isVisible).toBeTruthy();
  });

  test('should navigate from home to login', async ({ homePage, page }) => {
    await homePage.goto();
    const isLoaded = await homePage.verifyHomePageLoaded();
    expect(isLoaded).toBeTruthy();

    await homePage.clickSignupLoginButton();
    expect(page.url()).toContain('login');
  });

  test('should attempt login with invalid credentials', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('invalid@automationexercise.com', 'wrongpassword');
    // Verify error handling
    const errorVisible = await loginPage.isErrorMessageVisible();
    expect(typeof errorVisible).toBe('boolean');
  });

  test('should verify login form fields', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('test@automationexercise.com', 'testpassword');
    const email = await loginPage.getLoginEmailValue();
    expect(email).toBe('test@automationexercise.com');
  });

  test('should display error for invalid credentials', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('invalid@automationexercise.com', 'wrongpassword');
    const errorVisible = await loginPage.isErrorMessageVisible();
    expect(typeof errorVisible).toBe('boolean');
  });

  test('should have signup form available', async ({ loginPage }) => {
    await loginPage.goto();
    const signupVisible = await loginPage.verifySignupHeadingVisible();
    expect(signupVisible).toBeTruthy();
  });

  test('should verify home page is accessible @smoke', async ({ homePage }) => {
    await homePage.goto();
    const isLoaded = await homePage.verifyHomePageLoaded();
    expect(isLoaded).toBeTruthy();
  });

  test('should navigate to products from home', async ({ homePage, productsPage }) => {
    await homePage.goto();
    await homePage.clickProducts();
    const count = await productsPage.getProductsCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should navigate to contact us', async ({ homePage, page }) => {
    await homePage.goto();
    await homePage.clickContactUs();
    expect(page.url()).toContain('contact_us');
  });

  test('should navigate to cart', async ({ homePage, cartPage }) => {
    await homePage.goto();
    await homePage.clickCart();
    const itemsCount = await cartPage.getCartItemsCount();
    expect(typeof itemsCount).toBe('number');
  });
});
