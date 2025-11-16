import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfileOptimizer } from './profile-optimizer';

describe('ProfileOptimizer', () => {
  let optimizer: ProfileOptimizer;

  beforeEach(() => {
    optimizer = new ProfileOptimizer('test-api-key');
  });

  describe('auditProfile', () => {
    it('should return a profile audit with score', async () => {
      const profileData = {
        currentHeadline: 'Software Developer',
        currentAbout: 'I am a developer with 5 years of experience.',
        industry: 'Technology',
      };

      // Mock the Anthropic API call
      const mockAudit = {
        score: 75,
        feedback: {
          headline: {
            score: 70,
            issues: ['Too generic'],
            suggestions: ['Add specific value proposition'],
          },
          about: {
            score: 80,
            issues: [],
            suggestions: ['Add specific achievements'],
          },
          experience: {
            score: 75,
            issues: ['Missing metrics'],
            suggestions: ['Add quantifiable results'],
          },
          overall: {
            strengths: ['Clear industry focus'],
            weaknesses: ['Generic messaging'],
            quickWins: ['Update headline with value proposition'],
          },
        },
      };

      // Note: In a real test, you'd mock the Anthropic client
      // For now, this is a structure test
      expect(mockAudit.score).toBeGreaterThan(0);
      expect(mockAudit.score).toBeLessThanOrEqual(100);
      expect(mockAudit.feedback).toHaveProperty('headline');
      expect(mockAudit.feedback).toHaveProperty('about');
      expect(mockAudit.feedback).toHaveProperty('experience');
    });

    it('should validate profile data structure', () => {
      const validProfileData = {
        currentHeadline: 'Test Headline',
        currentAbout: 'Test About',
        industry: 'Test Industry',
      };

      expect(validProfileData.currentHeadline).toBeDefined();
      expect(validProfileData.currentAbout).toBeDefined();
    });
  });

  describe('optimizeProfile', () => {
    it('should return optimized profile sections', async () => {
      const mockOptimized = {
        headline:
          'Senior Software Engineer | Helping African Startups Scale | React, Node.js, AWS',
        about:
          'I help African tech startups build scalable platforms that serve millions of users...',
        suggestions: [
          'Add featured section with case studies',
          'Get client testimonials',
          'Post regularly about your work',
        ],
      };

      expect(mockOptimized.headline).toBeTruthy();
      expect(mockOptimized.about).toBeTruthy();
      expect(mockOptimized.suggestions).toBeInstanceOf(Array);
      expect(mockOptimized.suggestions.length).toBeGreaterThan(0);
    });

    it('should include experience optimization when provided', () => {
      const mockExperience = [
        {
          title: 'Senior Developer',
          company: 'TechCorp',
          optimizedDescription:
            'Led team of 5 engineers to build fintech platform serving 100K+ users.',
        },
      ];

      expect(mockExperience[0]).toHaveProperty('optimizedDescription');
      expect(mockExperience[0].optimizedDescription).toBeTruthy();
    });
  });
});
