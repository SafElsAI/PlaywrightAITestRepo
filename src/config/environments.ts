/**
 * Environment-specific configuration
 * Reference: https://playwright.dev/docs/test-configuration
 *
 * This module provides environment-based URL and credential management
 */

export interface EnvironmentConfig {
  baseUrl: string;
  apiBaseUrl: string;
  username: string;
  password: string;
  timeout: {
    action: number;
    navigation: number;
    global: number;
  };
}

// Environment configurations
const environments: Record<string, EnvironmentConfig> = {
  development: {
    baseUrl: 'https://automationexercise.com',
    apiBaseUrl: 'https://automationexercise.com/api/productsList',
    username: 'dev.user@example.com',
    password: 'devpassword123',
    timeout: {
      action: 15000,
      navigation: 30000,
      global: 60000,
    },
  },

  qa: {
    baseUrl: 'https://automationexercise.com',
    apiBaseUrl: 'https://automationexercise.com/api/productsList',
    username: 'qa.user@example.com',
    password: 'qapassword123',
    timeout: {
      action: 20000,
      navigation: 40000,
      global: 90000,
    },
  },

  production: {
    baseUrl: 'https://automationexercise.com',
    apiBaseUrl: 'https://automationexercise.com/api/productsList',
    username: 'prod.user@example.com',
    password: 'prodpassword123',
    timeout: {
      action: 25000,
      navigation: 50000,
      global: 120000,
    },
  },
};

/**
 * Get environment configuration
 * Uses ENVIRONMENT variable or defaults to 'development'
 * @returns Environment configuration object
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const env = process.env.ENVIRONMENT || 'development';

  if (!environments[env]) {
    throw new Error(
      `Unknown environment: ${env}. Available: ${Object.keys(environments).join(', ')}`,
    );
  }

  return environments[env];
}

/**
 * Get base URL from config or environment variables
 * Environment variables take precedence
 */
export function getBaseUrl(): string {
  return process.env.BASE_URL || getEnvironmentConfig().baseUrl;
}

/**
 * Get API base URL from config or environment variables
 */
export function getApiBaseUrl(): string {
  return process.env.API_BASE_URL || getEnvironmentConfig().apiBaseUrl;
}

/**
 * Get test credentials
 * Uses environment variables if set, otherwise uses config
 */
export function getCredentials(): { username: string; password: string } {
  return {
    username: process.env.TEST_USERNAME || getEnvironmentConfig().username,
    password: process.env.TEST_PASSWORD || getEnvironmentConfig().password,
  };
}
