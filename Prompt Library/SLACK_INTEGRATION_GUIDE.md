# Slack Integration Guide

This guide explains how to configure and use Slack notifications in your Playwright framework.

## Overview

Two integration methods are supported:

### 1. **Webhook URL** (Simple JSON, No File Upload)
- ✅ Simple setup
- ✅ No OAuth required
- ✅ Lightweight payloads
- ❌ Cannot upload files/screenshots
- Best for: Quick notifications, CI/CD pipelines

### 2. **Bot Token** (Full Features with File Upload)
- ✅ Upload screenshots and trace files
- ✅ Advanced message formatting
- ✅ Access to all Slack features
- ⚠️ Requires OAuth scope setup
- Best for: Detailed test reporting with artifacts

---

## Method 1: Webhook Integration (Simple JSON)

### Step 1: Create Incoming Webhook

1. Go to [Slack App Directory](https://api.slack.com/apps)
2. Click **Create New App** → **From scratch**
3. Fill in app name and select workspace
4. In left sidebar, go to **Incoming Webhooks**
5. Toggle **Activate Incoming Webhooks** to ON
6. Click **Add New Webhook to Workspace**
7. Select channel (or create one)
8. Copy the Webhook URL

### Step 2: Configure Environment Variables

Create a `.env` file in your project root:

```bash
# Slack Configuration - Webhook Method
SLACK_ENABLED=true
SLACK_METHOD=webhook
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_CHANNEL=#test-results

# Notification preferences (optional)
SLACK_NOTIFY_PASS=false
SLACK_NOTIFY_FAIL=true
SLACK_NOTIFY_SKIP=false
```

### Step 3: Use in Your Tests

```typescript
import { test } from '@playwright/test';
import SlackNotifier from './src/utils/slack-notifier';

test('login test', async ({ page }) => {
  const notifier = SlackNotifier.getInstance();
  const startTime = Date.now();

  try {
    await page.goto('https://automationexercise.com');
    await page.click('a:has-text("Login")');
    
    // Notify success
    await notifier.notify({
      testName: 'Login Test',
      status: 'passed',
      duration: Date.now() - startTime,
      browser: 'chromium',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Notify failure
    await notifier.notify({
      testName: 'Login Test',
      status: 'failed',
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      browser: 'chromium',
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
});
```

---

## Method 2: Bot Token Integration (With File Upload)

### Step 1: Create Slack App

1. Go to [Slack API Dashboard](https://api.slack.com/apps)
2. Click **Create New App** → **From scratch**
3. App name: `Playwright Test Bot`
4. Select your workspace

### Step 2: Configure Bot Token Scopes

1. In your app settings, go to **OAuth & Permissions**
2. Under **Scopes**, add these **Bot Token Scopes**:
   - `chat:write` - Post messages
   - `files:write` - Upload files
   - `channels:manage` - Manage channels (optional)

Required scopes:

```
chat:write
files:write
```

### Step 3: Install App to Workspace

1. In **OAuth & Permissions**, click **Install to Workspace**
2. Grant permissions
3. Copy the **Bot User OAuth Token** (starts with `xoxb-`)

### Step 4: Add Bot to Channel

1. Go to your Slack channel
2. Type `/invite @Playwright Test Bot` (or your app name)
3. Bot is now in the channel

### Step 5: Configure Environment Variables

Create a `.env` file:

```bash
# Slack Configuration - Bot Token Method
SLACK_ENABLED=true
SLACK_METHOD=bot-token
SLACK_BOT_TOKEN=xoxb-YOUR-BOT-TOKEN
SLACK_CHANNEL=#test-results

# File upload options
SLACK_UPLOAD_SCREENSHOTS=true
SLACK_UPLOAD_TRACES=false

# Notification preferences (optional)
SLACK_NOTIFY_PASS=false
SLACK_NOTIFY_FAIL=true
SLACK_NOTIFY_SKIP=false
```

### Step 6: Use in Your Tests

```typescript
import { test } from '@playwright/test';
import SlackNotifier from './src/utils/slack-notifier';

test('login with screenshot', async ({ page }) => {
  const notifier = SlackNotifier.getInstance();
  const startTime = Date.now();
  const screenshotPath = './test-results/screenshot.png';

  try {
    await page.goto('https://automationexercise.com');
    await page.click('a:has-text("Login")');
    
    // Notify with screenshot upload
    await notifier.notify({
      testName: 'Login Test',
      status: 'passed',
      duration: Date.now() - startTime,
      browser: 'chromium',
      timestamp: new Date().toISOString(),
      screenshotPath: screenshotPath, // Will be uploaded to Slack
    });
  } catch (error) {
    // Capture screenshot before notification
    await page.screenshot({ path: screenshotPath });
    
    await notifier.notify({
      testName: 'Login Test',
      status: 'failed',
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      browser: 'chromium',
      timestamp: new Date().toISOString(),
      screenshotPath: screenshotPath, // Uploaded on failure
    });
    throw error;
  }
});
```

---

## Integration with Playwright Reporters

You can integrate Slack notifications with custom reporters:

```typescript
// src/reporters/slack-reporter.ts
import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import SlackNotifier from '../utils/slack-notifier';

export class SlackReporter implements Reporter {
  private notifier = SlackNotifier.getInstance();
  private startTime = Date.now();
  private stats = { total: 0, passed: 0, failed: 0, skipped: 0 };

  onTestEnd(test: TestCase, result: TestResult): void {
    this.stats.total++;
    
    const status = 
      result.status === 'passed' ? 'passed' :
      result.status === 'failed' ? 'failed' : 'skipped';
    
    if (status === 'passed') this.stats.passed++;
    if (status === 'failed') this.stats.failed++;
    if (status === 'skipped') this.stats.skipped++;

    // Send individual notification
    this.notifier.notify({
      testName: test.title,
      status: status,
      duration: result.duration,
      error: result.errors[0]?.message,
      browser: test.titlePath[0],
      timestamp: new Date().toISOString(),
    });
  }

  onExit(): void {
    // Send summary
    this.notifier.sendSummary({
      total: this.stats.total,
      passed: this.stats.passed,
      failed: this.stats.failed,
      skipped: this.stats.skipped,
      duration: Date.now() - this.startTime,
    });
  }
}
```

Add to `playwright.config.ts`:

```typescript
import { SlackReporter } from './src/reporters/slack-reporter';

export default defineConfig({
  // ... other config
  reporter: [
    ['list'],
    ['html'],
    new SlackReporter(), // Add custom reporter
  ],
});
```

---

## Environment Variable Reference

| Variable | Required | Method | Default | Description |
|----------|----------|--------|---------|-------------|
| `SLACK_ENABLED` | ✅ | Both | `false` | Enable/disable Slack notifications |
| `SLACK_METHOD` | ✅ | Both | `webhook` | `webhook` or `bot-token` |
| `SLACK_WEBHOOK_URL` | ✅ | Webhook only | - | Incoming webhook URL |
| `SLACK_BOT_TOKEN` | ✅ | Bot token only | - | Bot user OAuth token (xoxb-...) |
| `SLACK_CHANNEL` | ✅ | Both | `#test-results` | Channel name or ID |
| `SLACK_NOTIFY_PASS` | ❌ | Both | `false` | Send notification on pass |
| `SLACK_NOTIFY_FAIL` | ❌ | Both | `true` | Send notification on failure |
| `SLACK_NOTIFY_SKIP` | ❌ | Both | `false` | Send notification on skip |
| `SLACK_UPLOAD_SCREENSHOTS` | ❌ | Bot token | `false` | Upload screenshot files |
| `SLACK_UPLOAD_TRACES` | ❌ | Bot token | `false` | Upload trace files |

---

## Message Examples

### Webhook Method Output

```
✅ Test PASSED
─────────────────────
Test:       Login Test
Browser:    chromium
Duration:   1234ms
Time:       2024-12-01T10:30:00.000Z
```

### Bot Token Method Output

```
✅ Test PASSED
─────────────────────────────
Test Name:  Login Test
Browser:    chromium
Duration:   1234ms
Timestamp:  2024-12-01T10:30:00.000Z

[Attachments: screenshot.png, trace.zip]
```

---

## Troubleshooting

### Webhook Method

**Error: "Invalid webhook URL"**
- Verify URL format: `https://hooks.slack.com/services/...`
- Check URL is not expired (regenerate if needed)

**Error: "No permission to post"**
- Ensure app is added to the channel
- Check OAuth scopes

### Bot Token Method

**Error: "invalid_auth"**
- Verify bot token starts with `xoxb-`
- Check token hasn't been rotated
- Reinstall app to workspace

**Error: "channel_not_found"**
- Use channel name without `#` or channel ID
- Ensure bot is invited to channel

**Error: "not_in_channel"**
- Add bot to channel: `/invite @your-app-name`

---

## Best Practices

1. **Use environment variables** - Never commit tokens
2. **Filter notifications** - Don't notify on every test (use `SLACK_NOTIFY_PASS`)
3. **Add context** - Include browser, duration, timestamps
4. **Limit uploads** - Enable screenshots only on failures
5. **Use summaries** - Post test run summary at the end
6. **Error details** - Include error messages for failures
7. **Retry logic** - Add retry mechanism for failed posts

---

## Example: Complete Test Fixture

```typescript
import { test as baseTest, expect } from '@playwright/test';
import SlackNotifier from '../src/utils/slack-notifier';

export const test = baseTest.extend({
  slackNotifier: async ({}, use) => {
    const notifier = SlackNotifier.getInstance();
    await use(notifier);
  },
});

test('example with Slack notifications', async ({ page, slackNotifier, browserName }) => {
  const startTime = Date.now();

  try {
    await page.goto('https://automationexercise.com');
    expect(page).toHaveTitle(/Automation Exercise/);

    await slackNotifier.notify({
      testName: test.info().title,
      status: 'passed',
      duration: Date.now() - startTime,
      browser: browserName,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    await slackNotifier.notify({
      testName: test.info().title,
      status: 'failed',
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      browser: browserName,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
});
```
