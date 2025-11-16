import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NewsAggregatorService } from './index';

// Mock Anthropic
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              title: 'New Shopping Mall Opens in Westlands',
              summary: 'The Westlands Square Mall officially opened today',
              content: 'Full article content here...',
              category: 'business',
              tags: ['shopping', 'westlands', 'mall'],
              location: 'Westlands',
              confidence: 85,
              relevance: 'Highly relevant to Westlands residents',
            }),
          },
        ],
      }),
    },
  })),
}));

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: `
        <article>
          <h2>Test Article</h2>
          <p>Test content</p>
          <a href="/test-article">Read more</a>
        </article>
      `,
    }),
  },
}));

describe('NewsAggregatorService', () => {
  let service: NewsAggregatorService;

  beforeEach(() => {
    service = new NewsAggregatorService({
      anthropicApiKey: 'test-key',
    });
  });

  describe('generateLocalArticle', () => {
    it('should generate local article from raw news', async () => {
      const rawNews = [
        {
          title: 'Shopping Mall Opens',
          content: 'A new mall has opened...',
          url: 'https://example.com/news',
          publishedAt: new Date(),
          source: {
            name: 'Test Source',
            url: 'https://example.com',
            category: 'business' as const,
            credibilityScore: 90,
            language: 'en' as const,
          },
        },
      ];

      const article = await service.generateLocalArticle(rawNews, 'Nairobi', 'Westlands');

      expect(article).toBeDefined();
      expect(article?.title).toBeDefined();
      expect(article?.content).toBeDefined();
      expect(article?.confidence).toBeGreaterThan(0);
      expect(article?.sourceUrls).toHaveLength(1);
    });

    it('should return null for empty news array', async () => {
      const article = await service.generateLocalArticle([], 'Nairobi', 'Westlands');

      expect(article).toBeNull();
    });

    it('should include source URLs in generated article', async () => {
      const rawNews = [
        {
          title: 'Test News',
          content: 'Test content',
          url: 'https://source1.com/article',
          publishedAt: new Date(),
          source: {
            name: 'Source 1',
            url: 'https://source1.com',
            category: 'business' as const,
            credibilityScore: 85,
            language: 'en' as const,
          },
        },
        {
          title: 'Test News 2',
          content: 'Test content 2',
          url: 'https://source2.com/article',
          publishedAt: new Date(),
          source: {
            name: 'Source 2',
            url: 'https://source2.com',
            category: 'business' as const,
            credibilityScore: 80,
            language: 'en' as const,
          },
        },
      ];

      const article = await service.generateLocalArticle(rawNews, 'Nairobi');

      expect(article?.sourceUrls).toHaveLength(2);
      expect(article?.sourceUrls).toContain('https://source1.com/article');
      expect(article?.sourceUrls).toContain('https://source2.com/article');
    });
  });

  describe('findTrendingTopics', () => {
    it('should identify trending topics from news', async () => {
      const topics = await service.findTrendingTopics('Nairobi', 24);

      expect(topics).toBeDefined();
      expect(Array.isArray(topics)).toBe(true);
    });
  });

  describe('createDailyDigest', () => {
    it('should create daily digest from articles', async () => {
      const articles = [
        {
          title: 'Article 1',
          summary: 'Summary 1',
          content: 'Content 1',
          category: 'business',
          tags: ['tag1'],
          location: 'Westlands',
          confidence: 85,
          sourceUrls: ['https://example.com/1'],
        },
        {
          title: 'Article 2',
          summary: 'Summary 2',
          content: 'Content 2',
          category: 'community',
          tags: ['tag2'],
          location: 'Westlands',
          confidence: 90,
          sourceUrls: ['https://example.com/2'],
        },
      ];

      const digest = await service.createDailyDigest(articles, 'Westlands', 'en');

      expect(digest).toBeDefined();
      expect(typeof digest).toBe('string');
      expect(digest.length).toBeGreaterThan(0);
    });

    it('should support Swahili language', async () => {
      const articles = [
        {
          title: 'Habari',
          summary: 'Muhtasari',
          content: 'Maudhui',
          category: 'community',
          tags: ['habari'],
          location: 'Westlands',
          confidence: 85,
          sourceUrls: ['https://example.com/1'],
        },
      ];

      const digest = await service.createDailyDigest(articles, 'Westlands', 'sw');

      expect(digest).toBeDefined();
    });
  });
});
