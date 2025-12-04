import { Page, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Logger utility for test execution logging
 * Provides structured logging with timestamps and log levels
 */
export class Logger {
  private static readonly LOG_DIR = 'logs';

  private static ensureLogDir(): void {
    if (!fs.existsSync(this.LOG_DIR)) {
      fs.mkdirSync(this.LOG_DIR, { recursive: true });
    }
  }

  /**
   * Get current timestamp in ISO format
   */
  private static getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Log info level message
   */
  static info(message: string): void {
    const log = `[${this.getTimestamp()}] [INFO] ${message}`;
    console.log(log);
    this.writeToFile(log);
  }

  /**
   * Log warning level message
   */
  static warn(message: string): void {
    const log = `[${this.getTimestamp()}] [WARN] ${message}`;
    console.warn(log);
    this.writeToFile(log);
  }

  /**
   * Log error level message
   */
  static error(message: string): void {
    const log = `[${this.getTimestamp()}] [ERROR] ${message}`;
    console.error(log);
    this.writeToFile(log);
  }

  /**
   * Log debug level message
   */
  static debug(message: string): void {
    if (process.env.DEBUG) {
      const log = `[${this.getTimestamp()}] [DEBUG] ${message}`;
      console.log(log);
      this.writeToFile(log);
    }
  }

  /**
   * Write log to file
   */
  private static writeToFile(log: string): void {
    this.ensureLogDir();
    const logFile = path.join(this.LOG_DIR, `test-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, log + '\n');
  }
}

/**
 * Screenshot utility for capturing test artifacts
 * Helps with debugging and documentation
 */
export class ScreenshotUtil {
  private static readonly SCREENSHOT_DIR = 'test-results/screenshots';

  /**
   * Take screenshot with descriptive name
   * Reference: https://playwright.dev/docs/api/class-page#page-screenshot
   */
  static async takeScreenshot(
    page: Page,
    testName: string,
    stepName: string = 'screenshot',
  ): Promise<string> {
    try {
      if (!fs.existsSync(this.SCREENSHOT_DIR)) {
        fs.mkdirSync(this.SCREENSHOT_DIR, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${testName}-${stepName}-${timestamp}.png`;
      const filepath = path.join(this.SCREENSHOT_DIR, filename);

      await page.screenshot({ path: filepath });
      Logger.info(`Screenshot saved: ${filename}`);
      return filepath;
    } catch (error) {
      Logger.error(`Failed to take screenshot: ${error}`);
      throw error;
    }
  }

  /**
   * Take screenshot of specific element
   */
  static async takeElementScreenshot(
    page: Page,
    selector: string,
    testName: string,
  ): Promise<string> {
    try {
      const locator = page.locator(selector);
      // Ensure element is visible before taking screenshot
      await locator.scrollIntoViewIfNeeded();

      if (!fs.existsSync(this.SCREENSHOT_DIR)) {
        fs.mkdirSync(this.SCREENSHOT_DIR, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${testName}-element-${timestamp}.png`;
      const filepath = path.join(this.SCREENSHOT_DIR, filename);

      await locator.screenshot({ path: filepath });
      Logger.info(`Element screenshot saved: ${filename}`);
      return filepath;
    } catch (error) {
      Logger.error(`Failed to take element screenshot: ${error}`);
      throw error;
    }
  }
}

/**
 * Data generator utility for creating test data
 * Useful for data-driven testing
 */
export class DataGenerator {
  /**
   * Generate unique email address
   */
  static generateEmail(prefix: string = 'test'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}.${timestamp}.${random}@example.com`;
  }

  /**
   * Generate random username
   */
  static generateUsername(prefix: string = 'user'): string {
    const timestamp = Date.now();
    return `${prefix}_${timestamp}`;
  }

  /**
   * Generate random password with complexity
   */
  static generatePassword(length: number = 12): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*';

    const allChars = uppercase + lowercase + numbers + special;
    let password = '';

    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Generate random phone number
   */
  static generatePhoneNumber(): string {
    const areaCode = Math.floor(Math.random() * 900) + 100;
    const exchange = Math.floor(Math.random() * 900) + 100;
    const number = Math.floor(Math.random() * 9000) + 1000;
    return `(${areaCode}) ${exchange}-${number}`;
  }

  /**
   * Generate random date
   */
  static generateRandomDate(startDate: Date = new Date(1980, 0, 1), endDate: Date = new Date()): string {
    const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
    const randomDate = new Date(randomTime);
    return randomDate.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  /**
   * Shuffle array
   */
  static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

/**
 * Wait utility for custom retry logic
 * Reference: https://playwright.dev/docs/best-practices#use-web-first-assertions
 */
export class WaitUtil {
  /**
   * Wait for condition with custom retry logic
   * Provides more control than Playwright's default waits
   */
  static async waitFor(
    condition: () => Promise<boolean>,
    timeout: number = 5000,
    interval: number = 500,
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        if (await condition()) {
          return;
        }
      } catch (error) {
        // Continue waiting if condition throws
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    throw new Error(`Condition not met within ${timeout}ms`);
  }

  /**
   * Wait for URL pattern
   * Auto-retrying until URL matches pattern
   */
  static async waitForUrlMatch(page: Page, urlPattern: RegExp | string, timeout: number = 10000): Promise<void> {
    const condition = async () => {
      const currentUrl = page.url();
      if (typeof urlPattern === 'string') {
        return currentUrl.includes(urlPattern);
      }
      return urlPattern.test(currentUrl);
    };

    await this.waitFor(condition, timeout);
  }

  /**
   * Wait for element attribute value
   */
  static async waitForAttributeValue(
    page: Page,
    selector: string,
    attribute: string,
    value: string,
    timeout: number = 5000,
  ): Promise<void> {
    const condition = async () => {
      const attr = await page.locator(selector).getAttribute(attribute);
      return attr === value;
    };

    await this.waitFor(condition, timeout);
  }
}

/**
 * File operation utilities
 * Reference: https://playwright.dev/docs/input#upload-files
 */
export class FileUtil {
  /**
   * Get absolute path to test data file
   */
  static getTestDataPath(filename: string): string {
    return path.resolve(__dirname, '../../test-data', filename);
  }

  /**
   * Read JSON file from test-data directory
   */
  static readJsonFile<T>(filename: string): T {
    const filepath = this.getTestDataPath(filename);
    const content = fs.readFileSync(filepath, 'utf-8');
    return JSON.parse(content) as T;
  }

  /**
   * Write JSON file to test-results directory
   */
  static writeJsonFile<T>(filename: string, data: T): void {
    const dir = 'test-results';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const filepath = path.join(dir, filename);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * Create temporary test file
   */
  static createTempFile(filename: string, content: string): string {
    const dir = 'test-results/temp';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const filepath = path.join(dir, filename);
    fs.writeFileSync(filepath, content, 'utf-8');
    return filepath;
  }

  /**
   * Delete file
   */
  static deleteFile(filepath: string): void {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  }
}
