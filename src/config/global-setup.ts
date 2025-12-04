/**
 * Global Setup - Runs once before all tests
 * Reference: https://playwright.dev/docs/test-global-setup-teardown
 *
 * Useful for:
 * - Seeding database
 * - Creating test users
 * - Logging in and saving authentication state
 * - Starting test servers
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig): Promise<void> {
  console.log('Running global setup');

  /**
   * Example: Save authenticated state for reuse across tests
   * This allows tests to use storageState fixture
   */
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to login page
    await page.goto('http://localhost:3000/login');

    // Perform login
    await page.fill('input[name="username"]', process.env.TEST_USERNAME || 'testuser@example.com');
    await page.fill('input[name="password"]', process.env.TEST_PASSWORD || 'password123');
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL(/dashboard/);

    // Save authentication state
    // This state can be reused via storageState in config or tests
    await page.context().storageState({ path: 'auth.json' });

    console.log('Authentication state saved');
  } catch (error) {
    console.error(`Global setup failed: ${error}`);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
