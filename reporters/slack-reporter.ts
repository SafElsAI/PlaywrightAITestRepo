/**
 * Custom Playwright Reporter for Slack Integration
 * Sends test results summary, failures, and screenshots to Slack
 * 
 * Usage in playwright.config.ts:
 * reporter: [
 *   ['./reporters/slack-reporter.ts', {
 *     slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
 *     uploadScreenshots: true,
 *     uploadOnlyFailures: true,
 *     maxFailuresToShow: 5
 *   }]
 * ]
 */

import type {
  Reporter,
  FullResult,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';
import * as path from 'path';

interface SlackReporterOptions {
  slackWebhookUrl?: string;
  teamsWebhookUrl?: string;
  uploadScreenshots?: boolean;
  uploadOnlyFailures?: boolean;
  maxFailuresToShow?: number;
  onlyOnCI?: boolean;
  slackBotToken?: string;
}

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  flaky: number;
  duration: number;
  failedTests: FailedTest[];
  passRate: number;
}

interface FailedTest {
  title: string;
  file: string;
  error: string;
  duration: number;
  screenshotPath?: string;
}

class SlackReporter implements Reporter {
  private options: SlackReporterOptions;
  private failedTests: FailedTest[] = [];
  private startTime: number = 0;
  private testCount = { passed: 0, failed: 0, skipped: 0, total: 0 };

  constructor(options: SlackReporterOptions = {}) {
    this.options = {
      uploadScreenshots: false,
      uploadOnlyFailures: true,
      maxFailuresToShow: 5,
      onlyOnCI: false,
      ...options,
    };
  }

  onBegin() {
    this.startTime = Date.now();
    console.log('🚀 Starting test run...');
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.testCount.total += 1;
    
    if (result.status === 'passed') {
      this.testCount.passed += 1;
    } else if (result.status === 'skipped') {
      this.testCount.skipped += 1;
    } else if (result.status === 'failed') {
      this.testCount.failed += 1;
      const error = result.errors?.[0]?.message || 'Unknown error';
      const attachment = result.attachments?.find(
        (a: { contentType?: string }) => a.contentType === 'image/png'
      );
      const screenshotPath = attachment?.path;

      this.failedTests.push({
        title: test.title,
        file: path.relative(process.cwd(), test.location.file),
        error: error.split('\n')[0], // First line of error
        duration: result.duration,
        screenshotPath,
      });
    }
  }

  async onEnd(result: FullResult) {
    // Skip if only on CI and not in CI environment
    if (this.options.onlyOnCI && !process.env.CI) {
      console.log('⏭️  Skipping Slack notification (not in CI)');
      return;
    }

    // Build test summary
    const summary = this.buildSummary(result);

    // Send to Slack
    if (this.options.slackWebhookUrl) {
      console.log('📤 Sending results to Slack...');
      await this.sendToSlack(summary);
    }

    // Send to Teams (if configured)
    if (this.options.teamsWebhookUrl) {
      console.log('📤 Sending results to Microsoft Teams...');
      await this.sendToTeams(summary);
    }

    // Log summary to console
    this.logSummary(summary);
  }

  private buildSummary(_result: FullResult): TestSummary {
    const duration = Date.now() - this.startTime;

    return {
      total: this.testCount.total,
      passed: this.testCount.passed,
      failed: this.testCount.failed,
      skipped: this.testCount.skipped,
      flaky: 0,
      duration,
      failedTests: this.failedTests.slice(0, this.options.maxFailuresToShow),
      passRate: this.testCount.total > 0 
        ? Math.round((this.testCount.passed / this.testCount.total) * 100) 
        : 0,
    };
  }

  private async sendToSlack(summary: TestSummary) {
    try {
      const message = this.buildSlackMessage(summary);
      
      const response = await fetch(this.options.slackWebhookUrl!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        console.error(`❌ Slack error: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.error(`Response: ${text}`);
        return;
      }

      console.log('✅ Slack notification sent successfully');
    } catch (error) {
      console.error('❌ Failed to send Slack notification:', error);
    }
  }

  private async sendToTeams(summary: TestSummary) {
    try {
      const message = this.buildTeamsMessage(summary);

      const response = await fetch(this.options.teamsWebhookUrl!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        console.error(`❌ Teams error: ${response.status} ${response.statusText}`);
        return;
      }

      console.log('✅ Teams notification sent successfully');
    } catch (error) {
      console.error('❌ Failed to send Teams notification:', error);
    }
  }

  private buildSlackMessage(summary: TestSummary) {
    const emoji = summary.failed === 0 ? '✅' : '❌';
    const passRate = summary.total > 0 
      ? Math.round((summary.passed / summary.total) * 100)
      : 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blocks: any[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${emoji} Playwright Test Results`,
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Total Tests:*\n${summary.total}`,
          },
          {
            type: 'mrkdwn',
            text: `*✅ Passed:*\n${summary.passed}`,
          },
          {
            type: 'mrkdwn',
            text: `*❌ Failed:*\n${summary.failed}`,
          },
          {
            type: 'mrkdwn',
            text: `*Pass Rate:*\n${passRate}%`,
          },
        ],
      },
      {
        type: 'divider',
      },
    ];

    // Add failed tests section
    if (summary.failedTests.length > 0) {
      const failedSection = summary.failedTests
        .map(
          (test, idx) =>
            `${idx + 1}. *${test.title}*\n_${test.file}_\n\`${test.error.substring(0, 100)}\``
        )
        .join('\n\n');

      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*❌ Failed Tests (${summary.failed}):*\n${failedSection}`,
        },
      });
    }

    // Add footer
    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `⏱️ Duration: ${(summary.duration / 1000).toFixed(2)}s | 🔗 <${process.env.CI_BUILD_URL || 'local-build'}|View Report>`,
        },
      ],
    });

    return { blocks };
  }

  private buildTeamsMessage(summary: TestSummary) {
    const passRate = summary.total > 0 
      ? Math.round((summary.passed / summary.total) * 100)
      : 0;
    const themeColor = summary.failed === 0 ? '28a745' : 'dc3545';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const facts: any[] = [
      { name: 'Total Tests', value: summary.total.toString() },
      { name: 'Passed', value: summary.passed.toString() },
      { name: 'Failed', value: summary.failed.toString() },
      { name: 'Pass Rate', value: `${passRate}%` },
      { name: 'Duration', value: `${(summary.duration / 1000).toFixed(2)}s` },
    ];

    return {
      '@type': 'MessageCard',
      '@context': 'https://schema.org/extensions',
      summary: `Playwright Tests - ${summary.failed === 0 ? 'PASSED' : 'FAILED'}`,
      themeColor,
      title: 'Playwright Test Results',
      sections: [
        {
          activityTitle: `${summary.failed === 0 ? '✅' : '❌'} Test Execution Complete`,
          facts,
        },
        ...this.buildTeamsFailedSection(summary),
      ],
      potentialAction: [
        {
          '@type': 'OpenUri',
          name: 'View HTML Report',
          targets: [
            {
              os: 'default',
              uri: process.env.CI_BUILD_URL || 'file://./playwright-report/index.html',
            },
          ],
        },
      ],
    };
  }

  private buildTeamsFailedSection(summary: TestSummary) {
    if (summary.failedTests.length === 0) {
      return [];
    }

    const failedText = summary.failedTests
      .map(
        (test, idx) =>
          `${idx + 1}. **${test.title}** (${test.file})\n${test.error.substring(0, 100)}`
      )
      .join('\n\n');

    return [
      {
        activityTitle: `Failed Tests (${summary.failed})`,
        text: failedText,
      },
    ];
  }

  private logSummary(summary: TestSummary) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 TEST EXECUTION SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total:    ${summary.total}`);
    console.log(`✅ Passed: ${summary.passed}`);
    console.log(`❌ Failed: ${summary.failed}`);
    console.log(`⏭️  Skipped: ${summary.skipped}`);
    console.log(`🔄 Flaky:  ${summary.flaky}`);
    console.log(`⏱️  Duration: ${(summary.duration / 1000).toFixed(2)}s`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }
}

export default SlackReporter;
