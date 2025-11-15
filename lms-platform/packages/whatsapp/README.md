# @lms/whatsapp

WhatsApp Business API integration for SkillHub Africa LMS platform.

## Features

- 📱 Interactive lesson delivery via WhatsApp
- 📝 Quiz handling with instant feedback
- 🎯 Menu-driven navigation
- 🔔 Daily reminders and notifications
- 🏆 Achievement notifications
- 📊 Progress updates

## Installation

```bash
pnpm install
```

## Environment Variables

Add to your `.env` file:

```bash
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_verify_token
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
```

## Usage

### Initialize the service

```typescript
import { WhatsAppService, LessonDeliveryService } from '@lms/whatsapp';

const whatsappService = new WhatsAppService({
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
  webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN!,
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID!,
});

const lessonDelivery = new LessonDeliveryService(whatsappService);
```

### Send a lesson

```typescript
const lesson = {
  id: '123',
  title: 'Introduction to Python',
  contentType: 'text',
  contentData: {
    markdown: '# Hello Python\n\nPython is amazing...',
    readingTime: 15,
  },
  estimatedMinutes: 15,
};

const lessonHandler = lessonDelivery.getLessonHandler();
await lessonHandler.deliverLesson('+254712345678', lesson);
```

### Handle quiz

```typescript
const quizHandler = lessonDelivery.getQuizHandler();

await quizHandler.startQuiz('+254712345678', 'user123', 'lesson456', [
  {
    question: 'What is Python?',
    options: ['A snake', 'A programming language', 'A database', 'An OS'],
    correctAnswer: 1,
    explanation: 'Python is a high-level programming language.',
  },
]);
```

### Send notifications

```typescript
await lessonDelivery.sendDailyReminder('+254712345678', 'John', 15);

await lessonDelivery.sendStreakReminder('+254712345678', 'John', 7);

await lessonDelivery.sendAchievementNotification(
  '+254712345678',
  'Week Warrior',
  'Completed 7 days in a row!',
  '🔥'
);
```

## Webhook Integration

Set up a webhook endpoint in your API to receive WhatsApp messages:

```typescript
app.post('/api/whatsapp/webhook', (req, res) => {
  const { entry } = req.body;

  entry.forEach((event) => {
    const changes = event.changes[0];
    const message = changes.value.messages?.[0];

    if (message) {
      // Handle incoming message
      handleIncomingMessage(message);
    }
  });

  res.sendStatus(200);
});

app.get('/api/whatsapp/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const result = whatsappService.verifyWebhook(mode, token, challenge);

  if (result) {
    res.send(result);
  } else {
    res.sendStatus(403);
  }
});
```

## Message Types

- **Text Lessons**: Formatted markdown delivered in chunks
- **Video Lessons**: Links with duration info
- **Interactive Exercises**: Redirect to web app
- **Quizzes**: Step-by-step question delivery
- **Button Messages**: Quick reply options
- **List Messages**: Menu navigation

## Best Practices

1. Always mark messages as read after processing
2. Add delays between messages to avoid spam detection
3. Keep message text under 4096 characters
4. Use buttons for better UX
5. Provide clear navigation options

## WhatsApp Business API Setup

1. Create a Meta Developer account
2. Set up WhatsApp Business API
3. Get your access token and phone number ID
4. Configure webhooks
5. Test with WhatsApp Business Test Numbers
