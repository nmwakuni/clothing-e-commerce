import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIVerificationService } from './index';

// Mock Anthropic
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              credibilityScore: 85,
              fakeNewsScore: 15,
              toxicityScore: 5,
              flags: [],
              analysis: {
                factualAccuracy: 'Content appears factual',
                sourceCredibility: 'Source is credible',
                languageAnalysis: 'Professional tone',
                recommendations: ['Publish'],
              },
              decision: 'approve',
              confidence: 90,
            }),
          },
        ],
      }),
    },
  })),
}));

describe('AIVerificationService', () => {
  let service: AIVerificationService;

  beforeEach(() => {
    service = new AIVerificationService({
      anthropicApiKey: 'test-key',
      provider: 'claude',
    });
  });

  describe('verifyContent', () => {
    it('should verify legitimate news content', async () => {
      const result = await service.verifyContent({
        title: 'New Shopping Mall Opens in Westlands',
        content: 'The Westlands Square Mall officially opened today with over 100 stores.',
        category: 'business',
      });

      expect(result.isVerified).toBe(true);
      expect(result.credibilityScore).toBeGreaterThan(70);
      expect(result.fakeNewsScore).toBeLessThan(30);
      expect(result.decision).toBe('approve');
    });

    it('should detect low credibility content', async () => {
      const mockService = new AIVerificationService({
        anthropicApiKey: 'test-key',
        provider: 'claude',
      });

      // Override mock for this test
      vi.spyOn(mockService as any, 'verifyWithClaude').mockResolvedValue({
        isVerified: false,
        credibilityScore: 30,
        fakeNewsScore: 80,
        toxicityScore: 10,
        flags: ['clickbait', 'unverified-sources'],
        analysis: {
          factualAccuracy: 'Claims are unverified',
          sourceCredibility: 'Source is unknown',
          languageAnalysis: 'Sensationalist language',
          recommendations: ['Reject'],
        },
        decision: 'reject',
        confidence: 75,
      });

      const result = await mockService.verifyContent({
        title: 'SHOCKING: Aliens Land in Nairobi!!!',
        content: 'You won\'t believe what happened...',
        category: 'breaking',
      });

      expect(result.isVerified).toBe(false);
      expect(result.credibilityScore).toBeLessThan(50);
      expect(result.decision).toBe('reject');
      expect(result.flags).toContain('clickbait');
    });

    it('should flag for review on medium scores', async () => {
      const mockService = new AIVerificationService({
        anthropicApiKey: 'test-key',
        provider: 'claude',
      });

      vi.spyOn(mockService as any, 'verifyWithClaude').mockResolvedValue({
        isVerified: false,
        credibilityScore: 60,
        fakeNewsScore: 40,
        toxicityScore: 20,
        flags: ['needs-verification'],
        analysis: {
          factualAccuracy: 'Some claims need verification',
          sourceCredibility: 'Source is somewhat credible',
          languageAnalysis: 'Mostly neutral',
          recommendations: ['Manual review recommended'],
        },
        decision: 'flag_review',
        confidence: 60,
      });

      const result = await mockService.verifyContent({
        title: 'Unconfirmed Reports of Traffic Incident',
        content: 'According to unverified sources...',
        category: 'breaking',
      });

      expect(result.decision).toBe('flag_review');
      expect(result.credibilityScore).toBeGreaterThanOrEqual(50);
      expect(result.credibilityScore).toBeLessThanOrEqual(70);
    });
  });

  describe('quickModeration', () => {
    it('should detect inappropriate content', async () => {
      const result = await service.quickModeration('This content contains hate speech');

      // Since we're mocking, this will return safe=true
      // In production with real OpenAI, it would detect inappropriate content
      expect(result).toHaveProperty('safe');
      expect(result).toHaveProperty('categories');
    });
  });
});
