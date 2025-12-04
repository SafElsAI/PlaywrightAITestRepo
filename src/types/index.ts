import { Page, expect } from '@playwright/test';

/**
 * Type definitions for the test automation framework
 */

/**
 * Locator strategies
 * Different ways to find elements on the page
 */
export enum LocatorStrategy {
  CSS = 'css',
  XPATH = 'xpath',
  DATA_TESTID = 'data-testid',
  LABEL = 'label',
  ROLE = 'role',
}

/**
 * Test configuration
 */
export interface TestConfig {
  baseUrl: string;
  apiBaseUrl: string;
  timeout: number;
  retries: number;
  environment: 'development' | 'staging' | 'production';
}

/**
 * User credentials
 */
export interface Credentials {
  username: string;
  password: string;
}

/**
 * API Response type
 */
export interface ApiResponse<T = any> {
  status: number;
  data: T;
  message?: string;
}

/**
 * Test result
 */
export interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: Error;
}

/**
 * Page navigation options
 */
export interface NavigationOptions {
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
  referer?: string;
}

/**
 * Screenshot options
 */
export interface ScreenshotOptions {
  path?: string;
  fullPage?: boolean;
  type?: 'png' | 'jpeg';
}

/**
 * Test data for data-driven tests
 */
export interface TestDataSet {
  id: string;
  input: any;
  expected: any;
}

/**
 * Browser configuration
 */
export interface BrowserConfig {
  headless: boolean;
  slowMo: number;
  args?: string[];
  timeout?: number;
}

/**
 * Device configuration for mobile testing
 */
export interface DeviceConfig {
  name: string;
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
  deviceScaleFactor: number;
  isMobile: boolean;
}
