import { Page, Locator } from '@playwright/test';
import { Logger } from '../utils/test-utils';

/**
 * Base Page Object Model class
 * Reference: https://playwright.dev/docs/pom
 *
 * Provides common functionality for all page objects:
 * - Navigation
 * - Implicit waits through web-first locators
 * - Common assertions
 *
 * All page objects should extend this class to inherit common methods
 */
export class BasePage {
  readonly page: Page;
  readonly url: string;

  constructor(page: Page, url: string = '') {
    this.page = page;
    this.url = url;
  }

  /**
   * Navigate to page URL
   * Auto-waits for page load
   * Reference: https://playwright.dev/docs/api/class-page#page-goto
   */
  async goto(): Promise<void> {
    if (!this.url) {
      throw new Error('URL not defined for this page');
    }
    Logger.info(`Navigating to ${this.url}`);
    await this.page.goto(this.url, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Get current page URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Wait for page title
   */
  async waitForTitle(title: string): Promise<void> {
    Logger.info(`Waiting for page title: ${title}`);
    await this.page.waitForFunction(
      (expectedTitle) => document.title === expectedTitle,
      title,
    );
  }

  /**
   * Wait for element to be visible
   * Uses web-first locators for auto-waiting
   * Reference: https://playwright.dev/docs/locators#waiting
   */
  async waitForElementVisible(selector: string, timeout: number = 5000): Promise<void> {
    Logger.debug(`Waiting for element visible: ${selector}`);
    await this.page.locator(selector).waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for element to be hidden
   */
  async waitForElementHidden(selector: string, timeout: number = 5000): Promise<void> {
    Logger.debug(`Waiting for element hidden: ${selector}`);
    await this.page.locator(selector).waitFor({ state: 'hidden', timeout });
  }

  /**
   * Scroll element into view
   */
  async scrollIntoView(selector: string): Promise<void> {
    Logger.debug(`Scrolling element into view: ${selector}`);
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Get all text content from page
   */
  async getPageText(): Promise<string> {
    return this.page.locator('body').innerText();
  }

  /**
   * Take screenshot of current page
   */
  async takeScreenshot(name: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const path = `test-results/screenshots/${name}-${timestamp}.png`;
    Logger.info(`Taking screenshot: ${path}`);
    await this.page.screenshot({ path });
    return path;
  }

  /**
   * Reload page
   */
  async reloadPage(): Promise<void> {
    Logger.info('Reloading page');
    await this.page.reload({ waitUntil: 'domcontentloaded' });
  }

  /**
   * Navigate back
   */
  async goBack(): Promise<void> {
    Logger.info('Navigating back');
    await this.page.goBack({ waitUntil: 'domcontentloaded' });
  }

  /**
   * Navigate forward
   */
  async goForward(): Promise<void> {
    Logger.info('Navigating forward');
    await this.page.goForward({ waitUntil: 'domcontentloaded' });
  }

  /**
   * Pause execution (useful for debugging)
   */
  async pause(): Promise<void> {
    Logger.info('Pausing test execution - opens interactive inspector');
    await this.page.pause();
  }
}
