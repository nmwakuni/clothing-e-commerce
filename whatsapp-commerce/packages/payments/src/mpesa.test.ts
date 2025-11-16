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

    it('should keep properly formatted number', () => {
      const formatted = (mpesa as any).formatPhoneNumber('254712345678');
      expect(formatted).toBe('254712345678');
    });

    it('should remove spaces and dashes', () => {
      const formatted = (mpesa as any).formatPhoneNumber('0712-345-678');
      expect(formatted).toBe('254712345678');
    });
  });

  describe('validatePhoneNumber', () => {
    it('should validate Safaricom number', () => {
      expect(mpesa.validatePhoneNumber('0712345678')).toBe(true);
      expect(mpesa.validatePhoneNumber('0722345678')).toBe(true);
    });

    it('should validate Airtel number', () => {
      expect(mpesa.validatePhoneNumber('0733345678')).toBe(true);
    });

    it('should reject invalid numbers', () => {
      expect(mpesa.validatePhoneNumber('0612345678')).toBe(false); // Wrong prefix
      expect(mpesa.validatePhoneNumber('071234567')).toBe(false); // Too short
      expect(mpesa.validatePhoneNumber('07123456789')).toBe(false); // Too long
    });
  });

  describe('generateTimestamp', () => {
    it('should generate timestamp in correct format', () => {
      const timestamp = (mpesa as any).generateTimestamp();
      expect(timestamp).toMatch(/^\d{14}$/); // YYYYMMDDHHmmss
    });
  });

  describe('parseCallback', () => {
    it('should parse successful callback', () => {
      const callbackData = {
        Body: {
          stkCallback: {
            MerchantRequestID: 'test-merchant-id',
            CheckoutRequestID: 'test-checkout-id',
            ResultCode: 0,
            ResultDesc: 'Success',
            CallbackMetadata: {
              Item: [
                { Name: 'MpesaReceiptNumber', Value: 'ABC123' },
                { Name: 'TransactionDate', Value: '20250116120000' },
                { Name: 'PhoneNumber', Value: '254712345678' },
              ],
            },
          },
        },
      };

      const result = mpesa.parseCallback(callbackData);

      expect(result.merchantRequestId).toBe('test-merchant-id');
      expect(result.checkoutRequestId).toBe('test-checkout-id');
      expect(result.resultCode).toBe(0);
      expect(result.mpesaReceiptNumber).toBe('ABC123');
      expect(result.phoneNumber).toBe('254712345678');
    });

    it('should parse failed callback', () => {
      const callbackData = {
        Body: {
          stkCallback: {
            MerchantRequestID: 'test-merchant-id',
            CheckoutRequestID: 'test-checkout-id',
            ResultCode: 1032,
            ResultDesc: 'Request cancelled by user',
          },
        },
      };

      const result = mpesa.parseCallback(callbackData);

      expect(result.resultCode).toBe(1032);
      expect(result.resultDesc).toBe('Request cancelled by user');
      expect(result.mpesaReceiptNumber).toBeUndefined();
    });
  });
});
