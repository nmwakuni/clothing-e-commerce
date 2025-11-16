import puppeteer, { Browser, Page } from 'puppeteer';
import * as cheerio from 'cheerio';

export interface LinkedInProfile {
  name: string;
  headline: string;
  location?: string;
  about?: string;
  profilePictureUrl?: string;
  currentPosition?: {
    title: string;
    company: string;
    duration?: string;
  };
  experience: Array<{
    title: string;
    company: string;
    duration?: string;
    description?: string;
    location?: string;
  }>;
  education: Array<{
    school: string;
    degree?: string;
    field?: string;
    duration?: string;
  }>;
  skills: string[];
  recentActivity?: Array<{
    type: string; // post, comment, share
    content: string;
    date?: string;
  }>;
}

export class LinkedInScraper {
  private browser: Browser | null = null;
  private sessionCookies?: string;

  constructor(sessionCookies?: string) {
    this.sessionCookies = sessionCookies;
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async scrapeProfile(linkedinUrl: string): Promise<LinkedInProfile> {
    if (!this.browser) {
      await this.initialize();
    }

    const page = await this.browser!.newPage();

    try {
      // Set session cookies if available
      if (this.sessionCookies) {
        const cookies = JSON.parse(this.sessionCookies);
        await page.setCookie(...cookies);
      }

      // Navigate to profile
      await page.goto(linkedinUrl, { waitUntil: 'networkidle2', timeout: 30000 });

      // Wait for content to load
      await page.waitForSelector('h1', { timeout: 10000 });

      // Get page HTML
      const html = await page.content();
      const $ = cheerio.load(html);

      // Extract basic information
      const name = $('h1').first().text().trim();
      const headline = $('.text-body-medium').first().text().trim();
      const location = $('[class*="text-body-small inline t-black--light"]')
        .first()
        .text()
        .trim();

      // Extract about section
      const about = $('#about')
        .parent()
        .find('[class*="inline-show-more-text"]')
        .first()
        .text()
        .trim();

      // Extract current position
      const currentPositionTitle = $('[class*="experience-item"]')
        .first()
        .find('h3')
        .text()
        .trim();
      const currentPositionCompany = $('[class*="experience-item"]')
        .first()
        .find('[class*="t-14 t-normal"]')
        .first()
        .text()
        .trim();

      // Extract experience (simplified - would need more robust selectors in production)
      const experience: LinkedInProfile['experience'] = [];
      $('[class*="experience-item"]').each((_, el) => {
        const title = $(el).find('h3').text().trim();
        const company = $(el).find('[class*="t-14 t-normal"]').first().text().trim();
        const duration = $(el).find('[class*="date-range"]').text().trim();

        if (title && company) {
          experience.push({ title, company, duration });
        }
      });

      // Extract education (simplified)
      const education: LinkedInProfile['education'] = [];
      $('[class*="education-item"]').each((_, el) => {
        const school = $(el).find('h3').text().trim();
        const degree = $(el).find('[class*="t-14 t-normal"]').first().text().trim();

        if (school) {
          education.push({ school, degree });
        }
      });

      // Extract skills (simplified)
      const skills: string[] = [];
      $('[class*="skill-item"]').each((_, el) => {
        const skill = $(el).text().trim();
        if (skill) skills.push(skill);
      });

      return {
        name,
        headline,
        location,
        about,
        currentPosition: currentPositionTitle
          ? {
              title: currentPositionTitle,
              company: currentPositionCompany,
            }
          : undefined,
        experience,
        education,
        skills,
      };
    } finally {
      await page.close();
    }
  }

  /**
   * Scrape recent activity/posts (requires authentication)
   */
  async scrapeRecentActivity(linkedinUrl: string): Promise<LinkedInProfile['recentActivity']> {
    if (!this.browser) {
      await this.initialize();
    }

    const page = await this.browser!.newPage();

    try {
      if (this.sessionCookies) {
        const cookies = JSON.parse(this.sessionCookies);
        await page.setCookie(...cookies);
      }

      // Navigate to activity page
      const activityUrl = `${linkedinUrl}/recent-activity/all/`;
      await page.goto(activityUrl, { waitUntil: 'networkidle2', timeout: 30000 });

      // Wait for posts to load
      await page.waitForSelector('[class*="feed-shared-update"]', { timeout: 5000 });

      const html = await page.content();
      const $ = cheerio.load(html);

      const recentActivity: NonNullable<LinkedInProfile['recentActivity']> = [];

      // Extract recent posts (simplified)
      $('[class*="feed-shared-update"]')
        .slice(0, 5)
        .each((_, el) => {
          const content = $(el).find('[class*="break-words"]').first().text().trim();
          const date = $(el).find('time').attr('datetime');

          if (content) {
            recentActivity.push({
              type: 'post',
              content,
              date,
            });
          }
        });

      return recentActivity;
    } catch (error) {
      console.warn('Failed to scrape recent activity:', error);
      return [];
    } finally {
      await page.close();
    }
  }

  /**
   * Extract LinkedIn profile data from public HTML (no authentication needed)
   * This works for public profiles only
   */
  async scrapePublicProfile(linkedinUrl: string): Promise<Partial<LinkedInProfile>> {
    if (!this.browser) {
      await this.initialize();
    }

    const page = await this.browser!.newPage();

    try {
      // Add public/guest headers
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      );

      await page.goto(linkedinUrl, { waitUntil: 'networkidle2', timeout: 30000 });

      // Extract from meta tags (available on public profiles)
      const metaData = await page.evaluate(() => {
        const getMetaContent = (property: string) => {
          const meta = document.querySelector(`meta[property="${property}"]`);
          return meta?.getAttribute('content') || '';
        };

        return {
          name: getMetaContent('og:title'),
          headline: getMetaContent('og:description'),
          image: getMetaContent('og:image'),
        };
      });

      return {
        name: metaData.name,
        headline: metaData.headline,
        profilePictureUrl: metaData.image,
        experience: [],
        education: [],
        skills: [],
      };
    } finally {
      await page.close();
    }
  }
}
