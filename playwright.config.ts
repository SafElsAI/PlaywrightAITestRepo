import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Playwright Configuration
 * Reference: https://playwright.dev/docs/test-configuration
 *
 * This configuration sets up:
 * - Multiple browser projects for cross-browser testing
 * - Environment-specific settings
 * - Custom reporters (HTML, JSON, JUnit)
 * - Screenshot and video capture for failures
 * - Trace recording for debugging
 * - Web server setup for local testing
 */
export default defineConfig({
  // Directory containing tests
  testDir: './tests',

  // Run tests in files in parallel within the worker
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry failed tests in CI environments
  retries: process.env.CI ? 2 : 0,

  // Number of workers for parallel execution
  // In CI, use 1 worker to avoid resource conflicts
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  // Multiple reporters provide different output formats
  reporter: [
    // List reporter shows each test with status
    ['list'],
    // HTML reporter creates interactive dashboard
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    // JSON reporter for programmatic access
    ['json', { outputFile: 'test-results.json' }],
    // JUnit reporter for CI integration (Jenkins, GitLab, etc.)
    ['junit', { outputFile: 'results.xml' }],
    // Custom Slack reporter - sends test results to Slack/Teams
    ['./reporters/slack-reporter.ts', {
      slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
      teamsWebhookUrl: process.env.TEAMS_WEBHOOK_URL,
      uploadScreenshots: false,
      uploadOnlyFailures: true,
      maxFailuresToShow: 5,
      onlyOnCI: false, // Set to true to only post on CI
    }],
  ],

  // Shared settings for all tests
  use: {
    // Base URL for navigation - allows relative URLs in tests
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // Ignore HTTPS errors for self-signed certificates
    ignoreHTTPSErrors: true,

    // Trace recording helps debug failures
    // 'on-first-retry' only records on retry, saving disk space
    trace: 'on-first-retry',

    // Screenshot behavior
    // 'only-on-failure' captures screenshots only for failed tests
    screenshot: 'only-on-failure',

    // Video recording
    // 'retain-on-failure' keeps videos only for failed tests
    video: 'retain-on-failure',

    // Action timeout - max time for any action (click, fill, etc.)
    actionTimeout: parseInt(process.env.ACTION_TIMEOUT || '15000'),

    // Navigation timeout - max time for page navigation
    navigationTimeout: parseInt(process.env.NAVIGATION_TIMEOUT || '30000'),
  },

  // Configure multiple projects for cross-browser testing
  // Each project gets its own worker pool
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Configure web server for local development
  // Playwright will wait for the server to be ready before running tests
  // Disabled by default for example tests - uncomment if you have a local server
  // webServer: {
  //   // Command to start the web server
  //   command: 'npm run start',
  //   // URL to check if the server is ready
  //   url: 'http://localhost:3000',
  //   // Reuse existing server if already running (except in CI)
  //   reuseExistingServer: !process.env.CI,
  //   // Timeout for server startup
  //   timeout: 120000,
  // },

  // Global timeout for all tests
  timeout: 60000,

  // Global setup runs once before all tests
  // Useful for authentication or database setup
  // globalSetup: require.resolve('./src/config/global-setup.ts'),

  // Global teardown runs once after all tests
  // globalTeardown: require.resolve('./src/config/global-teardown.ts'),
});
