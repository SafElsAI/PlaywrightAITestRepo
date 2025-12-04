# Slack Integration - Complete Documentation Index

## 📚 Documentation Files

### 1. **SLACK_QUICK_SETUP.md** ⭐ START HERE
   - 60-second setup for both methods
   - Side-by-side comparison
   - Common use cases
   - Troubleshooting quick fixes

### 2. **SLACK_INTEGRATION_GUIDE.md** (Comprehensive)
   - Detailed webhook setup steps
   - Detailed bot token setup steps
   - OAuth scopes explanation
   - Custom reporter integration
   - Full API reference
   - Best practices
   - Advanced examples

---

## 🛠️ Implementation Files

### Core Modules

#### `src/config/slack.config.ts`
- Configuration interface definitions
- Environment variable validation
- Channel name validation
- Helper functions

```typescript
// Usage:
import { getSlackConfig } from './src/config/slack.config';

const config = getSlackConfig();
```

#### `src/utils/slack-notifier.ts`
- Main `SlackNotifier` class (singleton)
- Webhook integration method
- Bot token integration method
- File upload functionality
- Message formatting
- Error handling

```typescript
// Usage:
import SlackNotifier from './src/utils/slack-notifier';

const notifier = SlackNotifier.getInstance();
await notifier.notify({
  testName: 'My Test',
  status: 'passed',
  duration: 1000,
  browser: 'chromium',
  timestamp: new Date().toISOString(),
});
```

---

## ⚙️ Configuration

### Environment Variables
Copy and customize `.env.slack-example`:

```bash
# Required
SLACK_ENABLED=true
SLACK_METHOD=webhook              # or: bot-token
SLACK_CHANNEL=#test-results

# Method-specific (choose one)
SLACK_WEBHOOK_URL=https://...     # For webhook
SLACK_BOT_TOKEN=xoxb-...          # For bot-token

# Optional
SLACK_NOTIFY_PASS=false
SLACK_NOTIFY_FAIL=true
SLACK_NOTIFY_SKIP=false
SLACK_UPLOAD_SCREENSHOTS=true
SLACK_UPLOAD_TRACES=false
```

---

## 🚀 Quick Integration Steps

### Step 1: Choose Integration Method

**Webhook (Recommended for simplicity)**
- ✅ Simple, quick setup (2 minutes)
- ✅ Lightweight
- ❌ No file uploads

**Bot Token (Recommended for full features)**
- ✅ File upload support
- ✅ Advanced formatting
- ⚠️ More setup (5 minutes)

### Step 2: Get Credentials

**For Webhook:**
1. https://api.slack.com/apps → Create New App
2. Incoming Webhooks → Add to Workspace
3. Copy webhook URL

**For Bot Token:**
1. https://api.slack.com/apps → Create New App
2. OAuth & Permissions → Add scopes: `chat:write`, `files:write`
3. Install to Workspace
4. Copy Bot Token
5. Invite bot to channel: `/invite @your-bot-name`

### Step 3: Configure Environment

Create `.env`:
```bash
SLACK_ENABLED=true
SLACK_METHOD=webhook
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_CHANNEL=#test-results
SLACK_NOTIFY_FAIL=true
```

### Step 4: Add to Tests

```typescript
import SlackNotifier from './src/utils/slack-notifier';

const notifier = SlackNotifier.getInstance();

// In your test
await notifier.notify({
  testName: 'Login Test',
  status: 'passed',
  duration: Date.now() - startTime,
  browser: 'chromium',
  timestamp: new Date().toISOString(),
});
```

### Step 5: (Optional) Add Custom Reporter

For automatic notifications after each test, create custom reporter and add to `playwright.config.ts`.

See SLACK_INTEGRATION_GUIDE.md for complete reporter example.

---

## 📊 Notification Types

### Test Result Notification

Sent for each test execution:

```
✅ Test PASSED
─────────────────────
Test:       Login Test
Browser:    chromium
Duration:   1234ms
Time:       2024-12-01T10:30:00Z
```

### Summary Notification

Sent after all tests complete:

```
✅ Test Run Summary
─────────────────────────
Total:      10
Passed:     9
Failed:     1
Skipped:    0
Pass Rate:  90%
Duration:   25.50s
```

### Error Notification

Sent on test failure:

```
❌ Test FAILED
─────────────────────
Test:       Login Test
Browser:    chromium
Duration:   5000ms
Time:       2024-12-01T10:30:00Z

Error Details:
```Expected locator not found```
```

---

## 🔌 API Reference

### SlackNotifier.getInstance()
Get singleton instance of notifier.

### notifier.notify(result: TestResult)
Send individual test result notification.

**Parameters:**
- `testName: string` - Name of the test
- `status: 'passed' | 'failed' | 'skipped'` - Test result status
- `duration: number` - Test duration in milliseconds
- `browser?: string` - Browser name (chromium, firefox, webkit, etc.)
- `timestamp: string` - ISO timestamp string
- `error?: string` - Error message (if failed)
- `screenshotPath?: string` - Path to screenshot file (bot token only)
- `tracePath?: string` - Path to trace file (bot token only)

**Example:**
```typescript
await notifier.notify({
  testName: 'Login Test',
  status: 'passed',
  duration: 1234,
  browser: 'chromium',
  timestamp: new Date().toISOString(),
});
```

### notifier.sendSummary(stats: TestStats)
Send test run summary notification.

**Parameters:**
- `total: number` - Total number of tests
- `passed: number` - Number of passed tests
- `failed: number` - Number of failed tests
- `skipped: number` - Number of skipped tests
- `duration: number` - Total duration in milliseconds

**Example:**
```typescript
await notifier.sendSummary({
  total: 10,
  passed: 9,
  failed: 1,
  skipped: 0,
  duration: 25500,
});
```

---

## 🎯 Common Use Cases

### Use Case 1: Notify Only Failures in CI/CD

```bash
SLACK_ENABLED=true
SLACK_METHOD=webhook
SLACK_WEBHOOK_URL=...
SLACK_NOTIFY_FAIL=true
SLACK_NOTIFY_PASS=false
```

### Use Case 2: Detailed Reporting with Screenshots

```bash
SLACK_ENABLED=true
SLACK_METHOD=bot-token
SLACK_BOT_TOKEN=xoxb-...
SLACK_UPLOAD_SCREENSHOTS=true
SLACK_NOTIFY_FAIL=true
```

### Use Case 3: All Notifications for Dashboard

```bash
SLACK_ENABLED=true
SLACK_METHOD=bot-token
SLACK_BOT_TOKEN=xoxb-...
SLACK_NOTIFY_PASS=true
SLACK_NOTIFY_FAIL=true
SLACK_NOTIFY_SKIP=true
```

---

## 🐛 Troubleshooting

### Issue: "Webhook failed: 404"
**Solution:** Verify webhook URL is correct and starts with `https://hooks.slack.com/`

### Issue: "invalid_auth" with bot token
**Solution:** 
- Verify token starts with `xoxb-`
- Regenerate token in OAuth settings
- Reinstall app to workspace

### Issue: "channel_not_found"
**Solution:** 
- Invite bot to channel: `/invite @your-bot-name`
- Use channel name without `#` when testing

### Issue: No notifications appearing
**Solution:**
- Check `SLACK_ENABLED=true` in .env
- Verify environment variables are loaded
- Check console for error messages
- Check notification preferences (SLACK_NOTIFY_*)

### Issue: "Cannot find module" errors
**Solution:**
- Ensure `src/config/slack.config.ts` exists
- Ensure `src/utils/slack-notifier.ts` exists
- Check file paths in imports

---

## 🔒 Security Best Practices

✅ **Do:**
- Use `.env` file for sensitive data
- Add `.env` to `.gitignore`
- Rotate tokens regularly
- Use `.env.slack-example` as template
- Store tokens in CI/CD secrets

❌ **Don't:**
- Commit `.env` with real tokens
- Share tokens in chat/email
- Use same token for multiple apps
- Hardcode credentials in code

---

## 📋 Feature Comparison

| Feature | Webhook | Bot Token |
|---------|---------|-----------|
| Simple JSON messages | ✅ | ✅ |
| File uploads | ❌ | ✅ |
| Screenshots | ❌ | ✅ |
| Trace files | ❌ | ✅ |
| Rich formatting | ✅ | ✅✅ |
| Setup time | 2 min | 5 min |
| OAuth required | ❌ | ✅ |
| Best for | CI/CD | Reports |

---

## 📞 Support

For issues or questions:

1. Check **Troubleshooting** section above
2. Read **SLACK_INTEGRATION_GUIDE.md** for detailed help
3. Check **SLACK_QUICK_SETUP.md** for quick reference
4. Review **slack-notifier.ts** source code
5. Check console for error messages

---

## 📝 Example Integration

Full test example with Slack integration:

```typescript
import { test, expect } from '@playwright/test';
import SlackNotifier from './src/utils/slack-notifier';

test('login test', async ({ page, browserName }) => {
  const notifier = SlackNotifier.getInstance();
  const startTime = Date.now();

  try {
    await page.goto('https://automationexercise.com');
    await page.click('a:has-text("Login")');
    
    await notifier.notify({
      testName: 'Login Test',
      status: 'passed',
      duration: Date.now() - startTime,
      browser: browserName,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Capture screenshot on failure
    await page.screenshot({ path: './screenshot.png' });
    
    await notifier.notify({
      testName: 'Login Test',
      status: 'failed',
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown',
      browser: browserName,
      timestamp: new Date().toISOString(),
      screenshotPath: './screenshot.png',
    });
    throw error;
  }
});
```

---

## 🎓 Next Steps

1. Read **SLACK_QUICK_SETUP.md** for 60-second setup
2. Choose integration method (webhook vs bot-token)
3. Get credentials from Slack
4. Create `.env` file
5. Add SlackNotifier to your tests
6. Run tests and verify notifications
7. (Optional) Create custom reporter

Good luck with your Slack integration! 🚀
