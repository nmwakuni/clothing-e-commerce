import { describe, it, expect, beforeEach } from 'vitest';
import { VoiceCommerceService } from './voice-commerce';

describe('VoiceCommerceService', () => {
  let service: VoiceCommerceService;

  beforeEach(() => {
    service = new VoiceCommerceService('test-api-key');
  });

  describe('detectIntent', () => {
    it('should detect search intent from transcript', () => {
      const intent = (service as any).detectIntent('show me phones');
      expect(intent).toBe('search');
    });

    it('should detect order intent', () => {
      const intent = (service as any).detectIntent('I want to buy rice');
      expect(intent).toBe('order');
    });

    it('should detect track intent', () => {
      const intent = (service as any).detectIntent('where is my order');
      expect(intent).toBe('track');
    });

    it('should detect help intent', () => {
      const intent = (service as any).detectIntent('help me');
      expect(intent).toBe('help');
    });
  });

  describe('extractOrderData', () => {
    it('should extract quantity from transcript', () => {
      const data = (service as any).extractOrderData('I need 3 bags of rice');
      expect(data.quantity).toBe(3);
    });

    it('should extract price range', () => {
      const data = (service as any).extractOrderData('phones under 15000');
      expect(data.priceRange?.max).toBe(15000);
    });

    it('should handle transcript without quantity', () => {
      const data = (service as any).extractOrderData('show me dresses');
      expect(data.product).toContain('dresses');
    });
  });

  describe('generateResponse', () => {
    it('should generate search response', () => {
      const response = (service as any).generateResponse(
        'show me phones',
        'search',
        { product: 'phones' }
      );
      expect(response).toContain('search');
      expect(response).toContain('phones');
    });

    it('should generate order response', () => {
      const response = (service as any).generateResponse(
        'I want to buy 2 phones',
        'order',
        { product: 'phones', quantity: 2 }
      );
      expect(response).toContain('2');
      expect(response).toContain('order');
    });
  });
});
