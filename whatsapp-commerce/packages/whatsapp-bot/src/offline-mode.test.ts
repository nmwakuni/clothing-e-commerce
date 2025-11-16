import { describe, it, expect, beforeEach } from 'vitest';
import { OfflineModeService } from './offline-mode';

describe('OfflineModeService', () => {
  let service: OfflineModeService;

  beforeEach(() => {
    service = new OfflineModeService();
  });

  describe('parseSMSOrder', () => {
    it('should parse valid SMS order code', () => {
      const result = service.parseSMSOrder('P001*2', '254712345678');

      expect(result).toBeDefined();
      expect(result?.parsedOrder.productId).toBe('001');
      expect(result?.parsedOrder.quantity).toBe(2);
    });

    it('should parse multiple products (first one)', () => {
      const result = service.parseSMSOrder('P001*2,P005*1', '254712345678');

      expect(result).toBeDefined();
      expect(result?.parsedOrder.productId).toBe('001');
    });

    it('should return null for invalid format', () => {
      const result = service.parseSMSOrder('invalid order', '254712345678');
      expect(result).toBeNull();
    });

    it('should handle case insensitive codes', () => {
      const result = service.parseSMSOrder('p001*2', '254712345678');
      expect(result).toBeDefined();
    });
  });

  describe('generateCatalogText', () => {
    it('should generate formatted catalog', () => {
      const catalog = {
        vendorId: 'v1',
        vendorName: 'Test Shop',
        products: [
          {
            id: 'p1',
            name: 'Test Product',
            price: 1000,
            description: 'Test description',
            stock: 10,
          },
        ],
        generatedAt: new Date(),
      };

      const text = service.generateCatalogText(catalog);

      expect(text).toContain('Test Shop');
      expect(text).toContain('Test Product');
      expect(text).toContain('1,000');
      expect(text).toContain('P001');
    });
  });

  describe('generateSMSConfirmation', () => {
    it('should generate SMS confirmation with order details', () => {
      const confirmation = service.generateSMSConfirmation(
        'ORD-001',
        'Test Product',
        2,
        2000
      );

      expect(confirmation).toContain('ORD-001');
      expect(confirmation).toContain('2x Test Product');
      expect(confirmation).toContain('2,000');
      expect(confirmation).toContain('M-Pesa');
    });
  });

  describe('generateProductQRCode', () => {
    it('should generate WhatsApp QR URL', () => {
      const qrUrl = service.generateProductQRCode('P001', 'vendor123');

      expect(qrUrl).toContain('wa.me');
      expect(qrUrl).toContain('P001');
    });
  });

  describe('generateCSV', () => {
    it('should generate CSV with headers and data', () => {
      const catalog = {
        vendorId: 'v1',
        vendorName: 'Test Shop',
        products: [
          {
            id: 'p1',
            name: 'Product 1',
            price: 1000,
            description: 'Description',
            stock: 5,
          },
        ],
        generatedAt: new Date(),
      };

      const csv = service.generateCSV(catalog);

      expect(csv).toContain('Code,Name,Price');
      expect(csv).toContain('P001');
      expect(csv).toContain('Product 1');
      expect(csv).toContain('1000');
    });
  });
});
