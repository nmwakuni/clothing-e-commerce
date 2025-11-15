import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WhatsAppNewsBot } from './index';

// Mock dependencies
vi.mock('@mtaa/notifications', () => ({
  WhatsAppService: vi.fn().mockImplementation(() => ({
    sendTextMessage: vi.fn().mockResolvedValue({ success: true }),
    sendButtonMessage: vi.fn().mockResolvedValue({ success: true }),
  })),
}));

vi.mock('@mtaa/news-aggregator', () => ({
  NewsAggregatorService: vi.fn().mockImplementation(() => ({})),
}));

vi.mock('@mtaa/database', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ id: 'test-user-id' }]),
    leftJoin: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
  },
  users: {},
  userLocationSubscriptions: {},
  locations: {},
  articles: {},
}));

describe('WhatsAppNewsBot', () => {
  let bot: WhatsAppNewsBot;

  beforeEach(() => {
    bot = new WhatsAppNewsBot({
      whatsappAccessToken: 'test-token',
      whatsappPhoneNumberId: 'test-phone-id',
      anthropicApiKey: 'test-api-key',
    });
  });

  describe('handleMessage', () => {
    it('should handle menu command', async () => {
      const message = {
        from: '+254700000000',
        messageId: 'msg-123',
        timestamp: new Date().toISOString(),
        type: 'text' as const,
        text: 'menu',
      };

      await expect(bot.handleMessage(message)).resolves.not.toThrow();
    });

    it('should handle news command', async () => {
      const message = {
        from: '+254700000000',
        messageId: 'msg-123',
        timestamp: new Date().toISOString(),
        type: 'text' as const,
        text: 'news',
      };

      await expect(bot.handleMessage(message)).resolves.not.toThrow();
    });

    it('should handle subscribe command', async () => {
      const message = {
        from: '+254700000000',
        messageId: 'msg-123',
        timestamp: new Date().toISOString(),
        type: 'text' as const,
        text: 'subscribe',
      };

      await expect(bot.handleMessage(message)).resolves.not.toThrow();
    });

    it('should handle help command', async () => {
      const message = {
        from: '+254700000000',
        messageId: 'msg-123',
        timestamp: new Date().toISOString(),
        type: 'text' as const,
        text: 'help',
      };

      await expect(bot.handleMessage(message)).resolves.not.toThrow();
    });

    it('should handle button response', async () => {
      const message = {
        from: '+254700000000',
        messageId: 'msg-123',
        timestamp: new Date().toISOString(),
        type: 'button' as const,
        buttonId: 'subscribe_westlands',
      };

      await expect(bot.handleMessage(message)).resolves.not.toThrow();
    });
  });

  describe('sendDailyDigests', () => {
    it('should send digests to subscribed users', async () => {
      await expect(bot.sendDailyDigests()).resolves.not.toThrow();
    });
  });

  describe('sendBreakingNewsAlert', () => {
    it('should send breaking news to location subscribers', async () => {
      await expect(
        bot.sendBreakingNewsAlert('article-id', 'location-id')
      ).resolves.not.toThrow();
    });
  });
});
