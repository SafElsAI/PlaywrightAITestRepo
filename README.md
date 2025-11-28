# Playwright Test Automation Framework

A production-ready test automation framework built with **Playwright** and **TypeScript**, following official best practices for scalable, maintainable end-to-end testing.

## 📋 Overview101

This framework provides:
- **Page Object Model (POM)** pattern for element management
- **Custom Fixtures** for isolated test environments and page object integration
- **Web-first Assertions** with automatic retry logic
- **Auto-waiting** for reliable, flake-free tests
- **Multiple Reporters** (HTML, JSON, JUnit)
- **CI/CD Integration** with GitHub Actions
- **Environment Management** for dev/staging/prod
- **API Testing** capabilities
- **Cross-browser Testing** (Chrome, Firefox, Safari)
- **Mobile Testing** support (iOS, Android)

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x, 22.x, or 24.x (LTS versions recommended)
- npm, yarn, or pnpm

### Installation

```bash
# Clone or navigate to project
cd playwright-framework

# Install dependencies
npm install

# Install Playwright browsers and dependencies
npx playwright install --with-deps
```

### First Test Run

```bash
# Run all tests
npm test

# Run in headed mode (see browser window)
npm run test:headed

# Run specific test file
npx playwright test tests/e2e/login.spec.ts

# Run tests by tag
npm run test:smoke

# Run in UI mode (interactive)
npm run test:ui

# Run in debug mode
npm run test:debug
```

## 📁 Project Structure

```
playwright-framework/
├── src/
│   ├── pages/                    # Page Object Models
│   │   ├── base.page.ts         # Base class with common methods
│   │   ├── login.page.ts        # Login page object
│   │   ├── dashboard.page.ts    # Dashboard page object
│   │   └── index.ts             # Export all pages
│   ├── fixtures/
│   │   └── test.fixture.ts      # Custom test fixtures
│   ├── utils/
│   │   ├── test-utils.ts        # Logger, screenshots, data generation
│   │   └── index.ts             # API helpers, date utilities
│   ├── config/
│   │   └── environments.ts      # Environment-specific config
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   └── global-setup.ts          # Optional: global setup for all tests
├── tests/
│   ├── e2e/                     # End-to-end tests
│   │   ├── login.spec.ts       # Login flow examples
│   │   └── dashboard.spec.ts   # Dashboard examples
│   ├── api/                     # API tests
│   │   └── api-example.spec.ts
│   └── integration/             # Integration tests
│       └── workflow.spec.ts
├── test-data/                   # Test data files
│   └── test-data.json
├── .github/workflows/
│   └── playwright.yml           # GitHub Actions CI/CD
├── playwright.config.ts         # Playwright configuration
├── tsconfig.json               # TypeScript configuration
├── .eslintrc.json              # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── .env.example                # Environment variables template
└── package.json                # Dependencies and scripts
```

## 🏗️ Framework Architecture

### 1. Page Object Model (POM)

Page objects encapsulate page elements and interactions, making tests more maintainable.

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    super(page, '/login');
    this.usernameInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.getByRole('button', { name: /login/i });
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForLoadState('networkidle');
  }
}
```

### 2. Custom Fixtures

Fixtures provide isolated test environments with automatic setup/teardown.

```typescript
export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('user@example.com', 'password');
    await use(page);
  }
});
```

### 3. Test Examples

```typescript
import { test, expect } from '../../src/fixtures/test.fixture';

test.describe('Login Flow', () => {
  test('should login successfully', async ({ loginPage, page }) => {
    // Arrange
    const credentials = { username: 'user@example.com', password: 'pass' };

    // Act
    await loginPage.goto();
    await loginPage.login(credentials.username, credentials.password);

    // Assert - Web-first assertion with auto-retry
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should show error @smoke', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('invalid@example.com', 'wrong');
    const isError = await loginPage.isErrorDisplayed();
    expect(isError).toBeTruthy();
  });
});
```

## 🛠️ Configuration

### Environment Setup

Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your values:
```
BASE_URL=http://localhost:3000
API_BASE_URL=https://api.example.com
TEST_USERNAME=testuser@example.com
TEST_PASSWORD=testpassword123
ENVIRONMENT=development
```

### Playwright Config

Key configurations in `playwright.config.ts`:

```typescript
// Multiple browsers
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
]

// Reporters
reporter: [
  ['list'],
  ['html', { open: 'never' }],
  ['json', { outputFile: 'test-results.json' }],
  ['junit', { outputFile: 'results.xml' }]
]

// Screenshots and traces
use: {
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  trace: 'on-first-retry'
}
```

## 📊 Running Tests

### By Test Type
```bash
npm run test:e2e          # End-to-end tests
npm run test:api          # API tests
npm run test:integration  # Integration tests
```

### By Browser
```bash
npm run test:chrome       # Chromium only
npm run test:firefox      # Firefox only
npm run test:webkit       # WebKit only
npm run test:mobile       # Mobile browsers
```

### By Tag/Filter
```bash
npm run test:smoke        # Only @smoke tests
npx playwright test --grep "login"        # Tests matching "login"
npx playwright test --grep "@auth"        # Tests tagged @auth
npx playwright test -g "should login"     # Exact match
```

### Advanced Options
```bash
npx playwright test --headed              # Show browser window
npx playwright test --debug               # Step-by-step debugging
npx playwright test --ui                  # Interactive UI mode
npx playwright test --update-snapshots    # Update visual baselines
npx playwright test --workers=1           # Single worker (debug mode)
npx playwright test --repeat=3            # Repeat each test 3 times
```

## 📈 Viewing Reports

### HTML Report
```bash
npm run test:report       # Opens interactive HTML report
```

Features:
- Test results with status (passed/failed/skipped)
- Screenshots and videos for failed tests
- Test trace viewer for debugging
- Timeline and performance metrics

### Test Traces
```bash
npm run test:trace        # View trace files for debugging
```

Trace includes:
- Network requests/responses
- Console logs
- DOM snapshots
- Screenshots at each step

## 🧪 Test Writing Guide

### Web-First Assertions (Auto-retry)

Playwright automatically retries assertions until timeout:

```typescript
// ✅ GOOD: Auto-retry until element is visible
await expect(page.locator('.success')).toBeVisible();

// ✅ GOOD: Auto-retry until text appears
await expect(page.locator('h1')).toHaveText('Dashboard');

// ✅ GOOD: Auto-retry URL change
await expect(page).toHaveURL(/dashboard/);

// ❌ AVOID: Manual checks without retry
if (await page.locator('.success').isVisible()) {
  // ...
}
```

### Locator Strategies

Prioritize user-facing selectors:

```typescript
// ✅ BEST: By role (accessibility)
page.getByRole('button', { name: /login/i })

// ✅ GOOD: By label (accessibility)
page.getByLabel('Username')

// ✅ GOOD: By placeholder
page.getByPlaceholder('Enter username')

// ✅ GOOD: By test id
page.getByTestId('login-button')

// ⚠️ OK: CSS selector (less maintainable)
page.locator('button.login-btn')

// ❌ AVOID: XPath (brittle, slow)
page.locator("//button[contains(text(), 'Login')]")
```

### Test Organization

```typescript
test.describe('Feature Group', () => {
  test.beforeEach(async ({ page }) => {
    // Setup
  });

  test('should do something', async ({ page }) => {
    // Arrange
    // Act
    // Assert
  });

  test('should handle error @smoke', async ({ page }) => {
    // ...
  });

  test.skip('not ready yet', async ({ page }) => {
    // ...
  });

  test.fixme('known issue', async ({ page }) => {
    // ...
  });
});
```

### Utility Functions

**Logger:**
```typescript
import { Logger } from '../src/utils/test-utils';

Logger.info('Starting test');
Logger.debug('Debug info');
Logger.warn('Warning');
Logger.error('Error message');
```

**Data Generation:**
```typescript
import { DataGenerator } from '../src/utils/test-utils';

const email = DataGenerator.generateEmail('test');      // test.TIMESTAMP.RANDOM@example.com
const password = DataGenerator.generatePassword(12);    // Random secure password
const phone = DataGenerator.generatePhoneNumber();      // (555) 123-4567
const date = DataGenerator.generateRandomDate();       // YYYY-MM-DD
```

**API Helper:**
```typescript
test('API test', async ({ apiHelper }) => {
  const users = await apiHelper.get<User[]>('/users');
  const newUser = await apiHelper.post('/users', userData);
  const updated = await apiHelper.put(`/users/${id}`, updates);
  await apiHelper.delete(`/users/${id}`);
  
  // With authentication
  const data = await apiHelper.getWithAuth('/profile', token);
});
```

## 🔧 Debugging

### Interactive Debugging
```bash
npx playwright test --debug
```
- Step through each action
- Inspect DOM at each step
- Execute JavaScript in console

### Pause in Test
```typescript
test('debug test', async ({ page }) => {
  await page.goto('https://example.com');
  await page.pause();  // Opens inspector
  // Resume from here
});
```

### Trace Viewer
Enabled automatically on first retry:
```typescript
// playwright.config.ts
use: {
  trace: 'on-first-retry',  // Record on retry
  video: 'retain-on-failure'  // Keep videos of failures
}
```

View traces:
```bash
npx playwright show-trace trace.zip
```

### Console Logs
```typescript
test('check logs', async ({ page }) => {
  page.on('console', (msg) => console.log(msg));
  page.on('pageerror', (error) => console.error(error));
});
```

## 🚀 CI/CD Integration

### GitHub Actions

Tests run automatically on:
- Push to `main`, `master`, `develop`
- Pull requests

Features:
- Parallel execution (3 shards)
- Cross-browser testing
- HTML report generation
- Artifact uploads
- PR comments with results

View results:
1. Go to **Actions** tab
2. Click workflow run
3. Download **playwright-report** artifact
4. Open `index.html` in browser

### Environment Secrets

Add to GitHub repository settings:

```
TEST_USERNAME=your-test-user@example.com
TEST_PASSWORD=your-test-password
API_BASE_URL=https://api-staging.example.com
```

## ⚡ Best Practices

### ✅ DO:

1. **Use Page Object Model** - Centralize element selectors
2. **Leverage Auto-waiting** - Trust Playwright's waiting mechanism
3. **Use Web-first Assertions** - They have automatic retry logic
4. **Test User Workflows** - Test what users actually do
5. **Use Fixtures** - For setup/teardown and state management
6. **Run Tests in Parallel** - Default behavior in config
7. **Keep Tests Independent** - Each test can run alone
8. **Use Descriptive Names** - Test names should explain intent

### ❌ DON'T:

1. **Use Manual Waits** - `await page.waitForTimeout(1000)` ❌
2. **Use Element Handles** - Deprecated in Playwright
3. **Use XPath** - Use user-facing selectors instead
4. **Create Test Dependencies** - Tests should be independent
5. **Test Implementation Details** - Test user behavior
6. **Use `eval()`** - Avoid dynamic code execution
7. **Hardcode Credentials** - Use environment variables
8. **Use Flaky Sleeps** - Use web-first assertions

## 📦 Useful Commands

```bash
# Development
npm run lint              # Check code style
npm run lint:fix         # Auto-fix linting issues
npm run format           # Format code with Prettier
npm run type-check       # Check TypeScript types

# Testing
npm run test             # Run all tests
npm run test:ui          # Interactive mode
npm run test:debug       # Debug mode
npm run test:report      # View HTML report
npm run test:trace       # View traces

# Code Quality
npm run format:check     # Check formatting
npm run lint             # Check linting
```

## 🔗 Resources

- **Official Documentation**: https://playwright.dev
- **Best Practices**: https://playwright.dev/docs/best-practices
- **API Reference**: https://playwright.dev/docs/api/class-playwright
- **Debugging Guide**: https://playwright.dev/docs/debug
- **CI/CD**: https://playwright.dev/docs/ci

## 📝 Writing Your First Test

1. **Create test file** in `tests/` directory:
```typescript
// tests/my-feature.spec.ts
import { test, expect } from '../src/fixtures/test.fixture';

test('describe what should happen', async ({ page }) => {
  // Arrange - set up test data
  
  // Act - perform actions
  
  // Assert - verify results
});
```

2. **Run the test**:
```bash
npx playwright test tests/my-feature.spec.ts
```

3. **View results**:
```bash
npm run test:report
```

## 🤝 Contributing

1. Follow TypeScript strict mode
2. Use ESLint and Prettier for code style
3. Write descriptive test names
4. Add comments for complex logic
5. Follow Page Object Model pattern
6. Use fixtures for setup/teardown

## 📄 License

ISC

---

**Happy Testing! 🎭**

For questions or issues, refer to the Playwright documentation or the inline code comments throughout the framework.
