# Best Practices Guide

Following these best practices ensures a maintainable, reliable, and scalable test automation framework.

## 1. Locator Strategy

### ✅ Web-First Locators (Recommended)

Always prioritize user-facing locators:

```typescript
// ✅ BEST: By accessibility role
page.getByRole('button', { name: /submit/i })
page.getByRole('link', { name: 'Home' })
page.getByRole('textbox', { name: 'Username' })

// ✅ GOOD: By label (for form fields)
page.getByLabel('Email')
page.getByLabel('Remember me')

// ✅ GOOD: By placeholder
page.getByPlaceholder('Enter password')

// ✅ GOOD: By text content
page.getByText('Save Changes')

// ✅ GOOD: By test ID (custom)
page.getByTestId('user-card')
```

### ❌ Avoid

```typescript
// ❌ AVOID: CSS selectors (brittle)
page.locator('div.user-form input.email-input')

// ❌ AVOID: XPath (slow, unreadable)
page.locator("//input[@name='email']")

// ❌ AVOID: Element handles (deprecated)
await page.$(selector)
```

## 2. Auto-Waiting and Assertions

### Use Web-First Assertions

Playwright automatically retries assertions:

```typescript
// ✅ GOOD: Auto-retry until element is visible
await expect(page.locator('.success')).toBeVisible();

// ✅ GOOD: Auto-retry for text
await expect(page.locator('h1')).toHaveText('Dashboard');

// ✅ GOOD: Auto-retry for URL
await expect(page).toHaveURL(/dashboard/);

// ✅ GOOD: Auto-retry for value
await expect(page.locator('input')).toHaveValue('expected');

// ❌ AVOID: Manual waits
await page.waitForSelector('.success');
await page.waitForTimeout(1000);

// ❌ AVOID: Checking without retry
if (await page.locator('.success').isVisible()) {
  // ...
}
```

### Assertion Timeout

```typescript
// Custom timeout for specific assertion
await expect(page.locator('.loading')).toBeHidden({
  timeout: 30000
});

// Global timeout in config
use: {
  actionTimeout: 15000,
  navigationTimeout: 30000
}
```

## 3. Page Object Model Pattern

### Encapsulate Elements and Actions

```typescript
// ✅ GOOD: Encapsulated page object
export class ProductPage extends BasePage {
  readonly addButton: Locator;
  readonly quantityInput: Locator;
  readonly totalPrice: Locator;

  constructor(page: Page) {
    super(page, '/products');
    this.addButton = page.getByRole('button', { name: /add to cart/i });
    this.quantityInput = page.locator('input[name="quantity"]');
    this.totalPrice = page.locator('[data-testid="total-price"]');
  }

  async addToCart(quantity: number): Promise<void> {
    await this.quantityInput.fill(quantity.toString());
    await this.addButton.click();
  }

  async getTotalPrice(): Promise<string> {
    return this.totalPrice.textContent();
  }
}

// ✅ GOOD: Using page object in tests
test('should add product to cart', async ({ page }) => {
  const productPage = new ProductPage(page);
  await productPage.goto();
  await productPage.addToCart(2);
  const price = await productPage.getTotalPrice();
  expect(price).toContain('$');
});

// ❌ AVOID: Direct selectors in tests
test('bad: no page object', async ({ page }) => {
  await page.locator('input[name="qty"]').fill('2');
  await page.locator('button.add-btn').click();
  const price = await page.locator('span.price').textContent();
  expect(price).toContain('$');
});
```

## 4. Test Isolation

### Independent Tests

```typescript
// ✅ GOOD: Each test sets up its own state
test('first test', async ({ page }) => {
  await page.goto('/login');
  await loginPage.login('user1@example.com', 'pass1');
  // ...
});

test('second test', async ({ page }) => {
  // Fresh start, doesn't depend on first test
  await page.goto('/login');
  await loginPage.login('user2@example.com', 'pass2');
  // ...
});

// ❌ AVOID: Test dependencies
let userId = '';

test('first test', async ({ page }) => {
  // Sets userId for next test
  userId = await createUser();
});

test('second test depends on first', async ({ page }) => {
  // Fails if first test doesn't run or is skipped
  await deleteUser(userId);
});
```

### Use Fixtures for Setup

```typescript
// ✅ GOOD: Fixtures for setup/teardown
export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Setup
    await page.goto('/login');
    await login('user@example.com', 'password');
    
    await use(page);
    
    // Teardown
    await logout();
  }
});

test('authenticated test', async ({ authenticatedPage }) => {
  // Already logged in, ready to test
  await authenticatedPage.goto('/dashboard');
});
```

## 5. Fixture Usage

### Compose Fixtures

```typescript
// ✅ GOOD: Fixtures depending on each other
export const test = base.extend({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  authenticatedPage: async ({ loginPage, page }, use) => {
    // Uses loginPage fixture
    await loginPage.goto();
    await loginPage.login('user@example.com', 'password');
    await use(page);
  },

  dashboardPage: async ({ authenticatedPage }, use) => {
    // Uses authenticatedPage fixture
    const dashboard = new DashboardPage(authenticatedPage);
    await use(dashboard);
  }
});

// Use composed fixtures
test('dashboard test', async ({ dashboardPage }) => {
  // Setup includes: login → dashboard
  const title = await dashboardPage.getPageTitle();
});
```

## 6. Error Handling

### Proper Error Handling

```typescript
// ✅ GOOD: Try-catch for non-critical operations
try {
  await page.click('optional-element');
} catch (error) {
  Logger.warn('Optional element not found, continuing...');
}

// ✅ GOOD: Assert expected errors
test('should show error', async ({ loginPage }) => {
  await loginPage.login('invalid@example.com', 'wrong');
  const isError = await loginPage.isErrorDisplayed();
  expect(isError).toBeTruthy();
});

// ❌ AVOID: Ignoring all errors
try {
  // Important operations
  await loginPage.login(username, password);
} catch (error) {
  // Silently ignoring
}

// ❌ AVOID: No error handling
await page.click('selector-might-not-exist');
```

## 7. Data Management

### Use Test Data Fixtures

```typescript
// ✅ GOOD: Centralized test data
export interface TestData {
  validCredentials: {
    username: string;
    password: string;
  };
  invalidCredentials: {
    username: string;
    password: string;
  };
}

export const test = base.extend({
  testData: async ({}, use) => {
    const data: TestData = {
      validCredentials: {
        username: 'valid@example.com',
        password: 'ValidPass123!'
      },
      invalidCredentials: {
        username: 'invalid@example.com',
        password: 'wrong'
      }
    };
    await use(data);
  }
});

// ✅ GOOD: Use data generators
const email = DataGenerator.generateEmail('test');
const password = DataGenerator.generatePassword(12);

// ❌ AVOID: Hardcoded values in tests
test('bad: hardcoded data', async ({ page }) => {
  await page.fill('input', 'test@example.com');
  await page.fill('input', 'hardcodedPassword123!');
});

// ❌ AVOID: Sharing data between tests
const testEmail = 'shared@example.com';

test('first', async ({ page }) => {
  // Uses shared email
});

test('second', async ({ page }) => {
  // Depends on shared email
});
```

## 8. Assertions

### Clear and Specific Assertions

```typescript
// ✅ GOOD: Specific assertions
expect(quantity).toBe(5);
expect(price).toBeGreaterThan(0);
expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
expect(list).toHaveLength(3);
expect(list).toContain('item');
expect(obj).toHaveProperty('id');

// ✅ GOOD: Multiple related assertions
expect(user).toMatchObject({
  email: 'test@example.com',
  status: 'active'
});

// ❌ AVOID: Too broad assertions
expect(response).toBeTruthy();  // What are we testing?

// ❌ AVOID: Single assertion per test (usually)
test('user creation @bad', async ({ page }) => {
  // Only asserts first name
  expect(user.firstName).toBe('John');
  // Should also assert:
  // - Last name
  // - Email
  // - Created date
  // But should probably be separate tests
});
```

## 9. Parallel Execution

### Design Tests for Parallelization

```typescript
// ✅ GOOD: Independent tests run in parallel
test('login flow', async ({ page }) => {
  // Uses its own browser context
  // No shared state
});

test('product search', async ({ page }) => {
  // Independent test
  // Can run simultaneously
});

// ✅ GOOD: Avoid shared resources
// Each test gets fresh context:
// - New browser context
// - New page
// - No shared state

// ❌ AVOID: Tests that share state
let sharedDatabase;

test.beforeAll(async () => {
  sharedDatabase = await connectDB();
});

test('modifies database', async () => {
  await sharedDatabase.insert(data);
  // Affects other tests!
});

// ❌ AVOID: Sequential test dependencies
test('create user', async ({ page }) => {
  userId = await createUser();
});

test('must run after previous', async ({ page }) => {
  // Fails if run separately or in parallel
  await deleteUser(userId);
});
```

## 10. Debugging and Logging

### Effective Logging

```typescript
// ✅ GOOD: Structured logging
import { Logger } from '../src/utils/test-utils';

test('with logging', async ({ page }) => {
  Logger.info('Starting login test');
  
  Logger.debug('Navigating to login page');
  await page.goto('/login');
  
  Logger.info('Entering credentials');
  await loginPage.login('user@example.com', 'password');
  
  Logger.debug(`Current URL: ${page.url()}`);
});

// ✅ GOOD: Log important state
Logger.info(`Created user: ${JSON.stringify(user)}`);
Logger.warn(`Unexpected status: ${response.status()}`);
Logger.error(`Test failed: ${error.message}`);

// ✅ GOOD: Use debug flag for verbose logging
DEBUG=pw:* npm test

// ❌ AVOID: console.log in production
console.log('Something happened');  // Can spam output

// ❌ AVOID: Log everything
Logger.debug(`Step 1`);
Logger.debug(`Step 2`);
Logger.debug(`Step 3`);
```

## 11. Performance

### Optimize Test Speed

```typescript
// ✅ GOOD: Reuse authentication state
// In playwright.config.ts
use: {
  storageState: 'auth.json'
}

// ✅ GOOD: Use fixtures for expensive setup
export const test = base.extend({
  database: [async ({}, use) => {
    const db = await createDatabase();
    await use(db);
    await db.close();
  }, { scope: 'worker' }]  // Reuse across tests
});

// ✅ GOOD: Run tests in parallel (default)
fullyParallel: true,
workers: undefined  // Uses available CPUs

// ❌ AVOID: Unnecessary waits
await page.waitForTimeout(2000);  // Why wait?

// ❌ AVOID: Sequential execution
test.describe.serial('', () => {
  // Forces sequential execution
  // Loses parallelization benefits
});
```

## 12. Maintenance

### Keep Tests Maintainable

```typescript
// ✅ GOOD: Descriptive test names
test('should successfully login with valid credentials', async () => {});
test('should display error message with invalid email', async () => {});
test('should redirect to dashboard after successful login', async () => {});

// ✅ GOOD: Organized with describe blocks
test.describe('Login Page', () => {
  test.describe('with valid credentials', () => {
    test('should navigate to dashboard', async () => {});
  });

  test.describe('with invalid credentials', () => {
    test('should show error message', async () => {});
  });
});

// ❌ AVOID: Unclear test names
test('test 1', async () => {});
test('login', async () => {});  // Too vague

// ❌ AVOID: Mixed concerns
test('should login, create product, delete product, logout', async () => {
  // Does too many things
  // Hard to debug
  // Not reusable
});
```

## 13. Code Quality

### TypeScript Best Practices

```typescript
// ✅ GOOD: Proper typing
async function login(username: string, password: string): Promise<void> {
  // ...
}

interface User {
  id: string;
  email: string;
  name: string;
}

// ✅ GOOD: Strict TypeScript
// In tsconfig.json
"strict": true,
"noImplicitAny": true

// ❌ AVOID: Type any
const data: any = response;  // Avoid!

// ❌ AVOID: Implicit any
function process(data) {  // No type specified
  // ...
}
```

---

**Key Takeaway**: Write tests that are:
- **Reliable** - Consistent results
- **Maintainable** - Easy to update
- **Fast** - Run quickly
- **Independent** - No dependencies
- **Clear** - Intent is obvious

Good test code is as important as good production code!
