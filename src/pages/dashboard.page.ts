import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { Logger } from '../utils/test-utils';

/**
 * Dashboard Page Object Model
 * Example of a page after successful login
 * Demonstrates common patterns for testing authenticated pages
 */
export class DashboardPage extends BasePage {
  readonly url = '/dashboard';

  // Navigation
  readonly logoutButton: Locator;
  readonly profileMenu: Locator;
  readonly settingsLink: Locator;

  // Main content
  readonly pageTitle: Locator;
  readonly welcomeMessage: Locator;
  readonly mainContent: Locator;

  // Common actions
  readonly searchInput: Locator;
  readonly searchButton: Locator;

  // Notifications
  readonly notificationBell: Locator;
  readonly notificationDropdown: Locator;
  readonly notificationCount: Locator;

  constructor(page: Page) {
    super(page, '/dashboard');

    // Navigation elements
    this.logoutButton = page.getByRole('button', { name: /logout|sign out/i });
    this.profileMenu = page.locator('[data-testid="profile-menu"]');
    this.settingsLink = page.getByRole('link', { name: /settings/i });

    // Main content
    this.pageTitle = page.getByRole('heading', { level: 1 });
    this.welcomeMessage = page.locator('[data-testid="welcome-message"]');
    this.mainContent = page.locator('main, [role="main"]');

    // Search
    this.searchInput = page.locator('input[type="search"], input[placeholder*="Search"]');
    this.searchButton = page.getByRole('button', { name: /search/i });

    // Notifications
    this.notificationBell = page.locator('[data-testid="notification-bell"]');
    this.notificationDropdown = page.locator('[data-testid="notification-dropdown"]');
    this.notificationCount = page.locator('[data-testid="notification-count"]');
  }

  /**
   * Verify user is on dashboard
   * Useful for test setup verification
   */
  async verifyDashboardLoaded(): Promise<boolean> {
    Logger.info('Verifying dashboard is loaded');
    try {
      await this.pageTitle.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get welcome message text
   */
  async getWelcomeMessage(): Promise<string> {
    Logger.info('Getting welcome message');
    return this.welcomeMessage.innerText();
  }

  /**
   * Perform logout
   */
  async logout(): Promise<void> {
    Logger.info('Clicking logout button');
    await this.logoutButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Open profile menu
   */
  async openProfileMenu(): Promise<void> {
    Logger.info('Opening profile menu');
    await this.profileMenu.click();
  }

  /**
   * Navigate to settings
   */
  async goToSettings(): Promise<void> {
    Logger.info('Navigating to settings');
    await this.settingsLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Search for something
   */
  async search(query: string): Promise<void> {
    Logger.info(`Searching for: ${query}`);
    await this.searchInput.fill(query);
    await this.searchButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get notification count
   */
  async getNotificationCount(): Promise<number> {
    Logger.info('Getting notification count');
    const countText = await this.notificationCount.innerText();
    return parseInt(countText, 10);
  }

  /**
   * Open notifications
   */
  async openNotifications(): Promise<void> {
    Logger.info('Opening notifications');
    await this.notificationBell.click();
    await this.notificationDropdown.waitFor({ state: 'visible' });
  }

  /**
   * Get page title text
   */
  async getPageTitle(): Promise<string> {
    return this.pageTitle.innerText();
  }

  /**
   * Check if main content is visible
   */
  async isMainContentVisible(): Promise<boolean> {
    return this.mainContent.isVisible();
  }
}
