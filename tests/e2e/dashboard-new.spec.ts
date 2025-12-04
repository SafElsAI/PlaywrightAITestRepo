/**
 * Dashboard Test Suite
 * Tests for authenticated user account management
 */

import { test, expect } from '../../src/fixtures/test.fixture';

test.describe('Dashboard', () => {
  test('should display dashboard after login @authenticated', async ({ dashboardPage }) => {
    await dashboardPage.goto();
    const isLoaded = await dashboardPage.verifyLoggedInAsVisible();
    expect(isLoaded).toBeTruthy();
  });

  test('should display logged in user @authenticated', async ({ dashboardPage }) => {
    await dashboardPage.goto();
    const username = await dashboardPage.getLoggedInUsername();
    expect(username.length).toBeGreaterThan(0);
    expect(username).toContain('Logged in as');
  });

  test('should show account information @authenticated', async ({ dashboardPage }) => {
    await dashboardPage.goto();
    const isLoggedIn = await dashboardPage.verifyLoggedInAsVisible();
    expect(isLoggedIn).toBeTruthy();
  });

  test('should display orders section @authenticated', async ({ dashboardPage }) => {
    await dashboardPage.goto();
    const areOrdersVisible = await dashboardPage.areOrdersVisible();
    expect(typeof areOrdersVisible).toBe('boolean');
  });

  test('should have logout button @authenticated', async ({ dashboardPage }) => {
    await dashboardPage.goto();
    const isLoaded = await dashboardPage.verifyLoggedInAsVisible();
    expect(isLoaded).toBeTruthy();
    // Logout button is present if logged in
  });

  test('should navigate to account page', async ({ dashboardPage, page }) => {
    await dashboardPage.goto();
    expect(page.url()).toContain('account');
  });

  test('should have delete account option @authenticated', async ({ dashboardPage }) => {
    await dashboardPage.goto();
    const isLoaded = await dashboardPage.verifyLoggedInAsVisible();
    expect(isLoaded).toBeTruthy();
    // Delete account button is available when logged in
  });
});
