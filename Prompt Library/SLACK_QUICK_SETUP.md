# Slack Integration Quick Setup

## ⚡ 60-Second Setup

### Method 1: Webhook (Simplest)

1. **Get Webhook URL**
   - Go to https://api.slack.com/apps → Create New App
   - Select "From scratch" → name your app → select workspace
   - Go to "Incoming Webhooks" → toggle ON → "Add New Webhook to Workspace"
   - Select channel and copy URL

2. **Add to `.env`**
   ```bash
   SLACK_ENABLED=true
   SLACK_METHOD=webhook
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   SLACK_CHANNEL=#test-results
   SLACK_NOTIFY_FAIL=true
   ```

3. **Use in Code**
   ```typescript
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

### Method 2: Bot Token (With File Uploads)

1. **Create Bot**
   - Go to https://api.slack.com/apps → Create New App
   - Go to "OAuth & Permissions" → add these scopes:
     - `chat:write`
     - `files:write`
   - Click "Install to Workspace"
   - Copy Bot Token (starts with `xoxb-`)

2. **Add Bot to Channel**
   - Go to Slack channel → type `/invite @YourAppName`

3. **Add to `.env`**
   ```bash
   SLACK_ENABLED=true
   SLACK_METHOD=bot-token
   SLACK_BOT_TOKEN=xoxb-YOUR-BOT-TOKEN
   SLACK_CHANNEL=#test-results
   SLACK_UPLOAD_SCREENSHOTS=true
   SLACK_NOTIFY_FAIL=true
   ```

4. **Use in Code**
   ```typescript
   import SlackNotifier from './src/utils/slack-notifier';
   
   const notifier = SlackNotifier.getInstance();
   await notifier.notify({
     testName: 'My Test',
     status: 'failed',
     duration: 5000,
     error: 'Login failed',
     browser: 'chromium',
     timestamp: new Date().toISOString(),
     screenshotPath: './screenshots/failure.png', // Will upload!
   });
   ```

---

## Comparison

| Feature | Webhook | Bot Token |
|---------|---------|-----------|
| Setup Time | 2 minutes | 5 minutes |
| File Upload | ❌ | ✅ |
| Message Formatting | ✅ | ✅✅ |
| Auth Type | Incoming Webhook | OAuth 2.0 |
| Complexity | Low | Medium |
| Best For | CI/CD Alerts | Detailed Reports |

---

## Files Created

```
src/
├── config/
│   └── slack.config.ts          # Configuration module
└── utils/
    └── slack-notifier.ts         # Slack notification service

SLACK_INTEGRATION_GUIDE.md        # Full documentation
.env.slack-example               # Environment template
```

---

## Environment Variables Summary

```bash
# Required
SLACK_ENABLED=true|false          # Enable notifications
SLACK_METHOD=webhook|bot-token    # Integration method
SLACK_CHANNEL=#channel-name       # Target channel

# For Webhook Method
SLACK_WEBHOOK_URL=https://...     # Webhook URL

# For Bot Token Method
SLACK_BOT_TOKEN=xoxb-...          # Bot token

# Optional Preferences
SLACK_NOTIFY_PASS=false           # Notify on pass (default: false)
SLACK_NOTIFY_FAIL=true            # Notify on fail (default: true)
SLACK_NOTIFY_SKIP=false           # Notify on skip (default: false)

# File Upload (Bot Token Only)
SLACK_UPLOAD_SCREENSHOTS=true     # Upload screenshots
SLACK_UPLOAD_TRACES=false         # Upload trace files
```

---

## Common Use Cases

### Use Case 1: Notify Only Failures (CI/CD)

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

### Use Case 3: All Notifications

```bash
SLACK_ENABLED=true
SLACK_METHOD=bot-token
SLACK_BOT_TOKEN=xoxb-...
SLACK_NOTIFY_PASS=true
SLACK_NOTIFY_FAIL=true
SLACK_NOTIFY_SKIP=true
```

---

## Integration with Custom Reporter

For automatic notifications after each test:

```typescript
// src/reporters/slack-reporter.ts
import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import SlackNotifier from '../utils/slack-notifier';

export class SlackReporter implements Reporter {
  private notifier = SlackNotifier.getInstance();
  private stats = { total: 0, passed: 0, failed: 0, skipped: 0, duration: 0 };

  onTestEnd(test: TestCase, result: TestResult): void {
    this.stats.total++;
    const status = result.status === 'passed' ? 'passed' : 
                   result.status === 'failed' ? 'failed' : 'skipped';
    
    if (status === 'passed') this.stats.passed++;
    if (status === 'failed') this.stats.failed++;
    if (status === 'skipped') this.stats.skipped++;

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
    this.notifier.sendSummary({
      total: this.stats.total,
      passed: this.stats.passed,
      failed: this.stats.failed,
      skipped: this.stats.skipped,
      duration: this.stats.duration,
    });
  }
}
```

Add to `playwright.config.ts`:

```typescript
import { SlackReporter } from './src/reporters/slack-reporter';

export default defineConfig({
  // ...
  reporter: [
    ['list'],
    ['html'],
    new SlackReporter(),
  ],
});
```

---

## Troubleshooting

### "Slack webhook failed: 404"
- Copy webhook URL correctly
- Check URL starts with `https://hooks.slack.com/services/`

### "invalid_auth" with bot token
- Verify token starts with `xoxb-`
- Regenerate token if needed
- Reinstall app to workspace

### "channel_not_found" with bot token
- Invite bot to channel: `/invite @your-bot-name`
- Use channel name without `#`

### Notifications not sending
- Check `SLACK_ENABLED=true`
- Verify environment variables are loaded
- Check console for error messages

---

## Next Steps

1. ✅ Copy configuration module: `src/config/slack.config.ts`
2. ✅ Copy notifier utility: `src/utils/slack-notifier.ts`
3. ✅ Copy `.env.slack-example` and create `.env` with your values
4. ✅ Add `SlackNotifier` calls in your tests
5. (Optional) Create custom reporter for automatic notifications
6. Run tests and check Slack channel for notifications

---

## Security Notes

- ⚠️ Never commit `.env` file with real tokens
- ⚠️ Add `.env` to `.gitignore`
- ⚠️ Rotate tokens regularly
- ✅ Use `.env.slack-example` as template for team
- ✅ Store tokens in CI/CD secrets manager
