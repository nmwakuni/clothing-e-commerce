# @lms/whatsapp

WhatsApp Business API integration for the LMS Platform.

## Features

- 📱 **Send text messages** with rich formatting
- 🖼️ **Send media** (images, videos, documents)
- 🔘 **Interactive buttons** (up to 3 buttons)
- 📋 **Interactive lists** (for menus/catalogs)
- 📧 **Template messages** (pre-approved by Meta)
- ✅ **Mark messages as read**
- 📥 **Download media** from users
- 🔐 **Webhook verification** & parsing
- 📚 **Pre-built templates** for common learning scenarios

## Quick Start

```typescript
import { createWhatsAppService } from '@lms/whatsapp';

const whatsapp = createWhatsAppService({
  accessToken: process.env.WHATSAPP_TOKEN!,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
  apiVersion: 'v21.0', // optional, defaults to v21.0
});

// Send a simple text message
await whatsapp.sendText('+254712345678', 'Hello from SkillHub!');
```

## Sending Messages

### Text Message
```typescript
await whatsapp.sendText(
  '+254712345678',
  'Welcome to SkillHub Africa! 🎓',
  true // preview URLs
);
```

### Image Message
```typescript
await whatsapp.sendImage(
  '+254712345678',
  'https://example.com/image.jpg',
  'Check out this course!' // optional caption
);
```

### Interactive Buttons
```typescript
await whatsapp.sendButtons(
  '+254712345678',
  'What would you like to do?',
  [
    { id: 'browse_courses', title: 'Browse Courses' },
    { id: 'continue', title: 'Continue Learning' },
    { id: 'help', title: 'Get Help' },
  ],
  {
    header: 'Welcome!', // optional
    footer: 'Reply anytime', // optional
  }
);
```

### Interactive List
```typescript
await whatsapp.sendList(
  '+254712345678',
  'Choose a course to learn',
  'View Courses', // button text
  [
    {
      title: 'Programming',
      rows: [
        {
          id: 'web_dev',
          title: 'Web Development',
          description: 'HTML, CSS, JavaScript',
        },
        {
          id: 'python',
          title: 'Python Basics',
          description: 'Learn Python from scratch',
        },
      ],
    },
    {
      title: 'Business',
      rows: [
        {
          id: 'marketing',
          title: 'Digital Marketing',
          description: 'Social media, SEO, ads',
        },
      ],
    },
  ],
  {
    header: 'Course Catalog',
    footer: 'KES 2,000 per course',
  }
);
```

## Pre-built Templates

```typescript
import {
  sendWelcomeMessage,
  sendCourseCatalog,
  sendQuizResult,
  sendCertificate,
} from '@lms/whatsapp/templates/learning-messages';

// Welcome new user
await sendWelcomeMessage(whatsapp, '+254712345678', 'John');

// Show course catalog
await sendCourseCatalog(whatsapp, '+254712345678');

// Send quiz results
await sendQuizResult(whatsapp, '+254712345678', 8, 10, true);

// Award certificate
await sendCertificate(
  whatsapp,
  '+254712345678',
  'Web Development',
  'https://cert.skillhub.co.ke/123',
  'CERT-123456'
);
```

## Webhook Handling

```typescript
// Verify webhook (GET request)
const isValid = WhatsAppService.verifyWebhook(
  mode, // from query params
  token, // from query params
  process.env.WHATSAPP_VERIFY_TOKEN!
);

// Parse webhook event (POST request)
const event = WhatsAppService.parseWebhookEvent(requestBody);

if (event?.messages) {
  for (const message of event.messages) {
    console.log('Received message from:', message.from);
    console.log('Message type:', message.type);

    if (message.type === 'text') {
      console.log('Text:', message.text?.body);
    }

    if (message.type === 'interactive') {
      const buttonId = message.interactive?.button_reply?.id;
      console.log('Button clicked:', buttonId);
    }

    // Mark as read
    await whatsapp.markAsRead(message.id);
  }
}

if (event?.statuses) {
  for (const status of event.statuses) {
    console.log('Message status:', status.status);
  }
}
```

## Media Handling

```typescript
// User sends an image
if (message.type === 'image' && message.image) {
  // Get media URL
  const { url, mimeType } = await whatsapp.getMediaUrl(message.image.id);

  // Download media
  const buffer = await whatsapp.downloadMedia(url);

  // Process the image...
}
```

## Message Limits

WhatsApp has rate limits:
- **1,000 messages/second** per phone number
- **Conversations**: 24-hour window after user messages you
- **Template messages**: Can send anytime (if approved by Meta)
- **Button limit**: Max 3 buttons per message
- **List limit**: Max 10 sections, max 10 rows per section

## Best Practices

1. **Keep messages concise** - WhatsApp is for quick interactions
2. **Use buttons/lists** for navigation (better UX than typing)
3. **Mark messages as read** - Shows you're responsive
4. **Handle errors gracefully** - Always send helpful error messages
5. **Respect 24-hour window** - Use templates for follow-ups
6. **Test on real WhatsApp** - Emulators don't show interactive messages correctly

## Template Message Guidelines

To send template messages (outside 24-hour window):
1. Create template in Meta Business Manager
2. Get it approved by Meta (usually 24-48 hours)
3. Use the template name in code:

```typescript
await whatsapp.sendTemplate(
  '+254712345678',
  'daily_reminder', // template name
  'en', // language code
  [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: 'John' },
        { type: 'text', text: 'Web Development' },
      ],
    },
  ]
);
```

## Error Handling

```typescript
try {
  await whatsapp.sendText('+254712345678', 'Hello!');
} catch (error) {
  console.error('Failed to send message:', error);
  // Handle error (retry, log, notify)
}
```

## Common Errors

- **130472**: User's phone number is not on WhatsApp
- **131051**: Message failed to send (temporary issue)
- **131056**: Rate limit exceeded
- **131031**: Recipient unable to receive messages

## Development

```bash
# Type checking
pnpm type-check
```

## Environment Variables

```bash
WHATSAPP_TOKEN=your-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_VERIFY_TOKEN=your-webhook-verify-token
```

## Testing

Use the [WhatsApp Business API Test Number](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started) for development.

## License

MIT
