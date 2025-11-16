import { describe, it, expect, beforeEach } from 'vitest';
import { MultiCurrencyService } from './multi-currency';

describe('MultiCurrencyService', () => {
  let service: MultiCurrencyService;

  beforeEach(() => {
    service = new MultiCurrencyService();
  });

  describe('convert', () => {
    it('should convert KES to UGX', () => {
      const result = service.convert(1000, 'KES', 'UGX');
      expect(result).toBeGreaterThan(0);
    });

    it('should convert KES to NGN', () => {
      const result = service.convert(15000, 'KES', 'NGN');
      expect(result).toBeCloseTo(9000, -2); // Approximate
    });

    it('should return same amount for same currency', () => {
      const result = service.convert(1000, 'KES', 'KES');
      expect(result).toBe(1000);
    });

    it('should handle decimal places correctly', () => {
      const result = service.convert(1000, 'KES', 'UGX');
      expect(Number.isInteger(result)).toBe(true); // UGX has 0 decimal places
    });
  });

  describe('format', () => {
    it('should format KES with 2 decimal places', () => {
      const formatted = service.format(1500.5, 'KES');
      expect(formatted).toBe('KES 1,500.50');
    });

    it('should format UGX with 0 decimal places', () => {
      const formatted = service.format(3700, 'UGX');
      expect(formatted).toBe('UGX 3,700');
    });

    it('should format NGN with symbol', () => {
      const formatted = service.format(9000, 'NGN');
      expect(formatted).toContain('₦');
      expect(formatted).toContain('9,000.00');
    });
  });

  describe('getCurrencyFromPhone', () => {
    it('should detect KES from Kenya number', () => {
      expect(service.getCurrencyFromPhone('254712345678')).toBe('KES');
      expect(service.getCurrencyFromPhone('+254722345678')).toBe('KES');
      expect(service.getCurrencyFromPhone('0712345678')).toBe('KES');
    });

    it('should detect UGX from Uganda number', () => {
      expect(service.getCurrencyFromPhone('256712345678')).toBe('UGX');
    });

    it('should detect TZS from Tanzania number', () => {
      expect(service.getCurrencyFromPhone('255712345678')).toBe('TZS');
    });

    it('should detect RWF from Rwanda number', () => {
      expect(service.getCurrencyFromPhone('250712345678')).toBe('RWF');
    });

    it('should detect NGN from Nigeria number', () => {
      expect(service.getCurrencyFromPhone('234812345678')).toBe('NGN');
    });
  });

  describe('validateAmount', () => {
    it('should validate amount with correct decimals for KES', () => {
      expect(service.validateAmount(100.50, 'KES')).toBe(true);
      expect(service.validateAmount(100.505, 'KES')).toBe(false); // Too many decimals
    });

    it('should validate amount for UGX (no decimals)', () => {
      expect(service.validateAmount(1000, 'UGX')).toBe(true);
      expect(service.validateAmount(1000.5, 'UGX')).toBe(false); // No decimals allowed
    });

    it('should reject negative amounts', () => {
      expect(service.validateAmount(-100, 'KES')).toBe(false);
    });

    it('should reject zero', () => {
      expect(service.validateAmount(0, 'KES')).toBe(false);
    });
  });

  describe('getAllCurrencies', () => {
    it('should return all 6 supported currencies', () => {
      const currencies = service.getAllCurrencies();
      expect(currencies).toHaveLength(6);
      expect(currencies.map(c => c.code)).toContain('KES');
      expect(currencies.map(c => c.code)).toContain('UGX');
      expect(currencies.map(c => c.code)).toContain('NGN');
    });
  });
});
