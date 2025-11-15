import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface NewsSource {
  name: string;
  url: string;
  category: 'national' | 'local' | 'business' | 'sports' | 'entertainment';
  credibilityScore: number;
  language: 'en' | 'sw';
}

export interface RawNewsItem {
  title: string;
  content: string;
  url: string;
  publishedAt: Date;
  source: NewsSource;
  imageUrl?: string;
}

export interface LocalNewsArticle {
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  location: string;
  imageUrl?: string;
  confidence: number; // 0-100
  sourceUrls: string[];
}

export interface NewsAggregatorConfig {
  anthropicApiKey: string;
  sources?: NewsSource[];
  location?: string;
}

export class NewsAggregatorService {
  private anthropic: Anthropic;
  private sources: NewsSource[];
  private location: string;

  constructor(config: NewsAggregatorConfig) {
    this.anthropic = new Anthropic({
      apiKey: config.anthropicApiKey,
    });
    this.sources = config.sources || this.getDefaultSources();
    this.location = config.location || 'Nairobi';
  }

  private getDefaultSources(): NewsSource[] {
    return [
      {
        name: 'Daily Nation',
        url: 'https://nation.africa',
        category: 'national',
        credibilityScore: 90,
        language: 'en',
      },
      {
        name: 'The Standard',
        url: 'https://standardmedia.co.ke',
        category: 'national',
        credibilityScore: 85,
        language: 'en',
      },
      {
        name: 'Capital FM',
        url: 'https://capitalfm.co.ke',
        category: 'national',
        credibilityScore: 80,
        language: 'en',
      },
      {
        name: 'Business Daily',
        url: 'https://businessdailyafrica.com',
        category: 'business',
        credibilityScore: 88,
        language: 'en',
      },
    ];
  }

  /**
   * Fetch news from multiple sources
   */
  async fetchNews(location: string, category?: string): Promise<RawNewsItem[]> {
    const newsItems: RawNewsItem[] = [];

    for (const source of this.sources) {
      if (category && source.category !== category) continue;

      try {
        const items = await this.scrapeSource(source, location);
        newsItems.push(...items);
      } catch (error) {
        console.error(`Failed to fetch from ${source.name}:`, error);
      }
    }

    return newsItems;
  }

  /**
   * Scrape a news source for articles
   */
  private async scrapeSource(source: NewsSource, location: string): Promise<RawNewsItem[]> {
    try {
      const response = await axios.get(source.url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'MtaaNews/1.0',
        },
      });

      const $ = cheerio.load(response.data);
      const articles: RawNewsItem[] = [];

      // This is a simplified scraper - in production, you'd have specific selectors per source
      $('article').each((_, element) => {
        const title = $(element).find('h2, h3').first().text().trim();
        const content = $(element).find('p').first().text().trim();
        const url = $(element).find('a').first().attr('href') || '';
        const imageUrl = $(element).find('img').first().attr('src');

        if (title && content && url) {
          articles.push({
            title,
            content,
            url: url.startsWith('http') ? url : `${source.url}${url}`,
            publishedAt: new Date(),
            source,
            imageUrl,
          });
        }
      });

      return articles.slice(0, 10); // Limit to 10 per source
    } catch (error) {
      console.error(`Scraping failed for ${source.name}:`, error);
      return [];
    }
  }

  /**
   * Generate hyperlocal news article from raw news items using AI
   */
  async generateLocalArticle(
    rawNews: RawNewsItem[],
    location: string,
    targetNeighborhood?: string
  ): Promise<LocalNewsArticle | null> {
    if (rawNews.length === 0) return null;

    const prompt = this.buildAggregationPrompt(rawNews, location, targetNeighborhood);

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      const article = this.parseArticleResponse(content.text);
      article.sourceUrls = rawNews.map((item) => item.url);

      return article;
    } catch (error) {
      console.error('AI article generation failed:', error);
      return null;
    }
  }

  private buildAggregationPrompt(
    rawNews: RawNewsItem[],
    location: string,
    targetNeighborhood?: string
  ): string {
    const newsContext = rawNews
      .map(
        (item, i) =>
          `Source ${i + 1} (${item.source.name}, credibility: ${item.source.credibilityScore}/100):
Title: ${item.title}
Content: ${item.content.substring(0, 500)}...
URL: ${item.url}`
      )
      .join('\n\n');

    return `You are a hyperlocal news editor for Mtaa News, a platform serving ${location} neighborhoods.

Your task is to create ONE focused local news article by analyzing the following ${rawNews.length} news sources:

${newsContext}

REQUIREMENTS:
1. Identify if this news is relevant to ${targetNeighborhood || location}
2. If relevant, create a well-written article (300-500 words)
3. Focus on LOCAL impact and community perspective
4. Use clear, accessible language (English or Swahili as appropriate)
5. Verify facts across sources - if sources conflict, note it
6. Include practical information (times, locations, contacts)

RESPONSE FORMAT (JSON):
{
  "title": "Compelling headline focused on local impact",
  "summary": "One sentence summary (max 150 chars)",
  "content": "Full article text with markdown formatting",
  "category": "breaking|crime|politics|business|events|community|sports|entertainment|health|education|environment",
  "tags": ["tag1", "tag2", "tag3"],
  "location": "Specific neighborhood or area name",
  "confidence": 0-100,
  "relevance": "Brief explanation of local relevance"
}

If the news has NO local relevance, return:
{
  "confidence": 0,
  "relevance": "Not relevant to ${targetNeighborhood || location}"
}`;
  }

  private parseArticleResponse(response: string): LocalNewsArticle {
    // Remove markdown code blocks if present
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    try {
      const parsed = JSON.parse(cleaned);

      return {
        title: parsed.title || '',
        summary: parsed.summary || '',
        content: parsed.content || '',
        category: parsed.category || 'community',
        tags: parsed.tags || [],
        location: parsed.location || '',
        imageUrl: undefined,
        confidence: parsed.confidence || 0,
        sourceUrls: [],
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return {
        title: 'Parsing Error',
        summary: '',
        content: '',
        category: 'community',
        tags: [],
        location: '',
        confidence: 0,
        sourceUrls: [],
      };
    }
  }

  /**
   * Find trending topics in a location
   */
  async findTrendingTopics(location: string, hours: number = 24): Promise<string[]> {
    const newsItems = await this.fetchNews(location);

    const prompt = `Analyze these ${newsItems.length} recent news headlines from ${location}:

${newsItems.map((item, i) => `${i + 1}. ${item.title}`).join('\n')}

Identify the TOP 5 trending topics or themes. Return ONLY a JSON array of strings:
["topic1", "topic2", "topic3", "topic4", "topic5"]`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = message.content[0];
      if (content.type !== 'text') return [];

      const cleaned = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Trending topics analysis failed:', error);
      return [];
    }
  }

  /**
   * Summarize multiple articles into a daily digest
   */
  async createDailyDigest(
    articles: LocalNewsArticle[],
    location: string,
    language: 'en' | 'sw' = 'en'
  ): Promise<string> {
    const articlesContext = articles
      .map(
        (article, i) =>
          `${i + 1}. ${article.title}
${article.summary}`
      )
      .join('\n\n');

    const languageInstruction =
      language === 'sw' ? 'Write the digest in Swahili.' : 'Write the digest in English.';

    const prompt = `Create a brief daily news digest for ${location} residents.

Here are today's top stories:

${articlesContext}

Write a friendly, conversational digest (200-300 words) that:
1. Highlights the most important news
2. Groups related stories
3. Includes a greeting and closing
4. Uses emojis appropriately
5. ${languageInstruction}

Format for WhatsApp delivery.`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = message.content[0];
      return content.type === 'text' ? content.text : '';
    } catch (error) {
      console.error('Digest creation failed:', error);
      return '';
    }
  }
}
