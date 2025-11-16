import { describe, it, expect } from 'vitest';
import { PLANS, convertPrice, getPlanPricing } from './pricing';

describe('Pricing', () => {
  describe('PLANS configuration', () => {
    it('should have all required plans', () => {
      expect(PLANS).toHaveProperty('free');
      expect(PLANS).toHaveProperty('starter');
      expect(PLANS).toHaveProperty('pro');
      expect(PLANS).toHaveProperty('agency');
    });

    it('should have free tier with zero price', () => {
      expect(PLANS.free.monthlyPrice).toBe(0);
      expect(PLANS.free.yearlyPrice).toBe(0);
    });

    it('should have starter tier with correct pricing', () => {
      expect(PLANS.starter.monthlyPrice).toBe(2900);
      expect(PLANS.starter.yearlyPrice).toBe(29000);
    });

    it('should have feature limits defined', () => {
      expect(PLANS.starter.features.prospectResearch).toBe(50);
      expect(PLANS.pro.features.prospectResearch).toBe(200);
      expect(PLANS.agency.features.prospectResearch).toBe('unlimited');
    });
  });

  describe('convertPrice', () => {
    it('should convert KES to NGN', () => {
      const result = convertPrice(2900, 'NGN');
      expect(result).toBeGreaterThan(0);
      expect(result).toBeCloseTo(34800, -2); // 2900 * 12
    });

    it('should convert KES to UGX', () => {
      const result = convertPrice(2900, 'UGX');
      expect(result).toBeGreaterThan(0);
      expect(result).toBeCloseTo(105850, -2); // 2900 * 36.5
    });

    it('should convert KES to USD', () => {
      const result = convertPrice(2900, 'USD');
      expect(result).toBeGreaterThan(0);
      expect(result).toBeCloseTo(23, 0); // 2900 * 0.0077
    });

    it('should keep KES as is', () => {
      const result = convertPrice(2900, 'KES');
      expect(result).toBe(2900);
    });
  });

  describe('getPlanPricing', () => {
    it('should get monthly pricing in KES', () => {
      const pricing = getPlanPricing('starter', 'KES', 'monthly');
      expect(pricing.amount).toBe(2900);
      expect(pricing.currency).toBe('KES');
      expect(pricing.period).toBe('monthly');
      expect(pricing.plan).toBe('Starter');
    });

    it('should get yearly pricing with discount', () => {
      const monthly = getPlanPricing('starter', 'KES', 'monthly');
      const yearly = getPlanPricing('starter', 'KES', 'yearly');

      // Yearly should be less than 12 * monthly (2 months free)
      expect(yearly.amount).toBe(29000);
      expect(yearly.amount).toBeLessThan(monthly.amount * 12);
    });

    it('should convert to different currency', () => {
      const kesPrice = getPlanPricing('starter', 'KES', 'monthly');
      const ngnPrice = getPlanPricing('starter', 'NGN', 'monthly');

      expect(ngnPrice.amount).toBeGreaterThan(kesPrice.amount);
      expect(ngnPrice.currency).toBe('NGN');
    });

    it('should throw error for invalid plan', () => {
      expect(() => getPlanPricing('invalid', 'KES', 'monthly')).toThrow('Invalid plan');
    });

    it('should include feature limits', () => {
      const pricing = getPlanPricing('starter', 'KES', 'monthly');
      expect(pricing.features).toBeDefined();
      expect(pricing.features.prospectResearch).toBe(50);
    });
  });
});
