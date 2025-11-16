import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WhatsAppService, EmailService } from './index';

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn().mockResolvedValue({
      data: {
        messages: [{ id: 'msg-123' }],
      },
    }),
  },
}));

// Mock Resend
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({
        id: 'email-123',
      }),
    },
  })),
}));

describe('WhatsAppService', () => {
  let service: WhatsAppService;

  beforeEach(() => {
    service = new WhatsAppService({
      accessToken: 'test-token',
      phoneNumberId: 'test-phone-id',
    });
  });

  describe('sendTextMessage', () => {
    it('should send text message successfully', async () => {
      const result = await service.sendTextMessage('+254700000000', 'Hello World');

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });

    it('should handle message with special characters', async () => {
      const result = await service.sendTextMessage(
        '+254700000000',
        '*Bold* _italic_ ~strikethrough~'
      );

      expect(result.success).toBe(true);
    });
  });

  describe('sendButtonMessage', () => {
    it('should send button message successfully', async () => {
      const buttons = [
        { id: 'btn1', title: 'Option 1' },
        { id: 'btn2', title: 'Option 2' },
      ];

      const result = await service.sendButtonMessage(
        '+254700000000',
        'Choose an option',
        buttons
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });
  });

  describe('sendNewsDigest', () => {
    it('should send news digest with image', async () => {
      const result = await service.sendNewsDigest(
        '+254700000000',
        'Breaking News',
        'Summary of the news',
        'https://example.com/image.jpg',
        'https://example.com/article'
      );

      expect(result.success).toBe(true);
    });

    it('should send news digest without image', async () => {
      const result = await service.sendNewsDigest(
        '+254700000000',
        'Breaking News',
        'Summary of the news'
      );

      expect(result.success).toBe(true);
    });
  });

  describe('sendEmergencyAlert', () => {
    it('should send emergency alert', async () => {
      const result = await service.sendEmergencyAlert(
        '+254700000000',
        'Fire',
        'Fire outbreak reported',
        'Westlands, Nairobi'
      );

      expect(result.success).toBe(true);
    });
  });
});

describe('EmailService', () => {
  let service: EmailService;

  beforeEach(() => {
    service = new EmailService({
      resendApiKey: 'test-key',
      fromEmail: 'news@mtaanews.co.ke',
      fromName: 'Mtaa News',
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email', async () => {
      const result = await service.sendWelcomeEmail(
        'user@example.com',
        'John Doe',
        'Westlands'
      );

      expect(result.success).toBe(true);
    });
  });

  describe('sendDailyDigest', () => {
    it('should send daily digest email', async () => {
      const articles = [
        {
          title: 'Article 1',
          summary: 'Summary 1',
          url: 'https://example.com/1',
          imageUrl: 'https://example.com/1.jpg',
        },
        {
          title: 'Article 2',
          summary: 'Summary 2',
          url: 'https://example.com/2',
        },
      ];

      const result = await service.sendDailyDigest(
        'user@example.com',
        'John Doe',
        'Westlands',
        articles
      );

      expect(result.success).toBe(true);
    });
  });

  describe('sendEmergencyAlert', () => {
    it('should send emergency alert email', async () => {
      const result = await service.sendEmergencyAlert(
        'user@example.com',
        'Fire',
        'Fire Outbreak',
        'Fire reported in building',
        'Westlands, Nairobi'
      );

      expect(result.success).toBe(true);
    });
  });
});
