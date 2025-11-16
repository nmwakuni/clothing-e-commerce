import { describe, it, expect, beforeEach } from 'vitest';
import { MpesaService } from './mpesa';

describe('MpesaService', () => {
  let mpesa: MpesaService;

  beforeEach(() => {
    mpesa = new MpesaService({
      consumerKey: 'test-key',
      consumerSecret: 'test-secret',
      businessShortCode: '174379',
      passkey: 'test-passkey',
      environment: 'sandbox',
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format phone number with leading 0', () => {
      const formatted = (mpesa as any).formatPhoneNumber('0712345678');
      expect(formatted).toBe('254712345678');
    });

    it('should format phone number with +254', () => {
      const formatted = (mpesa as any).formatPhoneNumber('+254712345678');
      expect(formatted).toBe('254712345678');
    });

    it('should keep already formatted number', () => {
      const formatted = (mpesa as any).formatPhoneNumber('254712345678');
      expect(formatted).toBe('254712345678');
    });

    it('should remove non-digit characters', () => {
      const formatted = (mpesa as any).formatPhoneNumber('0712-345-678');
      expect(formatted).toBe('254712345678');
    });
  });

  describe('validatePhoneNumber', () => {
    it('should validate correct Safaricom numbers', () => {
      expect(mpesa.validatePhoneNumber('0712345678')).toBe(true);
      expect(mpesa.validatePhoneNumber('0722345678')).toBe(true);
      expect(mpesa.validatePhoneNumber('0733345678')).toBe(true);
      expect(mpesa.validatePhoneNumber('0110345678')).toBe(true);
    });

    it('should reject invalid numbers', () => {
      expect(mpesa.validatePhoneNumber('0612345678')).toBe(false);
      expect(mpesa.validatePhoneNumber('0812345678')).toBe(false);
      expect(mpesa.validatePhoneNumber('12345')).toBe(false);
    });
  });

  describe('generateTimestamp', () => {
    it('should generate valid timestamp format', () => {
      const timestamp = (mpesa as any).generateTimestamp();
      expect(timestamp).toMatch(/^\d{14}$/);
    });
  });

  describe('parseCallback', () => {
    it('should parse successful callback', () => {
      const callbackData = {
        Body: {
          stkCallback: {
            MerchantRequestID: 'merchant-123',
            CheckoutRequestID: 'checkout-456',
            ResultCode: 0,
            ResultDesc: 'The service request is processed successfully.',
            CallbackMetadata: {
              Item: [
                { Name: 'MpesaReceiptNumber', Value: 'ABC123' },
                { Name: 'Amount', Value: 2900 },
                { Name: 'PhoneNumber', Value: '254712345678' },
                { Name: 'TransactionDate', Value: '20250116120000' },
              ],
            },
          },
        },
      };

      const result = mpesa.parseCallback(callbackData);
      expect(result.success).toBe(true);
      expect(result.mpesaReceiptNumber).toBe('ABC123');
      expect(result.amount).toBe(2900);
      expect(result.phoneNumber).toBe('254712345678');
    });

    it('should parse failed callback', () => {
      const callbackData = {
        Body: {
          stkCallback: {
            MerchantRequestID: 'merchant-123',
            CheckoutRequestID: 'checkout-456',
            ResultCode: 1032,
            ResultDesc: 'Request cancelled by user',
          },
        },
      };

      const result = mpesa.parseCallback(callbackData);
      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe('Request cancelled by user');
    });
  });
});
