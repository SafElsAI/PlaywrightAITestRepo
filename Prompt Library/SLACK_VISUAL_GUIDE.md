# Slack Integration - Visual Setup Guide

## 🎯 Two Integration Methods

```
┌─────────────────────────────────────────────────────────────────┐
│                   Slack Integration Methods                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────┐    ┌──────────────────────────────┐
│   METHOD 1: WEBHOOK (Simple) │    │ METHOD 2: BOT TOKEN (Full)   │
├──────────────────────────────┤    ├──────────────────────────────┤
│                              │    │                              │
│ Setup Time:  ⚡ 2 minutes     │    │ Setup Time:  ⏱️  5 minutes    │
│ Complexity:  😊 Simple       │    │ Complexity:  😐 Medium      │
│ File Upload: ❌ No           │    │ File Upload: ✅ Yes          │
│ Screenshots: ❌ No           │    │ Screenshots: ✅ Yes          │
│                              │    │                              │
│ Best for:                    │    │ Best for:                   │
│ • CI/CD alerts              │    │ • Detailed reporting        │
│ • Quick notifications       │    │ • Screenshots               │
│ • Test status updates       │    │ • Trace files               │
│                              │    │                              │
└──────────────────────────────┘    └──────────────────────────────┘
```

---

## 📋 Decision Tree

```
Start: "What do I need?"
│
├─ "Just pass/fail status"
│  └─→ Use WEBHOOK ✅ (simpler)
│
├─ "Pass/fail + error details"
│  ├─ "No file uploads needed"
│  │  └─→ Use WEBHOOK ✅ (simpler)
│  │
│  └─ "Include screenshots on failure"
│     └─→ Use BOT TOKEN ✅ (has files)
│
└─ "Full test reports with artifacts"
   └─→ Use BOT TOKEN ✅ (all features)
```

---

## 🔧 Setup Flow Chart

### Webhook Method Flow

```
1. Create Slack App
   └─→ https://api.slack.com/apps

2. Add Incoming Webhooks
   └─→ Enable → Add to Workspace

3. Select Channel & Copy URL
   └─→ https://hooks.slack.com/services/...

4. Add to .env
   └─→ SLACK_WEBHOOK_URL=...

5. Use in Code
   └─→ import SlackNotifier
       notifier.notify({...})

6. Done! ✅
```

### Bot Token Method Flow

```
1. Create Slack App
   └─→ https://api.slack.com/apps

2. Add OAuth Scopes
   ├─→ chat:write
   └─→ files:write

3. Install to Workspace
   └─→ Copy Bot Token (xoxb-...)

4. Invite Bot to Channel
   └─→ /invite @your-bot

5. Add to .env
   └─→ SLACK_BOT_TOKEN=xoxb-...

6. Use in Code
   └─→ import SlackNotifier
       notifier.notify({...})

7. Done! ✅
```

---

## 📊 Message Flow

### Webhook Integration

```
┌─────────────────┐
│   Your Test     │
│   Passes/Fails  │
└────────┬────────┘
         │
         ▼
┌──────────────────────────┐
│  SlackNotifier.notify()  │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Format JSON Payload     │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  POST to Webhook URL     │
│ (https://hooks.slack...) │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Slack Posts in Channel  │
└──────────────────────────┘
```

### Bot Token Integration

```
┌─────────────────┐
│   Your Test     │
│   Passes/Fails  │
└────────┬────────┘
         │
         ▼
┌──────────────────────────┐
│  SlackNotifier.notify()  │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Format Message + Files  │
└────────┬─────────────────┘
         │
         ├──────────────────────────────┐
         ▼                              ▼
┌────────────────────┐        ┌─────────────────────┐
│ POST to Slack API  │        │  Upload Files via   │
│ (chat.postMessage) │        │  Slack API          │
└────────┬───────────┘        │  (files.upload)     │
         │                    └─────────┬───────────┘
         │                              │
         └──────────────┬───────────────┘
                        ▼
         ┌──────────────────────────┐
         │  Slack Posts in Channel  │
         │  (with attachments)      │
         └──────────────────────────┘
```

---

## 🎛️ Configuration Map

### Webhook Configuration

```
┌─────────────────────────────────────────┐
│  SLACK Configuration - Webhook Method   │
├─────────────────────────────────────────┤
│                                         │
│ Required:                               │
│  ✅ SLACK_ENABLED                      │
│  ✅ SLACK_METHOD=webhook               │
│  ✅ SLACK_WEBHOOK_URL                  │
│  ✅ SLACK_CHANNEL                      │
│                                         │
│ Optional:                               │
│  📝 SLACK_NOTIFY_PASS                  │
│  📝 SLACK_NOTIFY_FAIL                  │
│  📝 SLACK_NOTIFY_SKIP                  │
│                                         │
│ Not Applicable:                         │
│  ❌ SLACK_BOT_TOKEN                    │
│  ❌ SLACK_UPLOAD_SCREENSHOTS           │
│  ❌ SLACK_UPLOAD_TRACES                │
│                                         │
└─────────────────────────────────────────┘
```

### Bot Token Configuration

```
┌─────────────────────────────────────────┐
│  SLACK Configuration - Bot Token Method │
├─────────────────────────────────────────┤
│                                         │
│ Required:                               │
│  ✅ SLACK_ENABLED                      │
│  ✅ SLACK_METHOD=bot-token             │
│  ✅ SLACK_BOT_TOKEN                    │
│  ✅ SLACK_CHANNEL                      │
│                                         │
│ Optional:                               │
│  📝 SLACK_NOTIFY_PASS                  │
│  📝 SLACK_NOTIFY_FAIL                  │
│  📝 SLACK_NOTIFY_SKIP                  │
│  📝 SLACK_UPLOAD_SCREENSHOTS           │
│  📝 SLACK_UPLOAD_TRACES                │
│                                         │
│ Not Applicable:                         │
│  ❌ SLACK_WEBHOOK_URL                  │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📞 API Usage Pattern

```
┌────────────────────────────────────────────────────┐
│  SlackNotifier Singleton Pattern Usage             │
└────────────────────────────────────────────────────┘

// Get instance (creates once, reuses)
const notifier = SlackNotifier.getInstance();

// Send test notification
await notifier.notify({
  testName: string,
  status: 'passed' | 'failed' | 'skipped',
  duration: number,           // milliseconds
  browser?: string,           // chromium, firefox, webkit
  timestamp: string,          // ISO format
  error?: string,             // failure reason
  screenshotPath?: string,    // for bot token only
  tracePath?: string,         // for bot token only
});

// Send summary after all tests
await notifier.sendSummary({
  total: number,
  passed: number,
  failed: number,
  skipped: number,
  duration: number,           // milliseconds
});
```

---

## 🎨 Slack Message Examples

### Webhook Method - Message Format

```
┌─────────────────────────────────────────┐
│           ✅ Test PASSED                │
├─────────────────────────────────────────┤
│ Test:      Login Test                   │
│ Browser:   chromium                     │
│ Duration:  1234ms                       │
│ Time:      2024-12-01T10:30:00.000Z    │
│                                         │
│ ─────────────────────────────────────── │
└─────────────────────────────────────────┘
```

### Bot Token Method - Message Format

```
┌─────────────────────────────────────────┐
│           ❌ Test FAILED                │
├─────────────────────────────────────────┤
│ Test Name: Login Test                   │
│ Browser:   chromium                     │
│ Duration:  5000ms                       │
│ Timestamp: 2024-12-01T10:30:00.000Z    │
│                                         │
│ Error Details:                          │
│ ``` Expected locator "button" not found │
│ ```                                     │
│                                         │
│ Attachments:                            │
│ 📎 failure-screenshot.png (450KB)       │
└─────────────────────────────────────────┘
```

---

## 🔄 Environment Variables Diagram

```
Test Execution
    │
    ▼
┌─────────────────────────────────┐
│  Check SLACK_ENABLED            │
├─────────────────────────────────┤
│  true  → Continue setup         │
│  false → Skip Slack (default)   │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Check SLACK_METHOD             │
├─────────────────────────────────┤
│  webhook   → Use Webhook URL    │
│  bot-token → Use Bot Token      │
└────────┬────────────────────────┘
         │
    ┌────┴─────┐
    │           │
    ▼           ▼
┌──────────┐  ┌──────────────┐
│ Webhook  │  │  Bot Token   │
├──────────┤  ├──────────────┤
│ Check:   │  │ Check:       │
│ • URL    │  │ • Token      │
│ • Channel│  │ • Channel    │
│          │  │ • Scopes     │
└────┬─────┘  └──────┬───────┘
     │               │
     ▼               ▼
  Send POST        Send POST
  to Webhook       to Slack API
     │               │
     │           (Optional)
     │           Upload Files
     │               │
     └───┬───────────┘
         ▼
    Message Posted
    in Slack Channel ✅
```

---

## 📝 Quick Reference Card

```
╔════════════════════════════════════════════════════════════════╗
║                  SLACK INTEGRATION QUICK REF                   ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  WEBHOOK METHOD:                                              ║
║  ├─ Get URL: https://api.slack.com/apps                      ║
║  ├─ Set: SLACK_WEBHOOK_URL=https://hooks.slack.com/...      ║
║  └─ Use: Simple JSON post (no files)                         ║
║                                                                ║
║  BOT TOKEN METHOD:                                            ║
║  ├─ Get Token: https://api.slack.com/apps                    ║
║  ├─ Set: SLACK_BOT_TOKEN=xoxb-...                           ║
║  ├─ Scopes: chat:write, files:write                          ║
║  └─ Use: File uploads + advanced features                    ║
║                                                                ║
║  USAGE:                                                       ║
║  ├─ Import: import SlackNotifier from './src/utils/...'     ║
║  ├─ Get:    SlackNotifier.getInstance()                     ║
║  ├─ Notify: notifier.notify({testName, status, ...})        ║
║  └─ Summary: notifier.sendSummary({total, passed, ...})    ║
║                                                                ║
║  FILES CREATED:                                               ║
║  ├─ src/config/slack.config.ts                              ║
║  ├─ src/utils/slack-notifier.ts                             ║
║  ├─ SLACK_QUICK_SETUP.md ⭐ START HERE                       ║
║  ├─ SLACK_INTEGRATION_GUIDE.md (full docs)                  ║
║  └─ .env.slack-example (template)                           ║
║                                                                ║
║  ENVIRONMENT VARS:                                            ║
║  ├─ SLACK_ENABLED (true/false)                              ║
║  ├─ SLACK_METHOD (webhook/bot-token)                        ║
║  ├─ SLACK_WEBHOOK_URL (for webhook)                         ║
║  ├─ SLACK_BOT_TOKEN (for bot-token)                         ║
║  ├─ SLACK_CHANNEL (#channel-name)                           ║
║  ├─ SLACK_NOTIFY_PASS (default: false)                      ║
║  ├─ SLACK_NOTIFY_FAIL (default: true)                       ║
║  ├─ SLACK_UPLOAD_SCREENSHOTS (default: false)               ║
║  └─ SLACK_UPLOAD_TRACES (default: false)                    ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

---

## 🚀 Getting Started (30 seconds)

```
1️⃣  Choose method:
    Webhook (simple) ← Start here!
    Bot Token (files)

2️⃣  Get credentials:
    Visit https://api.slack.com/apps
    Follow setup flow above

3️⃣  Configure .env:
    SLACK_ENABLED=true
    SLACK_METHOD=webhook
    SLACK_WEBHOOK_URL=your-url
    SLACK_CHANNEL=#channel

4️⃣  Code:
    import SlackNotifier from './src/utils/slack-notifier'
    notifier = SlackNotifier.getInstance()
    await notifier.notify({...})

5️⃣  Test:
    Run your tests
    Check Slack channel ✅

Done! 🎉
```

---

## 📚 Documentation Map

```
You are here 👈
│
├─ SLACK_QUICK_SETUP.md
│  └─ 60-second setup
│     └─ Common use cases
│        └─ Troubleshooting
│
├─ SLACK_INTEGRATION_GUIDE.md
│  ├─ Detailed webhook setup
│  ├─ Detailed bot token setup
│  ├─ Custom reporter example
│  └─ Full API reference
│
├─ SLACK_CONFIGURATION.md
│  ├─ Feature comparison
│  ├─ API documentation
│  └─ Security guidelines
│
└─ SLACK_IMPLEMENTATION_SUMMARY.md
   └─ Checklist & next steps
```

---

## ✅ Implementation Checklist

```
Preparation:
  ☐ Choose integration method
  ☐ Read SLACK_QUICK_SETUP.md

Setup:
  ☐ Get credentials from Slack
  ☐ Create .env file
  ☐ Add environment variables

Implementation:
  ☐ Verify files in src/config/ and src/utils/
  ☐ Import SlackNotifier in tests
  ☐ Add notifier.notify() calls
  ☐ Test with single test first

Verification:
  ☐ Run tests
  ☐ Check Slack channel for messages
  ☐ Verify formatting
  ☐ Test error handling

Enhancement (Optional):
  ☐ Create custom reporter
  ☐ Add notifier.sendSummary() calls
  ☐ Configure notification preferences
  ☐ Enable file uploads (bot token)
```

---

**Ready to integrate? Open `SLACK_QUICK_SETUP.md` now! 🚀**
