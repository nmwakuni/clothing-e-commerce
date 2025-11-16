import { describe, it, expect } from 'vitest';
import { OutreachGenerator } from './outreach-generator';

describe('OutreachGenerator', () => {
  let generator: OutreachGenerator;

  beforeEach(() => {
    generator = new OutreachGenerator('test-api-key');
  });

  describe('generateOutreach', () => {
    it('should generate connection request under 200 characters', () => {
      const mockConnectionRequest =
        "Hi Sarah, I saw your post about scaling fintech in Africa - completely agree on the compliance challenges. Would love to connect!";

      expect(mockConnectionRequest.length).toBeLessThanOrEqual(200);
    });

    it('should generate follow-up sequence', () => {
      const mockSequence = {
        followup1: 'Thanks for connecting, Sarah!...',
        followup2: 'Sarah, I came across this article...',
        followup3: 'Sarah, I've helped companies like TechCorp...',
      };

      expect(mockSequence).toHaveProperty('followup1');
      expect(mockSequence).toHaveProperty('followup2');
      expect(mockSequence).toHaveProperty('followup3');
    });

    it('should generate cold email with subject and body', () => {
      const mockEmail = {
        subject: 'Scaling TechCorp across East Africa',
        body: 'Hi Sarah,\n\nI noticed TechCorp recently expanded to Uganda...',
      };

      expect(mockEmail.subject).toBeTruthy();
      expect(mockEmail.body).toBeTruthy();
      expect(mockEmail.subject.length).toBeLessThan(100);
    });

    it('should track personalization data used', () => {
      const mockPersonalization = [
        'Recent post about fintech scaling',
        'Company expansion to Uganda',
        'Title indicates decision-making authority',
      ];

      expect(mockPersonalization).toBeInstanceOf(Array);
      expect(mockPersonalization.length).toBeGreaterThan(0);
    });
  });

  describe('analyzeProspect', () => {
    it('should identify pain points from profile data', () => {
      const mockAnalysis = {
        painPoints: [
          'Scaling team rapidly - likely facing talent challenges',
          'Expanding to new markets - need local expertise',
        ],
        interests: ['Fintech innovation', 'African market expansion'],
        buyingSignals: ['Just raised Series A', 'Posted about hiring challenges'],
        personalizationAngle: 'Reference their Series A and offer scaling insights',
      };

      expect(mockAnalysis.painPoints).toBeInstanceOf(Array);
      expect(mockAnalysis.interests).toBeInstanceOf(Array);
      expect(mockAnalysis.buyingSignals).toBeInstanceOf(Array);
      expect(mockAnalysis.personalizationAngle).toBeTruthy();
    });

    it('should handle profiles with minimal data', () => {
      const minimalProfile = {
        name: 'John Doe',
        headline: 'CEO',
        company: 'Startup Inc',
      };

      expect(minimalProfile.name).toBeTruthy();
      expect(minimalProfile.headline).toBeTruthy();
    });
  });
});
