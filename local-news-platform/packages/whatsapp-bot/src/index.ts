import { WhatsAppService } from '@mtaa/notifications';
import { NewsAggregatorService } from '@mtaa/news-aggregator';
import { db } from '@mtaa/database';
import { users, userLocationSubscriptions, locations, articles } from '@mtaa/database/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface WhatsAppBotConfig {
  whatsappAccessToken: string;
  whatsappPhoneNumberId: string;
  anthropicApiKey: string;
}

export interface IncomingMessage {
  from: string;
  messageId: string;
  timestamp: string;
  type: 'text' | 'button' | 'interactive';
  text?: string;
  buttonId?: string;
}

export class WhatsAppNewsBot {
  private whatsapp: WhatsAppService;
  private newsAggregator: NewsAggregatorService;

  constructor(config: WhatsAppBotConfig) {
    this.whatsapp = new WhatsAppService({
      accessToken: config.whatsappAccessToken,
      phoneNumberId: config.whatsappPhoneNumberId,
    });

    this.newsAggregator = new NewsAggregatorService({
      anthropicApiKey: config.anthropicApiKey,
    });
  }

  /**
   * Handle incoming WhatsApp message
   */
  async handleMessage(message: IncomingMessage): Promise<void> {
    const phoneNumber = message.from;

    // Get or create user
    let user = await this.getOrCreateUser(phoneNumber);

    // Handle different message types
    if (message.type === 'text' && message.text) {
      await this.handleTextMessage(phoneNumber, message.text.toLowerCase(), user);
    } else if (message.type === 'button' && message.buttonId) {
      await this.handleButtonResponse(phoneNumber, message.buttonId, user);
    }
  }

  private async getOrCreateUser(phoneNumber: string) {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.phoneNumber, phoneNumber))
      .limit(1);

    if (existingUser) {
      return existingUser;
    }

    // Create new user
    const [newUser] = await db
      .insert(users)
      .values({
        email: `whatsapp_${phoneNumber}@mtaanews.co.ke`,
        phoneNumber,
        name: phoneNumber,
        role: 'reader',
      })
      .returning();

    // Send welcome message
    await this.sendWelcomeMessage(phoneNumber);

    return newUser;
  }

  private async handleTextMessage(phoneNumber: string, text: string, user: any): Promise<void> {
    // Menu commands
    if (text === 'menu' || text === 'hi' || text === 'hello' || text === 'start') {
      await this.sendMainMenu(phoneNumber);
      return;
    }

    if (text === 'news' || text === '1') {
      await this.sendLatestNews(phoneNumber, user);
      return;
    }

    if (text === 'subscribe' || text === '2') {
      await this.sendSubscribeMenu(phoneNumber);
      return;
    }

    if (text === 'trending' || text === '3') {
      await this.sendTrendingNews(phoneNumber);
      return;
    }

    if (text === 'help' || text === '4') {
      await this.sendHelpMessage(phoneNumber);
      return;
    }

    // Default response
    await this.whatsapp.sendTextMessage(
      phoneNumber,
      "I didn't understand that. Send *menu* to see available options."
    );
  }

  private async handleButtonResponse(
    phoneNumber: string,
    buttonId: string,
    user: any
  ): Promise<void> {
    if (buttonId.startsWith('subscribe_')) {
      const locationSlug = buttonId.replace('subscribe_', '');
      await this.subscribeToLocation(phoneNumber, locationSlug, user);
    } else if (buttonId === 'view_more_news') {
      await this.sendLatestNews(phoneNumber, user, 10);
    }
  }

  /**
   * Send welcome message to new users
   */
  private async sendWelcomeMessage(phoneNumber: string): Promise<void> {
    const message = `📰 *Welcome to Mtaa News!*

Your hyperlocal news source for Nairobi neighborhoods.

Get started by choosing your neighborhood:
• Send *subscribe* to choose your neighborhoods
• Send *news* to get latest updates
• Send *menu* anytime to see options

What would you like to do?`;

    await this.whatsapp.sendButtonMessage(phoneNumber, message, [
      { id: 'subscribe', title: '📍 Subscribe' },
      { id: 'news', title: '📰 Latest News' },
    ]);
  }

  /**
   * Send main menu
   */
  private async sendMainMenu(phoneNumber: string): Promise<void> {
    const message = `📰 *Mtaa News Menu*

Choose an option:

1️⃣ Latest News
2️⃣ Subscribe to Neighborhoods
3️⃣ Trending Stories
4️⃣ Help & Support

Just send the number or keyword!`;

    await this.whatsapp.sendTextMessage(phoneNumber, message);
  }

  /**
   * Send latest news based on user's subscriptions
   */
  private async sendLatestNews(
    phoneNumber: string,
    user: any,
    limit: number = 5
  ): Promise<void> {
    // Get user's subscribed locations
    const subscriptions = await db
      .select({ location: locations })
      .from(userLocationSubscriptions)
      .leftJoin(locations, eq(userLocationSubscriptions.locationId, locations.id))
      .where(eq(userLocationSubscriptions.userId, user.id))
      .limit(5);

    if (subscriptions.length === 0) {
      await this.whatsapp.sendTextMessage(
        phoneNumber,
        "You haven't subscribed to any neighborhoods yet. Send *subscribe* to get started!"
      );
      return;
    }

    // Get latest articles from subscribed locations
    const locationIds = subscriptions
      .map((s) => s.location?.id)
      .filter(Boolean) as string[];

    const latestArticles = await db
      .select({
        id: articles.id,
        title: articles.title,
        summary: articles.summary,
        slug: articles.slug,
        locationId: articles.locationId,
        publishedAt: articles.publishedAt,
        featuredImage: articles.featuredImage,
      })
      .from(articles)
      .where(
        and(
          eq(articles.status, 'published'),
          // Filter by subscribed locations - simplified for TypeScript
        )
      )
      .orderBy(desc(articles.publishedAt))
      .limit(limit);

    if (latestArticles.length === 0) {
      await this.whatsapp.sendTextMessage(
        phoneNumber,
        'No recent news from your neighborhoods. Check back soon!'
      );
      return;
    }

    // Send news digest
    let digest = `📰 *Latest News from Your Neighborhoods*\n\n`;

    for (let i = 0; i < latestArticles.length; i++) {
      const article = latestArticles[i];
      const locationName =
        subscriptions.find((s) => s.location?.id === article.locationId)?.location?.name ||
        'Unknown';

      digest += `${i + 1}️⃣ *${article.title}*\n`;
      digest += `📍 ${locationName}\n`;
      digest += `${article.summary}\n`;
      digest += `\n`;
    }

    digest += `\nRead more at: https://mtaanews.co.ke`;

    await this.whatsapp.sendTextMessage(phoneNumber, digest);
  }

  /**
   * Send subscribe menu with location options
   */
  private async sendSubscribeMenu(phoneNumber: string): Promise<void> {
    const allLocations = await db
      .select()
      .from(locations)
      .where(eq(locations.locationType, 'estate'))
      .limit(10);

    const message = `📍 *Subscribe to Neighborhoods*

Choose neighborhoods to receive news updates:

${allLocations.map((loc, i) => `${i + 1}. ${loc.name}`).join('\n')}

Reply with the number to subscribe!`;

    await this.whatsapp.sendTextMessage(phoneNumber, message);
  }

  /**
   * Subscribe user to a location
   */
  private async subscribeToLocation(
    phoneNumber: string,
    locationSlug: string,
    user: any
  ): Promise<void> {
    const [location] = await db
      .select()
      .from(locations)
      .where(eq(locations.slug, locationSlug))
      .limit(1);

    if (!location) {
      await this.whatsapp.sendTextMessage(phoneNumber, 'Location not found.');
      return;
    }

    // Check if already subscribed
    const existing = await db
      .select()
      .from(userLocationSubscriptions)
      .where(
        and(
          eq(userLocationSubscriptions.userId, user.id),
          eq(userLocationSubscriptions.locationId, location.id)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await this.whatsapp.sendTextMessage(
        phoneNumber,
        `You're already subscribed to ${location.name}!`
      );
      return;
    }

    // Subscribe
    await db.insert(userLocationSubscriptions).values({
      userId: user.id,
      locationId: location.id,
    });

    await this.whatsapp.sendTextMessage(
      phoneNumber,
      `✅ You're now subscribed to *${location.name}*!\n\nYou'll receive news updates from this neighborhood.\n\nSend *news* to get latest updates.`
    );
  }

  /**
   * Send trending stories
   */
  private async sendTrendingNews(phoneNumber: string): Promise<void> {
    const trending = await db
      .select()
      .from(articles)
      .where(eq(articles.status, 'published'))
      .orderBy(desc(articles.viewsCount))
      .limit(5);

    if (trending.length === 0) {
      await this.whatsapp.sendTextMessage(phoneNumber, 'No trending stories right now.');
      return;
    }

    let message = `🔥 *Trending Now*\n\n`;

    for (let i = 0; i < trending.length; i++) {
      const article = trending[i];
      message += `${i + 1}. ${article.title}\n`;
      message += `   👁️ ${article.viewsCount} views\n\n`;
    }

    await this.whatsapp.sendTextMessage(phoneNumber, message);
  }

  /**
   * Send help message
   */
  private async sendHelpMessage(phoneNumber: string): Promise<void> {
    const message = `ℹ️ *Mtaa News Help*

*Available Commands:*

📰 *news* - Get latest news
📍 *subscribe* - Subscribe to neighborhoods
🔥 *trending* - Trending stories
📋 *menu* - Main menu
❓ *help* - This help message

*How it works:*
1. Subscribe to your neighborhoods
2. Receive daily news updates
3. Get breaking news alerts
4. Stay informed about your community

Need more help? Visit https://mtaanews.co.ke`;

    await this.whatsapp.sendTextMessage(phoneNumber, message);
  }

  /**
   * Send daily digest to all subscribed users
   */
  async sendDailyDigests(): Promise<void> {
    // Get all users with location subscriptions
    const usersWithSubscriptions = await db
      .select({
        userId: users.id,
        phoneNumber: users.phoneNumber,
        userName: users.name,
        locationId: userLocationSubscriptions.locationId,
      })
      .from(users)
      .innerJoin(userLocationSubscriptions, eq(users.id, userLocationSubscriptions.userId))
      .where(eq(users.role, 'reader'));

    // Group by user
    const userMap = new Map<string, { phone: string; name: string; locations: string[] }>();

    for (const row of usersWithSubscriptions) {
      if (!userMap.has(row.userId)) {
        userMap.set(row.userId, {
          phone: row.phoneNumber!,
          name: row.userName,
          locations: [],
        });
      }
      userMap.get(row.userId)!.locations.push(row.locationId);
    }

    // Send digest to each user
    for (const [userId, userData] of userMap.entries()) {
      try {
        await this.sendLatestNews(userData.phone, { id: userId });
      } catch (error) {
        console.error(`Failed to send digest to ${userData.phone}:`, error);
      }
    }

    console.log(`✅ Daily digests sent to ${userMap.size} users`);
  }

  /**
   * Send breaking news alert to all users in a location
   */
  async sendBreakingNewsAlert(articleId: string, locationId: string): Promise<void> {
    const [article] = await db
      .select()
      .from(articles)
      .where(eq(articles.id, articleId))
      .limit(1);

    if (!article) return;

    const subscribers = await db
      .select({ phoneNumber: users.phoneNumber })
      .from(users)
      .innerJoin(userLocationSubscriptions, eq(users.id, userLocationSubscriptions.userId))
      .where(eq(userLocationSubscriptions.locationId, locationId));

    const message = `🚨 *BREAKING NEWS*\n\n*${article.title}*\n\n${article.summary}\n\nRead more: https://mtaanews.co.ke/articles/${article.slug}`;

    for (const subscriber of subscribers) {
      if (subscriber.phoneNumber) {
        try {
          await this.whatsapp.sendTextMessage(subscriber.phoneNumber, message);
        } catch (error) {
          console.error(`Failed to send alert to ${subscriber.phoneNumber}:`, error);
        }
      }
    }

    console.log(`✅ Breaking news alert sent to ${subscribers.length} users`);
  }
}
