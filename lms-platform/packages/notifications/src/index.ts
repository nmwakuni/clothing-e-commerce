import { Resend } from 'resend';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export interface NotificationService {
  sendEmail(
    options: EmailOptions
  ): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

export class ResendNotificationService implements NotificationService {
  private resend: Resend;
  private defaultFrom: string;

  constructor(apiKey: string, defaultFrom: string = 'SkillHub Africa <noreply@skillhub.co.ke>') {
    this.resend = new Resend(apiKey);
    this.defaultFrom = defaultFrom;
  }

  async sendEmail(
    options: EmailOptions
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: options.from || this.defaultFrom,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        replyTo: options.replyTo,
      });

      if (error) {
        console.error('Failed to send email:', error);
        return { success: false, error: error.message };
      }

      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error('Email send error:', error);
      return { success: false, error: (error as Error).message };
    }
  }
}

// Export email templates
export * from './templates/welcome';
export * from './templates/course-enrollment';
export * from './templates/lesson-completed';
export * from './templates/achievement-unlocked';
export * from './templates/payment-receipt';
export * from './templates/password-reset';
