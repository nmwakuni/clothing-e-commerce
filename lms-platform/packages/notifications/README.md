# @lms/notifications

Email and notification services for the LMS platform using Resend.

## Installation

```bash
pnpm install
```

## Environment Variables

Add to your `.env` file:

```bash
RESEND_API_KEY=re_...
EMAIL_FROM=SkillHub Africa <noreply@skillhub.co.ke>
```

## Usage

### Initialize the service

```typescript
import { ResendNotificationService } from '@lms/notifications';

const notificationService = new ResendNotificationService(
  process.env.RESEND_API_KEY!,
  process.env.EMAIL_FROM
);
```

### Send emails

```typescript
import { generateWelcomeEmail } from '@lms/notifications';

// Send welcome email
const html = generateWelcomeEmail({
  userName: 'John Doe',
  loginUrl: 'https://skillhub.co.ke/login',
});

await notificationService.sendEmail({
  to: 'user@example.com',
  subject: 'Welcome to SkillHub Africa!',
  html,
});
```

## Available Email Templates

- **Welcome Email**: `generateWelcomeEmail(data)`
- **Course Enrollment**: `generateCourseEnrollmentEmail(data)`
- **Lesson Completed**: `generateLessonCompletedEmail(data)`
- **Achievement Unlocked**: `generateAchievementUnlockedEmail(data)`
- **Payment Receipt**: `generatePaymentReceiptEmail(data)`
- **Password Reset**: `generatePasswordResetEmail(data)`

## Testing

To test emails locally, you can use Resend's test mode or log emails to console in development.
