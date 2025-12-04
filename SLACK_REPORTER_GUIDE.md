# Custom Playwright Reporter for Slack/Teams Integration

## Overview

A production-ready custom Playwright reporter that automatically sends test results to Slack and/or Microsoft Teams with:
- ✅ Test summary (total, passed, failed, skipped)
- ❌ Failed test details (file, error message, duration)
- 📸 Optional screenshot attachments
- ⏱️ Execution duration and pass rate
- 🔗 CI build links
- 📊 Formatted blocks for better readability

## Architecture

```
Playwright Test Run
        ↓
   Custom Reporter
        ↓
  Collect Stats (onTestEnd)
        ↓
   Build Summary (onEnd)
        ↓
  Slack/Teams Webhooks
        ↓
   Team Notification
```

## Features

### 1. **Automatic Test Tracking**
- Collects passed, failed, and skipped tests
- Captures test file location and execution duration
- Records error messages (first line only for readability)
- Calculates pass rate percentage

### 2. **Slack Integration**
- Uses simple webhook for quick setup (no bot token required)
- Beautiful block format with fields
- Failed tests section with error details
- Direct links to HTML reports
- Color-coded status (green for pass, red for fail)

### 3. **Microsoft Teams Integration**
- Sends MessageCard format for Teams
- Theme colors based on pass/fail
- Structured facts for metrics
- Action buttons for report links

### 4. **Configurable Options**
```typescript
{
  slackWebhookUrl?: string;          // Slack webhook URL
  teamsWebhookUrl?: string;          // Teams webhook URL
  uploadScreenshots?: boolean;       // Include screenshots
  uploadOnlyFailures?: boolean;      // Only upload failed test screenshots
  maxFailuresToShow?: number;        // Limit failed tests in report (default: 5)
  onlyOnCI?: boolean;                // Skip if not in CI environment
  slackBotToken?: string;            // For file uploads
}
```

## Setup

### 1. Create Webhook URLs

#### Slack Webhook
1. Go to [Slack API](https://api.slack.com/apps)
2. Create New App → From scratch
3. Name: "Playwright Reporter"
4. Select workspace
5. Enable "Incoming Webhooks"
6. Add New Webhook to Workspace
7. Select channel (e.g., #test-results)
8. Copy webhook URL

#### Teams Webhook
1. In Teams, go to channel settings
2. Connectors → Configure → Incoming Webhook
3. Create webhook
4. Copy webhook URL

### 2. Add Environment Variables

```bash
# .env or CI/CD environment
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
TEAMS_WEBHOOK_URL=https://outlook.webhook.office.com/webhookb2/...
```

### 3. Configure Reporter in `playwright.config.ts`

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['list'],
    ['html'],
    ['json'],
    ['./reporters/slack-reporter.ts', {
      slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
      teamsWebhookUrl: process.env.TEAMS_WEBHOOK_URL,
      uploadScreenshots: false,
      uploadOnlyFailures: true,
      maxFailuresToShow: 5,
      onlyOnCI: false, // Set to true for CI-only notifications
    }],
  ],
});
```

## Usage

### Run Tests (Reporter Auto-Triggers on onEnd)
```bash
npm test
```

### Run Specific Test Suite
```bash
npm test -- tests/e2e/login.spec.ts
```

### Run with Specific Browser
```bash
npm test -- --project=chromium
```

## Reporter Hooks

### `onBegin()`
- Initializes reporter
- Starts timer for duration calculation
- Logs startup message

### `onTestEnd(test, result)`
- Captures each test result
- Tracks passed/failed/skipped counts
- Collects error messages and attachments
- Stores failed test details

### `onEnd(result)`
- Builds summary statistics
- Creates formatted Slack/Teams messages
- Sends to webhooks
- Logs console summary

## Message Format

### Slack Message
```
🎯 Playwright Test Results

Total Tests: 13
✅ Passed: 10
❌ Failed: 3
Pass Rate: 77%

❌ Failed Tests (3):
1. should continue shopping from cart
   tests/e2e/cart-checkout.spec.ts:37:7
   `locator.fill: Timeout 15000ms exceeded`

2. should fill payment information
   tests/e2e/cart-checkout.spec.ts:63:7
   `locator.fill: Timeout 15000ms exceeded`

3. should attempt payment submission
   tests/e2e/cart-checkout.spec.ts:82:7
   `locator.fill: Timeout 15000ms exceeded`

⏱️ Duration: 25.99s | 🔗 View Report
```

### Teams Message
Similar structure but in MessageCard format with:
- Color coding (green/red theme)
- Structured facts table
- Action buttons for report links

## Troubleshooting

### Issue: "Failed to send Slack notification"

**Solution:** Check webhook URL and network connectivity
```bash
# Test webhook manually
curl -X POST 'https://hooks.slack.com/services/...' \
  -H 'Content-Type: application/json' \
  -d '{"text":"Test message"}'
```

### Issue: Tests not being reported

**Solution:** Verify:
1. Reporter path is correct in config
2. SLACK_WEBHOOK_URL or TEAMS_WEBHOOK_URL set
3. No compile errors: `npx tsc --noEmit`

### Issue: Slack 400 error

**Solution:** Likely JSON formatting issue
- Check message structure in code
- Verify blocks format is valid
- Enable debug logging

### Issue: Teams message not displaying

**Solution:** MessageCard schema might be invalid
- Verify themeColor format (6-char hex without #)
- Check @type is "MessageCard"
- Validate JSON structure

## Advanced Customization

### Upload Screenshots to Slack (Requires Bot Token)

```typescript
// In reporter options
{
  slackBotToken: process.env.SLACK_BOT_TOKEN,
  uploadScreenshots: true,
  uploadOnlyFailures: true,
}
```

### CI-Only Notifications

```typescript
// Only post on CI environments
{
  onlyOnCI: true, // Requires CI env var
}
```

### Custom Error Messages

Edit `buildSlackMessage()` to customize:
```typescript
// Limit error message length
error: error.substring(0, 150) + '...',
```

### Thread Responses (Slack)

Add threading for organized discussions:
```typescript
// Send to thread (requires message_ts)
thread_ts: parentMessageTs,
```

## Best Practices

✅ **DO:**
- Set `onlyOnCI: true` for CI/CD pipelines
- Use `maxFailuresToShow: 5-10` to keep messages concise
- Store webhook URLs in secrets management
- Test reporter with single test first
- Include CI build URL in messages

❌ **DON'T:**
- Hardcode webhook URLs in code
- Send all test details (too verbose)
- Post to general channels (use dedicated #test-results)
- Ignore network errors silently
- Use in development without filtering

## CI/CD Integration

### GitHub Actions
```yaml
- name: Run Tests
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
    CI_BUILD_URL: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
  run: npm test
```

### GitLab CI
```yaml
test:
  script:
    - npm test
  variables:
    SLACK_WEBHOOK_URL: $SLACK_WEBHOOK_URL
    CI_BUILD_URL: $CI_PIPELINE_URL
```

### Jenkins
```groovy
environment {
    SLACK_WEBHOOK_URL = credentials('slack-webhook-url')
    CI_BUILD_URL = "${BUILD_URL}"
}
stages {
    stage('Test') {
        steps {
            sh 'npm test'
        }
    }
}
```

## Performance Considerations

- Reporter runs **after** all tests complete
- No performance impact on test execution
- Network calls are async and non-blocking
- Failed test data stored in memory (~10KB per failure)

## Maintenance

### Update Slack Block Format
If Slack API changes block structure, update in:
- `buildSlackMessage()` method
- Validate against Slack API docs

### Add New Metrics
To track additional metrics:
1. Add property to `TestSummary` interface
2. Collect in `onTestEnd()`
3. Display in message builders

### Support for Other Platforms
Extend reporter by:
1. Adding new webhook URL option
2. Implementing new message builder
3. Calling from `sendToSlack()` pattern

## Files Modified

- ✅ `reporters/slack-reporter.ts` - Custom reporter implementation
- ✅ `playwright.config.ts` - Reporter configuration added

## Example Output

```
🚀 Starting test run...

[chromium] › tests/e2e/cart-checkout.spec.ts (26.1s)
  ✓ 10 passed
  ✘ 3 failed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 TEST EXECUTION SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total:    13
✅ Passed: 10
❌ Failed: 3
⏭️  Skipped: 0
🔄 Flaky:  0
⏱️  Duration: 25.99s
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Slack notification sent successfully
```

## Support

For issues or customization requests:
1. Check troubleshooting section
2. Review reporter logs
3. Test webhook URL directly
4. Enable debug logging in reporter
