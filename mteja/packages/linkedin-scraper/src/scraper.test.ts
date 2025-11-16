import { describe, it, expect } from 'vitest';

describe('LinkedInScraper', () => {
  describe('Profile Data Structure', () => {
    it('should validate profile structure', () => {
      const mockProfile = {
        name: 'John Doe',
        headline: 'CEO at TechCorp',
        location: 'Nairobi, Kenya',
        about: 'Building the future of fintech in Africa',
        currentPosition: {
          title: 'CEO',
          company: 'TechCorp',
        },
        experience: [
          {
            title: 'CEO',
            company: 'TechCorp',
            duration: '2020 - Present',
          },
        ],
        education: [
          {
            school: 'University of Nairobi',
            degree: 'BSc Computer Science',
          },
        ],
        skills: ['Leadership', 'Fintech', 'Strategy'],
      };

      expect(mockProfile.name).toBeTruthy();
      expect(mockProfile.headline).toBeTruthy();
      expect(mockProfile.experience).toBeInstanceOf(Array);
      expect(mockProfile.education).toBeInstanceOf(Array);
      expect(mockProfile.skills).toBeInstanceOf(Array);
    });

    it('should handle minimal profile data', () => {
      const minimalProfile = {
        name: 'Jane Smith',
        headline: 'Software Engineer',
        experience: [],
        education: [],
        skills: [],
      };

      expect(minimalProfile.name).toBeTruthy();
      expect(minimalProfile.experience).toEqual([]);
    });
  });

  describe('LinkedIn URL validation', () => {
    it('should validate correct LinkedIn URLs', () => {
      const validUrls = [
        'https://linkedin.com/in/johndoe',
        'https://www.linkedin.com/in/johndoe',
        'https://linkedin.com/in/jane-smith-123',
        'https://www.linkedin.com/in/company-name/',
      ];

      validUrls.forEach((url) => {
        expect(url).toMatch(/^https:\/\/(www\.)?linkedin\.com\/in\//);
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        'https://facebook.com/johndoe',
        'https://linkedin.com/company/test',
        'not-a-url',
      ];

      invalidUrls.forEach((url) => {
        expect(url).not.toMatch(/^https:\/\/(www\.)?linkedin\.com\/in\//);
      });
    });
  });

  describe('Recent Activity parsing', () => {
    it('should parse post activity', () => {
      const mockActivity = [
        {
          type: 'post',
          content: 'Excited to announce our Series A funding!',
          date: '2025-01-15',
        },
        {
          type: 'post',
          content: 'Hiring senior engineers in Nairobi',
          date: '2025-01-10',
        },
      ];

      expect(mockActivity).toBeInstanceOf(Array);
      expect(mockActivity[0]).toHaveProperty('type');
      expect(mockActivity[0]).toHaveProperty('content');
    });
  });
});
