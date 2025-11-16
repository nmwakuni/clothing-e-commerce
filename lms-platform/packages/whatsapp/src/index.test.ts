import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WhatsAppService } from './index';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('WhatsAppService', () => {
  let service: WhatsAppService;

  beforeEach(() => {
    service = new WhatsAppService({
      accessToken: 'test-token',
      phoneNumberId: '123456',
      webhookVerifyToken: 'verify-token',
      businessAccountId: 'business-123',
    });
    vi.clearAllMocks();
  });

  describe('verifyWebhook', () => {
    it('should return challenge when token matches', () => {
      const result = service.verifyWebhook('subscribe', 'verify-token', 'challenge-123');
      expect(result).toBe('challenge-123');
    });

    it('should return null when token does not match', () => {
      const result = service.verifyWebhook('subscribe', 'wrong-token', 'challenge-123');
      expect(result).toBeNull();
    });

    it('should return null when mode is not subscribe', () => {
      const result = service.verifyWebhook('unsubscribe', 'verify-token', 'challenge-123');
      expect(result).toBeNull();
    });
  });

  describe('sendTextMessage', () => {
    it('should send text message successfully', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { messages: [{ id: 'msg-123' }] },
      });

      const result = await service.sendTextMessage('+254712345678', 'Hello World');

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('msg-123');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/messages'),
        expect.objectContaining({
          messaging_product: 'whatsapp',
          to: '+254712345678',
          type: 'text',
          text: { body: 'Hello World' },
        }),
        expect.any(Object)
      );
    });

    it('should handle errors gracefully', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      const result = await service.sendTextMessage('+254712345678', 'Hello');

      expect(result.success).toBe(false);
      expect(result.messageId).toBeUndefined();
    });
  });

  describe('sendButtonMessage', () => {
    it('should send button message successfully', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { messages: [{ id: 'msg-123' }] },
      });

      const result = await service.sendButtonMessage('+254712345678', 'Choose an option', [
        { id: 'option1', title: 'Option 1' },
        { id: 'option2', title: 'Option 2' },
      ]);

      expect(result.success).toBe(true);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          type: 'interactive',
          interactive: expect.objectContaining({
            type: 'button',
          }),
        }),
        expect.any(Object)
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark message as read', async () => {
      mockedAxios.post.mockResolvedValue({ data: {} });

      const result = await service.markAsRead('msg-123');

      expect(result).toBe(true);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: 'msg-123',
        }),
        expect.any(Object)
      );
    });
  });
});
