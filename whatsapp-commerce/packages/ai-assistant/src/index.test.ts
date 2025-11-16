import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIShoppingAssistant } from './index';

describe('AIShoppingAssistant', () => {
  let assistant: AIShoppingAssistant;

  beforeEach(() => {
    assistant = new AIShoppingAssistant('test-api-key');
  });

  describe('parseSearchQuery', () => {
    it('should extract price range from query', async () => {
      const result = await assistant.parseSearchQuery('phones under 15000');

      expect(result.query).toContain('phones');
      expect(result.priceRange?.max).toBe(15000);
      expect(result.category).toBe('electronics');
    });

    it('should detect category from query', async () => {
      const result = await assistant.parseSearchQuery('red dresses');

      expect(result.query).toContain('dress');
      expect(result.category).toBe('fashion');
    });

    it('should extract location from query', async () => {
      const result = await assistant.parseSearchQuery('food in Nairobi');

      expect(result.location).toContain('Nairobi');
    });
  });

  describe('detectIntent', () => {
    it('should detect search intent', async () => {
      const result = await assistant.detectIntent('show me phones');

      expect(result.intent).toBe('search');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should detect order intent', async () => {
      const result = await assistant.detectIntent('I want to buy this');

      expect(result.intent).toBe('add_to_cart');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should detect track order intent', async () => {
      const result = await assistant.detectIntent('track my order');

      expect(result.intent).toBe('track_order');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should detect greeting intent', async () => {
      const result = await assistant.detectIntent('hello');

      expect(result.intent).toBe('greeting');
      expect(result.confidence).toBe(1.0);
    });
  });

  describe('recommendProducts', () => {
    it('should generate product recommendations', async () => {
      const products = [
        {
          id: '1',
          name: 'iPhone 13',
          description: 'Latest iPhone',
          price: 80000,
          category: 'electronics',
          vendor: 'TechHub',
          images: [],
          stock: 5,
          rating: 4.5,
          reviewCount: 120,
        },
      ];

      const result = await assistant.recommendProducts(products, {
        sessionState: 'browsing',
        conversationHistory: [],
      });

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
