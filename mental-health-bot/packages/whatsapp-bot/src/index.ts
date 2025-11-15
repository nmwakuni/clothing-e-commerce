import axios from 'axios';
import { AICounselorService } from '@nafsi/ai-counselor';
import { db, users, sessions, moods, crisisEvents } from '@nafsi/database';
import { eq } from 'drizzle-orm';

export interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  counselorApiKey: string;
}

export class WhatsAppTherapyBot {
  private accessToken: string;
  private phoneNumberId: string;
  private counselor: AICounselorService;
  private baseUrl = 'https://graph.facebook.com/v18.0';

  constructor(config: WhatsAppConfig) {
    this.accessToken = config.accessToken;
    this.phoneNumberId = config.phoneNumberId;

    this.counselor = new AICounselorService({
      anthropicApiKey: config.counselorApiKey,
      crisisHotlines: [
        { country: 'Kenya', number: '+254722178177', name: 'Kenya Red Cross' },
        { country: 'Kenya', number: '1199', name: 'Safaricom Crisis Line' },
      ],
    });
  }

  /**
   * Handle incoming WhatsApp message
   */
  async handleMessage(from: string, message: string, messageId: string): Promise<void> {
    // Get or create user
    const user = await this.getOrCreateUser(from);

    // Check for commands
    if (this.isCommand(message)) {
      await this.handleCommand(from, message.toLowerCase(), user);
      return;
    }

    // Regular therapy conversation
    await this.handleTherapyMessage(from, message, user);
  }

  /**
   * Handle therapy conversation
   */
  private async handleTherapyMessage(from: string, message: string, user: any): Promise<void> {
    try {
      // Get recent session history
      const recentSessions = await db
        .select()
        .from(sessions)
        .where(eq(sessions.userId, user.id))
        .orderBy(sessions.createdAt)
        .limit(1);

      const sessionHistory: Array<{ role: 'user' | 'assistant'; content: string }> =
        recentSessions[0]?.messages || [];

      // Get AI counseling response
      const response = await this.counselor.counsel(
        message,
        sessionHistory,
        {
          userId: user.id,
          name: user.name,
          age: user.age,
          primaryConcerns: user.primaryConcerns,
          previousSessions: user.totalSessions,
          riskLevel: user.riskLevel,
          language: user.language,
        }
      );

      // If crisis detected, log it and send immediate help
      if (response.crisisDetection.isCrisis && response.crisisDetection.severity !== 'none') {
        await this.handleCrisisDetection(user.id, response.crisisDetection, message, from);
      }

      // Save session
      await this.saveSession(user.id, message, response.message, response);

      // Send response
      await this.sendMessage(from, response.message);

      // Update user stats
      await db
        .update(users)
        .set({
          totalSessions: user.totalSessions + 1,
          lastSessionAt: new Date(),
        })
        .where(eq(users.id, user.id));
    } catch (error) {
      console.error('Therapy message handling failed:', error);
      await this.sendMessage(
        from,
        "I'm having trouble connecting right now. If you're in crisis, please call 999 or +254722178177 (Kenya Red Cross) immediately. 🆘"
      );
    }
  }

  /**
   * Handle crisis detection
   */
  private async handleCrisisDetection(
    userId: string,
    crisis: any,
    triggerMessage: string,
    phoneNumber: string
  ): Promise<void> {
    // Log crisis event
    await db.insert(crisisEvents).values({
      userId,
      crisisType: crisis.crisisType,
      severity: crisis.severity,
      detectedBy: 'ai',
      triggerMessage,
      interventionType: ['ai_support', 'hotline_provided'],
      interventionNotes: `AI detected ${crisis.crisisType} at ${crisis.severity} severity. Confidence: ${crisis.confidence}%`,
    });

    // Update user risk level
    await db
      .update(users)
      .set({
        riskLevel: crisis.severity,
        lastRiskAssessment: new Date(),
      })
      .where(eq(users.id, userId));

    // Send crisis resources immediately
    await this.sendCrisisResources(phoneNumber);

    // Schedule follow-up check-in
    // (In production, this would trigger a scheduled job)
  }

  /**
   * Send crisis resources
   */
  private async sendCrisisResources(phoneNumber: string): Promise<void> {
    const resources = `🆘 **IMMEDIATE CRISIS RESOURCES**

📞 **Kenya Crisis Hotlines:**
• Kenya Red Cross: +254722178177
• Safaricom: 1199
• Befrienders Kenya: +254722178177

🚨 **Emergency:**
• Police: 999
• Ambulance: 999

💬 **Text Support:**
• Reply HELP for immediate guidance
• Reply SAFE when you're in a safe place

🙏 You are not alone. Help is available 24/7.`;

    await this.sendMessage(phoneNumber, resources);
  }

  /**
   * Handle commands
   */
  private async handleCommand(from: string, command: string, user: any): Promise<void> {
    if (command === 'menu' || command === 'start' || command === 'help') {
      await this.sendMainMenu(from, user.name);
    } else if (command === 'mood' || command === '1') {
      await this.sendMoodCheck(from);
    } else if (command === 'talk' || command === '2') {
      await this.sendMessage(from, "I'm here to listen. Tell me what's on your mind... 💙");
    } else if (command === 'resources' || command === '3') {
      await this.sendResources(from);
    } else if (command === 'crisis' || command === 'help' || command === 'emergency') {
      await this.sendCrisisResources(from);
    }
  }

  /**
   * Send main menu
   */
  private async sendMainMenu(phoneNumber: string, userName?: string): Promise<void> {
    const greeting = userName ? `Hi ${userName}` : 'Hello';

    const menu = `💙 **${greeting}! Welcome to Nafsi**

"Nafsi" means "soul" in Swahili.
I'm here to support your mental wellness.

**What would you like to do?**

1️⃣ Log my mood
2️⃣ Talk to AI counselor
3️⃣ View resources
🆘 Crisis help (type "crisis")

Just type the number or keyword!

_Remember: I'm an AI assistant, not a replacement for professional help. If you're in crisis, please contact emergency services._`;

    await this.sendMessage(phoneNumber, menu);
  }

  /**
   * Send mood check-in
   */
  private async sendMoodCheck(phoneNumber: string): Promise<void> {
    const message = `😊 **Mood Check-In**

How are you feeling right now?

Rate your mood from 1-10:
1 = Terrible
5 = Okay
10 = Amazing

Just send a number 1-10.`;

    await this.sendMessage(phoneNumber, message);
  }

  /**
   * Send resources
   */
  private async sendResources(phoneNumber: string): Promise<void> {
    const resources = `📚 **Mental Health Resources**

**Self-Help:**
• Breathing exercises
• Meditation guides
• CBT worksheets

**Professional Help:**
• Find a therapist
• Book video session
• Join support group

**Crisis Support:**
• 24/7 hotlines
• Safety planning
• Emergency contacts

Visit: https://nafsi.co.ke/resources

What would you like to explore?`;

    await this.sendMessage(phoneNumber, resources);
  }

  /**
   * Save therapy session
   */
  private async saveSession(
    userId: string,
    userMessage: string,
    aiResponse: string,
    metadata: any
  ): Promise<void> {
    const existingSession = await db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, userId))
      .orderBy(sessions.createdAt)
      .limit(1);

    if (existingSession.length > 0 && !existingSession[0].endedAt) {
      // Update existing session
      const currentMessages = existingSession[0].messages as any[] || [];
      await db
        .update(sessions)
        .set({
          messages: [
            ...currentMessages,
            { role: 'user', content: userMessage, timestamp: new Date() },
            { role: 'assistant', content: aiResponse, timestamp: new Date() },
          ],
          sentiment: metadata.sentiment,
          topics: metadata.topics,
          crisisDetected: metadata.crisisDetection.isCrisis,
          crisisLevel: metadata.crisisDetection.severity,
        })
        .where(eq(sessions.id, existingSession[0].id));
    } else {
      // Create new session
      await db.insert(sessions).values({
        userId,
        sessionType: 'ai',
        messages: [
          { role: 'user', content: userMessage, timestamp: new Date() },
          { role: 'assistant', content: aiResponse, timestamp: new Date() },
        ],
        sentiment: metadata.sentiment,
        topics: metadata.topics,
        crisisDetected: metadata.crisisDetection.isCrisis,
        crisisLevel: metadata.crisisDetection.severity,
      });
    }
  }

  /**
   * Get or create user
   */
  private async getOrCreateUser(phoneNumber: string): Promise<any> {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.phoneNumber, phoneNumber))
      .limit(1);

    if (existingUser) {
      return existingUser;
    }

    // Create anonymous user
    const [newUser] = await db
      .insert(users)
      .values({
        phoneNumber,
        isAnonymous: true,
        displayName: `User${Math.floor(Math.random() * 10000)}`,
        language: 'en',
      })
      .returning();

    // Send welcome message
    await this.sendMainMenu(phoneNumber);

    return newUser;
  }

  /**
   * Check if message is a command
   */
  private isCommand(message: string): boolean {
    const commands = ['menu', 'start', 'help', 'mood', 'talk', 'resources', 'crisis', 'emergency', '1', '2', '3'];
    return commands.includes(message.toLowerCase().trim());
  }

  /**
   * Send WhatsApp message
   */
  private async sendMessage(to: string, text: string): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to.replace('+', ''),
          type: 'text',
          text: { body: text },
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      throw error;
    }
  }

  /**
   * Send daily mood reminder
   */
  async sendDailyReminders(): Promise<void> {
    // Get all active users
    const activeUsers = await db.select().from(users).limit(1000);

    for (const user of activeUsers) {
      if (!user.phoneNumber) continue;

      const prompt = await this.counselor.getDailyPrompt({
        userId: user.id,
        name: user.name || undefined,
        primaryConcerns: user.primaryConcerns || undefined,
      });

      await this.sendMessage(user.phoneNumber, `🌅 Good morning!\n\n${prompt}`);
    }
  }
}
