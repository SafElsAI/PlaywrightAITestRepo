import { APIRequestContext } from '@playwright/test';

/**
 * API Helper for making HTTP requests
 * Wraps Playwright's request fixture with common utility methods
 * Reference: https://playwright.dev/docs/api-testing
 */
export class ApiHelper {
  private baseUrl: string;

  constructor(private request: APIRequestContext, baseUrl?: string) {
    this.baseUrl = baseUrl || '';
  }

  /**
   * Make GET request
   */
  async get<T>(endpoint: string, options?: { headers?: Record<string, string> }): Promise<T> {
    const response = await this.request.get(`${this.baseUrl}${endpoint}`, {
      headers: options?.headers,
    });

    if (!response.ok()) {
      throw new Error(`GET request failed: ${response.status()} ${response.statusText()}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Make POST request
   */
  async post<T>(
    endpoint: string,
    data: unknown,
    options?: { headers?: Record<string, string> },
  ): Promise<T> {
    const response = await this.request.post(`${this.baseUrl}${endpoint}`, {
      data,
      headers: options?.headers,
    });

    if (!response.ok()) {
      throw new Error(`POST request failed: ${response.status()} ${response.statusText()}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Make PUT request
   */
  async put<T>(
    endpoint: string,
    data: unknown,
    options?: { headers?: Record<string, string> },
  ): Promise<T> {
    const response = await this.request.put(`${this.baseUrl}${endpoint}`, {
      data,
      headers: options?.headers,
    });

    if (!response.ok()) {
      throw new Error(`PUT request failed: ${response.status()} ${response.statusText()}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Make DELETE request
   */
  async delete<T>(endpoint: string, options?: { headers?: Record<string, string> }): Promise<T> {
    const response = await this.request.delete(`${this.baseUrl}${endpoint}`, {
      headers: options?.headers,
    });

    if (!response.ok()) {
      throw new Error(`DELETE request failed: ${response.status()} ${response.statusText()}`);
    }

    // Some DELETE endpoints don't return body
    const contentType = response.headers()['content-type'];
    if (contentType && contentType.includes('application/json')) {
      return response.json() as Promise<T>;
    }

    return {} as T;
  }

  /**
   * Make PATCH request
   */
  async patch<T>(
    endpoint: string,
    data: unknown,
    options?: { headers?: Record<string, string> },
  ): Promise<T> {
    const response = await this.request.patch(`${this.baseUrl}${endpoint}`, {
      data,
      headers: options?.headers,
    });

    if (!response.ok()) {
      throw new Error(`PATCH request failed: ${response.status()} ${response.statusText()}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Make request with bearer token authentication
   */
  async getWithAuth<T>(
    endpoint: string,
    token: string,
    options?: { headers?: Record<string, string> },
  ): Promise<T> {
    const headers = {
      ...options?.headers,
      Authorization: `Bearer ${token}`,
    };

    return this.get<T>(endpoint, { headers });
  }

  /**
   * Make POST request with bearer token authentication
   */
  async postWithAuth<T>(
    endpoint: string,
    data: unknown,
    token: string,
    options?: { headers?: Record<string, string> },
  ): Promise<T> {
    const headers = {
      ...options?.headers,
      Authorization: `Bearer ${token}`,
    };

    return this.post<T>(endpoint, data, { headers });
  }
}

/**
 * Date/Time utilities for test operations
 */
export class DateUtil {
  /**
   * Get current date in YYYY-MM-DD format
   */
  static getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Get date N days from now
   */
  static getDateNDaysFromNow(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  /**
   * Get current time in HH:mm format
   */
  static getCurrentTime(): string {
    const date = new Date();
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  /**
   * Format date to specific format
   */
  static formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return format.replace('YYYY', String(year)).replace('MM', month).replace('DD', day);
  }

  /**
   * Get timestamp in seconds (useful for unique identifiers)
   */
  static getTimestampInSeconds(): number {
    return Math.floor(Date.now() / 1000);
  }

  /**
   * Parse date string and return Date object
   */
  static parseDate(dateString: string): Date {
    return new Date(dateString);
  }
}

/**
 * String utilities
 */
export class StringUtil {
  /**
   * Generate random alphanumeric string
   */
  static generateRandomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Capitalize first letter of string
   */
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Convert camelCase to snake_case
   */
  static camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  /**
   * Convert snake_case to camelCase
   */
  static snakeToCamel(str: string): string {
    return str.replace(/_[a-z]/g, (match) => match[1].toUpperCase());
  }

  /**
   * Truncate string to specified length
   */
  static truncate(str: string, length: number): string {
    if (str.length <= length) return str;
    return str.substring(0, length - 3) + '...';
  }
}
