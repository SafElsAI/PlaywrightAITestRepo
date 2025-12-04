/**
 * Slack Integration Configuration
 * Supports two methods:
 * 1. Webhook URL (simple JSON payload, no file upload)
 * 2. Bot Token (allows file/screenshot upload with advanced features)
 */

export interface SlackConfig {
  enabled: boolean;
  method: 'webhook' | 'bot-token';
  webhookUrl?: string;
  botToken?: string;
  channel: string;
  notifyOnPass?: boolean;
  notifyOnFail: boolean;
  notifyOnSkip?: boolean;
  uploadScreenshots: boolean;
  uploadTraces: boolean;
}

/**
 * Get Slack configuration from environment variables
 */
export function getSlackConfig(): SlackConfig {
  const enabled = process.env.SLACK_ENABLED === 'true';
  const method = (process.env.SLACK_METHOD || 'webhook') as 'webhook' | 'bot-token';
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  const botToken = process.env.SLACK_BOT_TOKEN;
  const channel = process.env.SLACK_CHANNEL || '#test-results';

  // Validate configuration
  if (enabled) {
    if (method === 'webhook' && !webhookUrl) {
      throw new Error('SLACK_WEBHOOK_URL is required when using webhook method');
    }
    if (method === 'bot-token' && !botToken) {
      throw new Error('SLACK_BOT_TOKEN is required when using bot-token method');
    }
  }

  return {
    enabled,
    method,
    webhookUrl,
    botToken,
    channel,
    notifyOnPass: process.env.SLACK_NOTIFY_PASS === 'true',
    notifyOnFail: process.env.SLACK_NOTIFY_FAIL !== 'false', // true by default
    notifyOnSkip: process.env.SLACK_NOTIFY_SKIP === 'true',
    uploadScreenshots: process.env.SLACK_UPLOAD_SCREENSHOTS === 'true',
    uploadTraces: process.env.SLACK_UPLOAD_TRACES === 'true',
  };
}

/**
 * Validate channel name format
 */
export function isValidSlackChannel(channel: string): boolean {
  // Channels start with # or can be user IDs
  return /^[#@]?[a-z0-9_-]+$/.test(channel.toLowerCase());
}
