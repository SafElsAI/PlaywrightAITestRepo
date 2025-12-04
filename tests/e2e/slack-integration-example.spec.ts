/**
 * Example test demonstrating Slack integration
 * Shows both notification types and usage patterns
 */

import { test, expect } from '@playwright/test';
import SlackNotifier from '../../src/utils/slack-notifier';
import path from 'path';

test.describe('Slack Integration Examples', () => {
  let notifier: SlackNotifier;
  const testResultsDir = path.join(process.cwd(), 'test-results', 'slack-examples');

  test.beforeAll(async () => {
    // Initialize notifier once per test suite
    notifier = SlackNotifier.getInstance();
  });

  test('Example 1: Simple notification (webhook method)', async ({ page, browserName }) => {
    const testName = 'Simple Notification Example';
    const startTime = Date.now();

    try {
      await page.goto('https://automationexercise.com');
      
      // Verify page loaded
      const title = await page.title();
      expect(title).toContain('Automation');

      // Send success notification
      await notifier.notify({
        testName: testName,
        status: 'passed',
        duration: Date.now() - startTime,
        browser: browserName,
        timestamp: new Date().toISOString(),
      });

      console.log('✓ Notification sent successfully');
    } catch (error) {
      // Send failure notification
      await notifier.notify({
        testName: testName,
        status: 'failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        browser: browserName,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  });

  test('Example 2: Notification with error details (bot token method)', async ({ page, browserName }) => {
    const testName = 'Error Details Example';
    const startTime = Date.now();

    try {
      await page.goto('https://automationexercise.com');

      // Intentionally fail to demonstrate error reporting
      const nonExistentElement = await page.locator('button:has-text("Non-existent")').count();
      expect(nonExistentElement).toBeGreaterThan(0);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Send detailed failure notification
      await notifier.notify({
        testName: testName,
        status: 'failed',
        duration: Date.now() - startTime,
        error: errorMessage,
        browser: browserName,
        timestamp: new Date().toISOString(),
      });

      console.log('✓ Error notification sent with details');
    }
  });

  test('Example 3: Screenshot upload on failure (bot token method)', async ({
    page,
    browserName,
  }) => {
    const testName = 'Screenshot Upload Example';
    const startTime = Date.now();
    const screenshotPath = path.join(testResultsDir, 'failure-screenshot.png');

    try {
      await page.goto('https://automationexercise.com');

      // Simulate test failure
      throw new Error('Simulated test failure for screenshot capture');
    } catch (error) {
      // Capture screenshot on failure
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Screenshot saved to: ${screenshotPath}`);

      // Send notification with screenshot
      // Note: Requires SLACK_METHOD=bot-token and SLACK_UPLOAD_SCREENSHOTS=true
      await notifier.notify({
        testName: testName,
        status: 'failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        browser: browserName,
        timestamp: new Date().toISOString(),
        screenshotPath: screenshotPath, // File will be uploaded to Slack
      });

      console.log('✓ Failure notification with screenshot sent');
    }
  });

  test('Example 4: Multiple browser test with notifications', async ({
    page,
    browserName,
  }) => {
    const testName = `Multi-browser Test [${browserName}]`;
    const startTime = Date.now();

    try {
      await page.goto('https://automationexercise.com');

      // Test login flow
      const loginLink = page.locator('a:has-text("Login")');
      expect(loginLink).toBeDefined();

      // Send notification with browser info
      await notifier.notify({
        testName: testName,
        status: 'passed',
        duration: Date.now() - startTime,
        browser: browserName,
        timestamp: new Date().toISOString(),
      });

      console.log(`✓ Test passed on ${browserName}`);
    } catch (error) {
      await notifier.notify({
        testName: testName,
        status: 'failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        browser: browserName,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  });

  test('Example 5: Send test run summary', async () => {
    // This would typically be called after all tests complete
    // In practice, use a custom reporter (see SLACK_INTEGRATION_GUIDE.md)

    const stats = {
      total: 4,
      passed: 3,
      failed: 1,
      skipped: 0,
      duration: 15000, // 15 seconds
    };

    try {
      await notifier.sendSummary(stats);
      console.log('✓ Test run summary sent to Slack');
    } catch (error) {
      console.error('Failed to send summary:', error);
    }
  });

  test('Example 6: Selective notifications (respecting preferences)', async ({
    page,
    browserName,
  }) => {
    const testName = 'Selective Notification Example';
    const startTime = Date.now();

    // If SLACK_NOTIFY_PASS=false, this notification won't be sent
    await notifier.notify({
      testName: testName,
      status: 'passed', // Will be filtered if SLACK_NOTIFY_PASS=false
      duration: Date.now() - startTime,
      browser: browserName,
      timestamp: new Date().toISOString(),
    });

    // If SLACK_NOTIFY_SKIP=true, this notification will be sent
    await notifier.notify({
      testName: `${testName} (Skipped)`,
      status: 'skipped', // Will be filtered if SLACK_NOTIFY_SKIP=false
      duration: Date.now() - startTime,
      browser: browserName,
      timestamp: new Date().toISOString(),
    });

    console.log('✓ Notifications sent (some may be filtered by preferences)');
  });
});

/**
 * Usage notes:
 *
 * 1. WEBHOOK METHOD (Recommended for quick setup):
 *    - Set SLACK_METHOD=webhook
 *    - Notifications are sent via HTTP POST
 *    - File uploads are not supported
 *    - Simpler, fewer OAuth scopes needed
 *
 * 2. BOT TOKEN METHOD (Recommended for file uploads):
 *    - Set SLACK_METHOD=bot-token
 *    - Supports uploading screenshots and trace files
 *    - Requires chat:write and files:write OAuth scopes
 *    - More powerful message formatting
 *
 * 3. ENVIRONMENT VARIABLES:
 *    - Copy .env.slack-example to .env
 *    - Configure your webhook URL or bot token
 *    - Set notification preferences
 *    - Never commit real tokens
 *
 * 4. FOR CUSTOM REPORTERS:
 *    - See SLACK_INTEGRATION_GUIDE.md for reporter example
 *    - Automatically sends notifications for each test
 *    - Sends summary at the end of test run
 *
 * 5. ERROR HANDLING:
 *    - Failed notifications won't block test execution
 *    - Errors are logged to console
 *    - Check SLACK_ENABLED=true in .env
 */
