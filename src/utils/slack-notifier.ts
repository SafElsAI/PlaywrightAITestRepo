/**
 * Slack Notification Service
 * Handles both webhook and bot token integration methods
 * Uses native fetch API (no external dependencies)
 */

import * as fs from 'fs';
import * as path from 'path';
import { SlackConfig, getSlackConfig } from '../config/slack.config';

interface TestResult {
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  screenshotPath?: string;
  tracePath?: string;
  browser?: string;
  timestamp: string;
}

interface TestStats {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
}

/**
 * Slack Notification Service
 */
export class SlackNotifier {
  private config: SlackConfig;
  private static instance: SlackNotifier;

  private constructor(config: SlackConfig) {
    this.config = config;
  }

  /**
   * Get or create singleton instance
   */
  static getInstance(): SlackNotifier {
    if (!SlackNotifier.instance) {
      const config = getSlackConfig();
      SlackNotifier.instance = new SlackNotifier(config);
    }
    return SlackNotifier.instance;
  }

  /**
   * Send notification using appropriate method
   */
  async notify(result: TestResult): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    // Check notification preferences
    if (result.status === 'passed' && !this.config.notifyOnPass) {
      return;
    }
    if (result.status === 'skipped' && !this.config.notifyOnSkip) {
      return;
    }
    if (result.status === 'failed' && !this.config.notifyOnFail) {
      return;
    }

    try {
      if (this.config.method === 'webhook') {
        await this.sendViaWebhook(result);
      } else {
        await this.sendViaBotToken(result);
      }
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
    }
  }

  /**
   * Send notification via Webhook (simple JSON, no file upload)
   */
  private async sendViaWebhook(result: TestResult): Promise<void> {
    if (!this.config.webhookUrl) {
      throw new Error('Webhook URL not configured');
    }

    const emoji = this.getStatusEmoji(result.status);

    const payload: Record<string, unknown> = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${emoji} Test ${result.status.toUpperCase()}`,
            emoji: true,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Test:*\n${result.testName}`,
            },
            {
              type: 'mrkdwn',
              text: `*Browser:*\n${result.browser || 'Unknown'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Duration:*\n${result.duration}ms`,
            },
            {
              type: 'mrkdwn',
              text: `*Time:*\n${result.timestamp}`,
            },
          ],
        },
      ],
    };

    // Add error details if test failed
    if (result.status === 'failed' && result.error) {
      (payload.blocks as Array<Record<string, unknown>>).push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Error:*\n\`\`\`${result.error}\`\`\``,
        },
      });
    }

    // Add divider
    (payload.blocks as Array<Record<string, unknown>>).push({
      type: 'divider',
    });

    const response = await fetch(this.config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Slack webhook failed: ${response.status} ${response.statusText}`);
    }

    console.log('✓ Slack notification sent via webhook');
  }

  /**
   * Send notification via Bot Token (supports file uploads)
   */
  private async sendViaBotToken(result: TestResult): Promise<void> {
    if (!this.config.botToken) {
      throw new Error('Bot token not configured');
    }

    const emoji = this.getStatusEmoji(result.status);
    const channel = this.formatChannel(this.config.channel);

    // Main message
    const attachments = [
      {
        color: this.getStatusColor(result.status),
        title: `${emoji} Test ${result.status.toUpperCase()}`,
        fields: [
          {
            title: 'Test Name',
            value: result.testName,
            short: false,
          },
          {
            title: 'Browser',
            value: result.browser || 'Unknown',
            short: true,
          },
          {
            title: 'Duration',
            value: `${result.duration}ms`,
            short: true,
          },
          {
            title: 'Timestamp',
            value: result.timestamp,
            short: true,
          },
        ],
      },
    ];

    // Add error details if test failed
    if (result.status === 'failed' && result.error) {
      attachments[0].fields.push({
        title: 'Error Details',
        value: `\`\`\`${result.error}\`\`\``,
        short: false,
      });
    }

    // Post main message
    try {
      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: channel,
          attachments: attachments,
        }),
      });

      const data = (await response.json()) as Record<string, unknown>;

      if (!data.ok) {
        throw new Error(`Slack API error: ${data.error}`);
      }

      console.log('✓ Slack message posted via bot token');

      // Upload files if enabled
      if (this.config.uploadScreenshots && result.screenshotPath) {
        await this.uploadFile(channel, result.screenshotPath, 'Screenshot', result.testName);
      }

      if (this.config.uploadTraces && result.tracePath) {
        await this.uploadFile(channel, result.tracePath, 'Trace File', result.testName);
      }
    } catch (error) {
      console.error('Failed to post message:', error);
      throw error;
    }
  }

  /**
   * Upload file to Slack (bot token method only)
   */
  private async uploadFile(
    channel: string,
    filePath: string,
    fileType: string,
    testName: string
  ): Promise<void> {
    if (!this.config.botToken) {
      throw new Error('Bot token not configured');
    }

    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      return;
    }

    try {
      const fileBuffer = fs.readFileSync(filePath);
      const fileName = path.basename(filePath);

      // Create FormData
      const formData = new FormData();
      const blob = new Blob([fileBuffer]);
      formData.append('channels', channel);
      formData.append('file', blob, fileName);
      formData.append('title', `${fileType} - ${testName}`);
      formData.append('initial_comment', `${fileType} for: ${testName}`);

      const response = await fetch('https://slack.com/api/files.upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.botToken}`,
        },
        body: formData,
      });

      const data = (await response.json()) as Record<string, unknown>;

      if (!data.ok) {
        throw new Error(`File upload error: ${data.error}`);
      }

      console.log(`✓ ${fileType} uploaded to Slack`);
    } catch (error) {
      console.error(`Failed to upload ${fileType}:`, error);
    }
  }

  /**
   * Get color code based on test status
   */
  private getStatusColor(status: string): string {
    switch (status) {
      case 'passed':
        return '#36a64f'; // Green
      case 'failed':
        return '#ff0000'; // Red
      case 'skipped':
        return '#ffa500'; // Orange
      default:
        return '#808080'; // Gray
    }
  }

  /**
   * Get emoji based on test status
   */
  private getStatusEmoji(status: string): string {
    switch (status) {
      case 'passed':
        return '✅';
      case 'failed':
        return '❌';
      case 'skipped':
        return '⏭️';
      default:
        return '❓';
    }
  }

  /**
   * Format channel name for Slack API
   */
  private formatChannel(channel: string): string {
    if (channel.startsWith('#')) {
      return channel.substring(1);
    }
    return channel;
  }

  /**
   * Send summary of test run
   */
  async sendSummary(stats: TestStats): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    const passRate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : '0';
    const emoji = stats.failed === 0 ? '✅' : '⚠️';

    if (this.config.method === 'webhook') {
      await this.sendWebhookSummary(stats, emoji, passRate);
    } else {
      await this.sendBotTokenSummary(stats, emoji, passRate);
    }
  }

  /**
   * Send summary via webhook
   */
  private async sendWebhookSummary(
    stats: TestStats,
    emoji: string,
    passRate: string
  ): Promise<void> {
    if (!this.config.webhookUrl) {
      throw new Error('Webhook URL not configured');
    }

    const payload = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${emoji} Test Run Summary`,
            emoji: true,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Total:*\n${stats.total}`,
            },
            {
              type: 'mrkdwn',
              text: `*Passed:*\n${stats.passed}`,
            },
            {
              type: 'mrkdwn',
              text: `*Failed:*\n${stats.failed}`,
            },
            {
              type: 'mrkdwn',
              text: `*Skipped:*\n${stats.skipped}`,
            },
            {
              type: 'mrkdwn',
              text: `*Pass Rate:*\n${passRate}%`,
            },
            {
              type: 'mrkdwn',
              text: `*Duration:*\n${(stats.duration / 1000).toFixed(2)}s`,
            },
          ],
        },
      ],
    };

    const response = await fetch(this.config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Slack webhook failed: ${response.status} ${response.statusText}`);
    }

    console.log('✓ Test summary sent via Slack webhook');
  }

  /**
   * Send summary via bot token
   */
  private async sendBotTokenSummary(
    stats: TestStats,
    emoji: string,
    passRate: string
  ): Promise<void> {
    if (!this.config.botToken) {
      throw new Error('Bot token not configured');
    }

    const channel = this.formatChannel(this.config.channel);
    const color = stats.failed === 0 ? '#36a64f' : '#ff0000';

    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: channel,
        attachments: [
          {
            color: color,
            title: `${emoji} Test Run Summary`,
            fields: [
              { title: 'Total', value: `${stats.total}`, short: true },
              { title: 'Passed', value: `${stats.passed}`, short: true },
              { title: 'Failed', value: `${stats.failed}`, short: true },
              { title: 'Skipped', value: `${stats.skipped}`, short: true },
              { title: 'Pass Rate', value: `${passRate}%`, short: true },
              { title: 'Duration', value: `${(stats.duration / 1000).toFixed(2)}s`, short: true },
            ],
          },
        ],
      }),
    });

    const data = (await response.json()) as Record<string, unknown>;

    if (!data.ok) {
      throw new Error(`Slack API error: ${data.error}`);
    }

    console.log('✓ Test summary posted via Slack bot');
  }
}

export default SlackNotifier;
