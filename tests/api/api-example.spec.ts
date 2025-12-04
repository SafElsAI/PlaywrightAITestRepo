/**
 * Example API Test Suite
 * Reference: https://playwright.dev/docs/api-testing
 *
 * Demonstrates:
 * - Using request fixture for API testing
 * - API Helper for common operations
 * - JSON response assertions
 * - Error handling
 */

import { test, expect } from '../../src/fixtures/test.fixture';

test.describe('API Tests', () => {
  /**
   * Test: GET request
   * Using apiHelper fixture for simplified API calls
   */
  test('should fetch users list', async ({ apiHelper }) => {
    // Act & Assert
    const users = await apiHelper.get('/users');

    // Verify response structure
    expect(Array.isArray(users)).toBeTruthy();
  });

  /**
   * Test: GET with parameters
   * Using request fixture for more control
   */
  test('should fetch user by ID', async ({ request }) => {
    // Act
    const response = await request.get('https://api.example.com/users/1');

    // Assert
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data.id).toBe(1);
  });

  /**
   * Test: POST request - Create resource
   */
  test('should create new user', async ({ apiHelper }) => {
    // Arrange
    const newUser = {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
    };

    // Act
    const createdUser = await apiHelper.post('/users', newUser);

    // Assert
    expect(createdUser).toHaveProperty('id');
    expect(createdUser).toHaveProperty('name', newUser.name);
  });

  /**
   * Test: PUT request - Update resource
   */
  test('should update user', async ({ apiHelper }) => {
    // Arrange
    const userId = 1;
    const updatedData = {
      name: 'Updated Name',
      email: 'updated@example.com',
    };

    // Act
    const updated = (await apiHelper.put(`/users/${userId}`, updatedData)) as any;

    // Assert
    expect(updated.name).toBe(updatedData.name);
  });

  /**
   * Test: DELETE request
   */
  test('should delete user', async ({ apiHelper }) => {
    // Act
    const response = await apiHelper.delete('/users/1');

    // Assert - depends on API response
    expect(response).toBeDefined();
  });

  /**
   * Test: API with authentication
   */
  test('should make authenticated API request', async ({ apiHelper, request }) => {
    // Arrange
    const token = 'your-auth-token';

    // Act - Making request with Bearer token
    const data = await apiHelper.getWithAuth('/user/profile', token);

    // Assert
    expect(data).toHaveProperty('email');
  });

  /**
   * Test: Handle API errors
   */
  test('should handle 404 error', async ({ request }) => {
    // Act & Assert
    try {
      const response = await request.get('https://api.example.com/non-existent');
      expect(response.ok()).toBeFalsy();
      expect(response.status()).toBe(404);
    } catch (error) {
      // Request might throw error instead
      expect(error).toBeDefined();
    }
  });

  /**
   * Test: Multiple API calls
   */
  test('should perform workflow with multiple API calls', async ({ apiHelper }) => {
    // Act - Create user
    const newUser = (await apiHelper.post('/users', {
      name: 'Test User',
      email: 'test@example.com',
    })) as any;

    // Act - Fetch created user
    const userId = newUser.id;
    const fetchedUser = (await apiHelper.get(`/users/${userId}`)) as any;

    // Assert
    expect(fetchedUser.email).toBe('test@example.com');

    // Act - Update user
    const updated = (await apiHelper.put(`/users/${userId}`, {
      name: 'Updated User',
    })) as any;

    // Assert
    expect(updated.name).toBe('Updated User');
  });

  /**
   * Test: API with custom headers
   */
  test('should send API request with custom headers', async ({ apiHelper }) => {
    // Act
    const data = await apiHelper.get('/data', {
      headers: {
        'X-Custom-Header': 'custom-value',
        'Accept-Language': 'en-US',
      },
    });

    // Assert
    expect(data).toBeDefined();
  });
});

test.describe('API Error Handling', () => {
  /**
   * Test: Validate error response format
   */
  test('should return error with proper format', async ({ request }) => {
    // Act
    const response = await request.post('https://api.example.com/users', {
      data: {
        // Invalid data - missing required fields
      },
    });

    // Assert
    expect(response.status()).toBeGreaterThanOrEqual(400);

    const error = await response.json();
    expect(error).toHaveProperty('message');
  });

  /**
   * Test: Retry on failure
   */
  test('should retry failed requests', async ({ request }) => {
    const maxRetries = 3;
    let lastResponse = null;

    for (let i = 0; i < maxRetries; i++) {
      lastResponse = await request.get('https://api.example.com/users');
      if (lastResponse.ok()) {
        break;
      }
    }

    // Assert
    expect(lastResponse?.ok()).toBeTruthy();
  });
});
