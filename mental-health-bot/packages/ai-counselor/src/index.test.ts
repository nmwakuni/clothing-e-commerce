import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AICounselorService } from './index';

describe('AICounselorService', () => {
  let counselor: AICounselorService;

  beforeEach(() => {
    counselor = new AICounselorService('test-api-key');
  });

  describe('detectCrisis', () => {
    it('should detect suicidal ideation', async () => {
      const message = "I don't want to live anymore";
      const result = await counselor.detectCrisis(message);

      expect(result.isCrisis).toBe(true);
      expect(result.crisisType).toContain('suicidal_ideation');
      expect(['moderate', 'severe', 'critical']).toContain(result.severity);
    });

    it('should detect self-harm intent', async () => {
      const message = 'I want to hurt myself';
      const result = await counselor.detectCrisis(message);

      expect(result.isCrisis).toBe(true);
      expect(result.crisisType).toContain('self_harm');
    });

    it('should not flag normal conversation as crisis', async () => {
      const message = "I'm feeling a bit stressed about work";
      const result = await counselor.detectCrisis(message);

      expect(result.isCrisis).toBe(false);
      expect(result.severity).toBe('none');
    });

    it('should provide recommendations for crisis situations', async () => {
      const message = "I can't take it anymore, everything is hopeless";
      const result = await counselor.detectCrisis(message);

      expect(result.isCrisis).toBe(true);
      expect(result.recommendations).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('counsel', () => {
    it('should provide empathetic response', async () => {
      const message = "I'm feeling anxious";
      const result = await counselor.counsel(message, []);

      expect(result.response).toBeDefined();
      expect(result.response.length).toBeGreaterThan(0);
      expect(result.sentiment).toBeDefined();
    });

    it('should handle crisis in counseling session', async () => {
      const message = "I'm thinking about ending it all";
      const result = await counselor.counsel(message, []);

      expect(result.crisisDetected).toBe(true);
      expect(result.crisisResources).toBeDefined();
    });

    it('should maintain conversation context', async () => {
      const sessionHistory = [
        { role: 'user' as const, content: 'I have anxiety' },
        {
          role: 'assistant' as const,
          content: 'I understand. Tell me more about your anxiety.',
        },
      ];
      const message = 'It gets worse in social situations';

      const result = await counselor.counsel(message, sessionHistory);

      expect(result.response).toBeDefined();
    });

    it('should use user context for personalization', async () => {
      const userContext = {
        primaryConcerns: ['anxiety', 'stress'],
        triggers: ['work pressure'],
        copingStrategies: ['deep breathing'],
      };

      const result = await counselor.counsel(
        "I'm feeling overwhelmed",
        [],
        userContext
      );

      expect(result.response).toBeDefined();
    });
  });

  describe('getSelfCareRecommendations', () => {
    it('should return recommendations for anxiety', () => {
      const recommendations = counselor.getSelfCareRecommendations('anxiety');

      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations).toContain('Practice deep breathing exercises');
    });

    it('should return recommendations for depression', () => {
      const recommendations = counselor.getSelfCareRecommendations('depression');

      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('should return general recommendations for unknown concern', () => {
      const recommendations = counselor.getSelfCareRecommendations('unknown');

      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);
    });
  });
});
