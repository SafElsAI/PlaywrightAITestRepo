import { test as base, Page, expect } from '@playwright/test';
import {
  HomePage,
  LoginPage,
  ProductsPage,
  ProductDetailsPage,
  DashboardPage,
  CartPage,
  CheckoutPage,
  ContactUsPage,
} from '../pages';
import { ApiHelper } from '../utils';
import { getCredentials, getBaseUrl } from '../config/environments';
import { Logger } from '../utils/test-utils';

/**
 * Custom Fixtures for Playwright - Automation Exercise Framework
 * Reference: https://playwright.dev/docs/test-fixtures
 *
 * Fixtures provide:
 * - Isolated test environments with automatic setup/teardown
 * - Page Object Model integration
 * - Authenticated state management
 * - Reusable test data and utilities
 *
 * Key benefits:
 * - On-demand initialization - only loaded fixtures are set up
 * - Composable - fixtures can depend on each other
 * - Automatic cleanup - teardown happens automatically
 * - Worker-scoped fixtures for expensive resources
 */

/**
 * Type definition for custom fixtures
 */
export type AutomationExerciseFixtures = {
  // Page objects
  homePage: HomePage;
  loginPage: LoginPage;
  productsPage: ProductsPage;
  productDetailsPage: ProductDetailsPage;
  dashboardPage: DashboardPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  contactUsPage: ContactUsPage;

  // Authenticated page with pre-login state
  authenticatedPage: Page;

  // API helper
  apiHelper: ApiHelper;

  // Test data
  testData: TestData;
};

/**
 * Test data interface
 */
export interface TestData {
  validCredentials: {
    email: string;
    password: string;
  };
  invalidCredentials: {
    email: string;
    password: string;
  };
  testUser: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  };
  testProduct: {
    id: number;
    name: string;
  };
}

/**
 * Extended test with custom fixtures
 *
 * Usage in tests:
 * ```typescript
 * test('homepage test', async ({ homePage }) => {
 *   await homePage.goto();
 *   const loaded = await homePage.verifyHomePageLoaded();
 *   expect(loaded).toBeTruthy();
 * });
 * ```
 */
export const test = base.extend<AutomationExerciseFixtures>({
  /**
   * Home Page fixture - No setup required
   */
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  /**
   * Login Page fixture - No setup required
   */
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  /**
   * Products Page fixture - No setup required
   */
  productsPage: async ({ page }, use) => {
    const productsPage = new ProductsPage(page);
    await use(productsPage);
  },

  /**
   * Product Details Page fixture - No setup required
   */
  productDetailsPage: async ({ page }, use) => {
    const productDetailsPage = new ProductDetailsPage(page);
    await use(productDetailsPage);
  },

  /**
   * Dashboard Page fixture - No setup required
   */
  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },

  /**
   * Cart Page fixture - No setup required
   */
  cartPage: async ({ page }, use) => {
    const cartPage = new CartPage(page);
    await use(cartPage);
  },

  /**
   * Checkout Page fixture - No setup required
   */
  checkoutPage: async ({ page }, use) => {
    const checkoutPage = new CheckoutPage(page);
    await use(checkoutPage);
  },

  /**
   * Contact Us Page fixture - No setup required
   */
  contactUsPage: async ({ page }, use) => {
    const contactUsPage = new ContactUsPage(page);
    await use(contactUsPage);
  },

  /**
   * Authenticated Page fixture
   * Setup: Navigate to login, perform login, verify dashboard
   * Teardown: Automatic via context/page cleanup
   */
  authenticatedPage: async ({ page }, use) => {
    Logger.info('Setting up authenticated page');

    const credentials = getCredentials();
    const baseUrl = getBaseUrl();

    try {
      // Navigate to login
      await page.goto(`${baseUrl}/login`);

      // Perform login
      const loginPage = new LoginPage(page);
      await loginPage.login(credentials.username, credentials.password);

      // Verify we're authenticated
      const dashboardPage = new DashboardPage(page);
      const isAuthenticated = await dashboardPage.verifyLoggedInAsVisible();

      if (!isAuthenticated) {
        throw new Error('Failed to authenticate - not on dashboard');
      }

      Logger.info('Authenticated page ready');

      // Pass the page to test
      await use(page);

      // Optional: Cleanup after test (explicit logout)
      Logger.info('Cleaning up authenticated page');
      try {
        await dashboardPage.clickLogout();
      } catch (error) {
        Logger.warn('Logout failed during cleanup');
      }
    } catch (error) {
      Logger.error(`Failed to setup authenticated page: ${error}`);
      throw error;
    }
  },

  /**
   * API Helper fixture
   * Setup: Initialize API helper with base URL
   */
  apiHelper: async ({ request }, use) => {
    const apiBaseUrl = process.env.API_BASE_URL || 'https://automationexercise.com/api';
    const apiHelper = new ApiHelper(request, apiBaseUrl);
    Logger.info('API helper initialized');
    await use(apiHelper);
  },

  /**
   * Test Data fixture
   * Provides consistent test data across all tests
   */
  testData: async ({}, use) => {
    const credentials = getCredentials();
    const testData: TestData = {
      validCredentials: {
        email: credentials.username,
        password: credentials.password,
      },
      invalidCredentials: {
        email: 'invalid@automationexercise.com',
        password: 'wrongpassword',
      },
      testUser: {
        firstName: 'QA',
        lastName: 'Engineer',
        email: `qa.user.${Date.now()}@automationexercise.com`,
        password: 'QATestPass123!',
      },
      testProduct: {
        id: 1,
        name: 'Blue Top',
      },
    };

    Logger.info('Test data fixture loaded');
    await use(testData);
  },
});

/**
 * Re-export expect for convenience
 * Allows: import { test, expect } from './fixtures'
 */
export { expect };
