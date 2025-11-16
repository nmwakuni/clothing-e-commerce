import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResendNotificationService } from './index';

// Mock Resend
vi.mock('resend', () => ({
  Resend: vi.fn(() => ({
    emails: {
      send: vi.fn(),
    },
  })),
}));

describe('ResendNotificationService', () => {
  let service: ResendNotificationService;

  beforeEach(() => {
    service = new ResendNotificationService('test-key', 'SkillHub Africa <noreply@skillhub.co.ke>');
    vi.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const resend = (service as any).resend;
      resend.emails.send = vi.fn().mockResolvedValue({
        data: { id: 'email-123' },
        error: null,
      });

      const result = await service.sendEmail({
        to: 'user@example.com',
        subject: 'Test Email',
        html: '<h1>Hello</h1>',
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('email-123');
    });

    it('should handle errors gracefully', async () => {
      const resend = (service as any).resend;
      resend.emails.send = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'API Error' },
      });

      const result = await service.sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: 'Content',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should send to multiple recipients', async () => {
      const resend = (service as any).resend;
      resend.emails.send = vi.fn().mockResolvedValue({
        data: { id: 'email-123' },
        error: null,
      });

      const result = await service.sendEmail({
        to: ['user1@example.com', 'user2@example.com'],
        subject: 'Test',
        html: 'Content',
      });

      expect(result.success).toBe(true);
    });

    it('should use default from address', async () => {
      const resend = (service as any).resend;
      const sendMock = vi.fn().mockResolvedValue({
        data: { id: 'email-123' },
        error: null,
      });
      resend.emails.send = sendMock;

      await service.sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: 'Content',
      });

      expect(sendMock).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'SkillHub Africa <noreply@skillhub.co.ke>',
        })
      );
    });
  });
});
