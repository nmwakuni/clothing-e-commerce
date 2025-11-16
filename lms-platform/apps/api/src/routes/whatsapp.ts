import { Hono } from 'hono';
import { createWhatsAppService } from '@lms/whatsapp';
import { createAITutor } from '@lms/ai-tutor';
import { db } from '@lms/database';
import { users, conversations, messages, enrollments, courses } from '@lms/database/schema';
import { eq, and, desc } from 'drizzle-orm';
import {
  sendWelcomeMessage,
  sendCourseList,
  sendCourseDetail,
  sendDailyReminder,
} from '@lms/whatsapp/templates/learning-messages';

type Bindings = {
  WHATSAPP_ACCESS_TOKEN: string;
  WHATSAPP_PHONE_ID: string;
  WHATSAPP_VERIFY_TOKEN: string;
  ANTHROPIC_API_KEY: string;
  OPENAI_API_KEY: string;
  JWT_SECRET: string;
};

export const whatsappRouter = new Hono<{ Bindings: Bindings }>();

// GET /api/whatsapp/webhook - Webhook verification (Meta requirement)
whatsappRouter.get('/webhook', (c) => {
  const mode = c.req.query('hub.mode');
  const token = c.req.query('hub.verify_token');
  const challenge = c.req.query('hub.challenge');

  const verifyToken = c.env.WHATSAPP_VERIFY_TOKEN || 'skillhub_verify_token';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ Webhook verified successfully');
    return c.text(challenge || '');
  }

  console.log('❌ Webhook verification failed');
  return c.json({ error: 'Verification failed' }, 403);
});

// POST /api/whatsapp/webhook - Receive WhatsApp messages
whatsappRouter.post('/webhook', async (c) => {
  try {
    const body = await c.req.json();

    console.log('📱 WhatsApp webhook received:', JSON.stringify(body, null, 2));

    // Check if it's a message event
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (value?.messages) {
        const message = value.messages[0];
        const from = message.from; // Phone number
        const messageId = message.id;
        const messageType = message.type; // text, image, video, interactive, etc.

        console.log(`📨 Message from ${from}:`, {
          id: messageId,
          type: messageType,
          timestamp: message.timestamp,
        });

        // Initialize services
        const whatsapp = createWhatsAppService({
          accessToken: c.env.WHATSAPP_ACCESS_TOKEN,
          phoneNumberId: c.env.WHATSAPP_PHONE_ID,
        });

        const aiTutor = createAITutor({
          provider: 'anthropic',
          apiKey: c.env.ANTHROPIC_API_KEY,
        });

        // Get or create user
        const phoneNumber = `+${from}`;
        let user = await db.query.users.findFirst({
          where: eq(users.phoneNumber, phoneNumber),
        });

        if (!user) {
          // New user - create account
          const [newUser] = await db
            .insert(users)
            .values({
              phoneNumber,
              role: 'student',
              subscriptionTier: 'free',
            })
            .returning();

          user = newUser;

          // Send welcome message
          await sendWelcomeMessage(whatsapp, phoneNumber);

          // Log new user creation
          console.log(`✨ Created new user: ${user.id} (${phoneNumber})`);
        }

        // Get or create conversation
        let conversation = await db.query.conversations.findFirst({
          where: and(
            eq(conversations.userId, user.id),
            eq(conversations.channel, 'whatsapp')
          ),
          orderBy: desc(conversations.lastMessageAt),
        });

        if (!conversation) {
          const [newConversation] = await db
            .insert(conversations)
            .values({
              userId: user.id,
              channel: 'whatsapp',
            })
            .returning();

          conversation = newConversation;
        }

        // Handle different message types
        if (messageType === 'text') {
          const text = message.text.body.trim();
          console.log(`💬 Text message: "${text}"`);

          // Save user message
          await db.insert(messages).values({
            conversationId: conversation.id,
            direction: 'incoming',
            content: text,
            messageType: 'text',
            externalId: messageId,
          });

          // Update conversation
          await db
            .update(conversations)
            .set({
              lastMessageAt: new Date(),
              messageCount: conversation.messageCount + 1,
            })
            .where(eq(conversations.id, conversation.id));

          // Process message and generate AI response
          await processTextMessage(
            text,
            phoneNumber,
            user.id,
            conversation.id,
            whatsapp,
            aiTutor,
            c
          );
        }

        // Handle button clicks
        if (messageType === 'interactive') {
          const interactive = message.interactive;

          if (interactive.type === 'button_reply') {
            const buttonId = interactive.button_reply.id;
            console.log(`🔘 Button clicked: ${buttonId}`);

            await handleButtonClick(buttonId, phoneNumber, user.id, whatsapp, c);
          }

          if (interactive.type === 'list_reply') {
            const listId = interactive.list_reply.id;
            console.log(`📋 List item selected: ${listId}`);

            await handleListSelection(listId, phoneNumber, user.id, whatsapp, c);
          }
        }

        // Handle images (could be code screenshots, etc.)
        if (messageType === 'image') {
          console.log('🖼️ Image received:', message.image);

          await whatsapp.sendText(
            phoneNumber,
            `📸 Thanks for the image! I can help you understand code in images. What would you like to know about it?`
          );
        }
      }

      // Handle message status updates (sent, delivered, read)
      if (value?.statuses) {
        const status = value.statuses[0];
        console.log('✓ Message status update:', {
          id: status.id,
          status: status.status,
          timestamp: status.timestamp,
        });

        // Update message status in database
        await db
          .update(messages)
          .set({
            deliveryStatus: status.status,
          })
          .where(eq(messages.externalId, status.id));
      }
    }

    // Always return 200 to acknowledge receipt
    return c.json({ success: true });
  } catch (error) {
    console.error('❌ Error processing WhatsApp webhook:', error);
    // Still return 200 to prevent Meta from disabling webhook
    return c.json({ success: true });
  }
});

/**
 * Process text message with AI tutor
 */
async function processTextMessage(
  text: string,
  phoneNumber: string,
  userId: string,
  conversationId: string,
  whatsapp: ReturnType<typeof createWhatsAppService>,
  aiTutor: ReturnType<typeof createAITutor>,
  c: any
) {
  const lowerText = text.toLowerCase();

  // Handle common commands
  if (lowerText.includes('course') || lowerText.includes('browse') || lowerText === 'menu') {
    // Show course list
    const publishedCourses = await db.query.courses.findMany({
      where: eq(courses.status, 'published'),
      limit: 10,
    });

    await sendCourseList(whatsapp, phoneNumber, publishedCourses);
    return;
  }

  if (lowerText.includes('my courses') || lowerText.includes('enrolled')) {
    // Show user's enrolled courses
    const userEnrollments = await db.query.enrollments.findMany({
      where: eq(enrollments.userId, userId),
      with: {
        course: true,
      },
    });

    if (userEnrollments.length === 0) {
      await whatsapp.sendButtons(
        phoneNumber,
        `You haven't enrolled in any courses yet! 📚\n\nBrowse our courses to start learning.`,
        [
          { id: 'browse_courses', title: 'Browse Courses' },
          { id: 'help', title: 'Get Help' },
        ]
      );
    } else {
      const courseButtons = userEnrollments.slice(0, 3).map((enrollment, idx) => ({
        id: `continue_${enrollment.courseId}`,
        title: `Continue Learning`,
      }));

      await whatsapp.sendButtons(
        phoneNumber,
        `Your Courses (${userEnrollments.length}):\n\n${userEnrollments
          .map(
            (e, idx) =>
              `${idx + 1}. ${e.course.title}\n   Progress: ${e.progressPercentage}%`
          )
          .join('\n\n')}`,
        courseButtons.length > 0
          ? courseButtons
          : [{ id: 'browse_courses', title: 'Browse More' }]
      );
    }
    return;
  }

  if (lowerText.includes('help') || lowerText === '?' || lowerText === 'menu') {
    await whatsapp.sendButtons(
      phoneNumber,
      `🎓 *SkillHub Africa - How can I help?*\n\nI'm your AI learning assistant. Here's what I can do:\n\n• Browse and enroll in courses\n• Help you learn with personalized tutoring\n• Answer coding questions\n• Track your progress\n• Send daily learning reminders\n\nWhat would you like to do?`,
      [
        { id: 'browse_courses', title: '📚 Browse Courses' },
        { id: 'my_courses', title: '📖 My Courses' },
        { id: 'ask_question', title: '❓ Ask Question' },
      ]
    );
    return;
  }

  // Get conversation history for context
  const recentMessages = await db.query.messages.findMany({
    where: eq(messages.conversationId, conversationId),
    orderBy: desc(messages.createdAt),
    limit: 10,
  });

  const conversationHistory = recentMessages
    .reverse()
    .map((msg) => ({
      role: msg.direction === 'incoming' ? 'user' : 'assistant',
      content: msg.content,
    }));

  // Determine if user is currently learning (has active enrollment)
  const activeEnrollment = await db.query.enrollments.findFirst({
    where: and(eq(enrollments.userId, userId), eq(enrollments.status, 'active')),
    with: {
      course: true,
    },
    orderBy: desc(enrollments.lastAccessedAt),
  });

  // Build context for AI
  const context: any = {
    userId,
    conversationHistory,
  };

  if (activeEnrollment) {
    context.currentCourse = {
      title: activeEnrollment.course.title,
      progress: activeEnrollment.progressPercentage,
    };
  }

  // Generate AI response
  try {
    const aiResponse = await aiTutor.chat(text, context);

    // Save AI response to database
    await db.insert(messages).values({
      conversationId,
      direction: 'outgoing',
      content: aiResponse.message,
      messageType: 'text',
      aiProvider: 'anthropic',
      tokensUsed: aiResponse.tokensUsed,
      estimatedCost: aiResponse.estimatedCost,
    });

    // Send response via WhatsApp
    await whatsapp.sendText(phoneNumber, aiResponse.message);

    // Update conversation
    await db
      .update(conversations)
      .set({
        lastMessageAt: new Date(),
        messageCount: conversationId ? (await db.query.messages.findMany({ where: eq(messages.conversationId, conversationId) })).length : 0,
      })
      .where(eq(conversations.id, conversationId));

  } catch (error) {
    console.error('Error generating AI response:', error);

    // Fallback response
    await whatsapp.sendText(
      phoneNumber,
      `I'm having trouble processing your message right now. Please try again in a moment, or type "help" to see what I can do. 🙏`
    );
  }
}

/**
 * Handle button clicks
 */
async function handleButtonClick(
  buttonId: string,
  phoneNumber: string,
  userId: string,
  whatsapp: ReturnType<typeof createWhatsAppService>,
  c: any
) {
  if (buttonId === 'browse_courses') {
    const publishedCourses = await db.query.courses.findMany({
      where: eq(courses.status, 'published'),
      limit: 10,
    });

    await sendCourseList(whatsapp, phoneNumber, publishedCourses);
  }

  if (buttonId === 'my_courses') {
    const userEnrollments = await db.query.enrollments.findMany({
      where: eq(enrollments.userId, userId),
      with: {
        course: true,
      },
    });

    if (userEnrollments.length === 0) {
      await whatsapp.sendButtons(
        phoneNumber,
        `You haven't enrolled in any courses yet! 📚`,
        [{ id: 'browse_courses', title: 'Browse Courses' }]
      );
    } else {
      const courseList = userEnrollments
        .map((e, idx) => `${idx + 1}. ${e.course.title} (${e.progressPercentage}%)`)
        .join('\n');

      await whatsapp.sendText(phoneNumber, `📖 *Your Courses*\n\n${courseList}`);
    }
  }

  if (buttonId === 'continue_learning') {
    await whatsapp.sendText(
      phoneNumber,
      `Great! Let's continue where you left off. What topic would you like to focus on today?`
    );
  }

  if (buttonId === 'get_help' || buttonId === 'help') {
    await whatsapp.sendButtons(
      phoneNumber,
      `🎓 *SkillHub Africa*\n\nHow can I help you today?`,
      [
        { id: 'browse_courses', title: 'Browse Courses' },
        { id: 'my_courses', title: 'My Courses' },
        { id: 'ask_question', title: 'Ask Question' },
      ]
    );
  }

  if (buttonId.startsWith('continue_')) {
    const courseId = buttonId.replace('continue_', '');

    const enrollment = await db.query.enrollments.findFirst({
      where: and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)),
      with: {
        course: true,
      },
    });

    if (enrollment) {
      await whatsapp.sendText(
        phoneNumber,
        `📚 *${enrollment.course.title}*\n\nYou're ${enrollment.progressPercentage}% complete! What would you like to learn next?\n\nJust ask me any question about ${enrollment.course.title} and I'll help you! 🎓`
      );
    }
  }
}

/**
 * Handle list selections
 */
async function handleListSelection(
  listId: string,
  phoneNumber: string,
  userId: string,
  whatsapp: ReturnType<typeof createWhatsAppService>,
  c: any
) {
  if (listId.startsWith('course_')) {
    const courseId = listId.replace('course_', '');

    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
      with: {
        lessons: {
          limit: 5,
        },
      },
    });

    if (course) {
      await sendCourseDetail(whatsapp, phoneNumber, course);
    }
  }

  if (listId.startsWith('enroll_')) {
    const courseId = listId.replace('enroll_', '');

    // Check if already enrolled
    const existingEnrollment = await db.query.enrollments.findFirst({
      where: and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)),
    });

    if (existingEnrollment) {
      await whatsapp.sendText(
        phoneNumber,
        `You're already enrolled in this course! Type "continue learning" to resume. 📚`
      );
      return;
    }

    // Create enrollment
    await db.insert(enrollments).values({
      userId,
      courseId,
      status: 'active',
    });

    await whatsapp.sendText(
      phoneNumber,
      `🎉 Awesome! You're now enrolled!\n\nReady to start learning? Just ask me anything about the course and I'll help you! 🎓`
    );
  }
}

export { whatsappRouter };
