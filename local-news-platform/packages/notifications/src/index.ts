import axios from 'axios';
import { Resend } from 'resend';

export interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  baseUrl?: string;
}

export interface EmailConfig {
  resendApiKey: string;
  fromEmail: string;
  fromName?: string;
}

export interface SMSConfig {
  provider: 'africastalking' | 'twilio';
  apiKey: string;
  username?: string; // For Africa's Talking
}

export class WhatsAppService {
  private config: WhatsAppConfig;
  private baseUrl: string;

  constructor(config: WhatsAppConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://graph.facebook.com/v18.0';
  }

  /**
   * Send text message via WhatsApp
   */
  async sendTextMessage(
    to: string,
    message: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.config.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to.replace('+', ''),
          type: 'text',
          text: { body: message },
        },
        {
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0].id,
      };
    } catch (error: any) {
      console.error('WhatsApp send failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  /**
   * Send message with buttons
   */
  async sendButtonMessage(
    to: string,
    bodyText: string,
    buttons: Array<{ id: string; title: string }>
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.config.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to.replace('+', ''),
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: bodyText },
            action: {
              buttons: buttons.map((btn) => ({
                type: 'reply',
                reply: { id: btn.id, title: btn.title },
              })),
            },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0].id,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  /**
   * Send news digest with image
   */
  async sendNewsDigest(
    to: string,
    headline: string,
    summary: string,
    imageUrl?: string,
    linkUrl?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const message = `📰 *${headline}*\n\n${summary}${linkUrl ? `\n\n🔗 Read more: ${linkUrl}` : ''}`;

    if (imageUrl) {
      try {
        const response = await axios.post(
          `${this.baseUrl}/${this.config.phoneNumberId}/messages`,
          {
            messaging_product: 'whatsapp',
            to: to.replace('+', ''),
            type: 'image',
            image: {
              link: imageUrl,
              caption: message,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${this.config.accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        return {
          success: true,
          messageId: response.data.messages[0].id,
        };
      } catch (error: any) {
        // Fallback to text if image fails
        return this.sendTextMessage(to, message);
      }
    }

    return this.sendTextMessage(to, message);
  }

  /**
   * Send emergency alert
   */
  async sendEmergencyAlert(
    to: string,
    alertType: string,
    message: string,
    location: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const alertMessage = `🚨 *EMERGENCY ALERT* 🚨\n\n⚠️ ${alertType.toUpperCase()}\n📍 ${location}\n\n${message}\n\nStay safe!`;

    return this.sendTextMessage(to, alertMessage);
  }
}

export class EmailService {
  private resend: Resend;
  private fromEmail: string;
  private fromName: string;

  constructor(config: EmailConfig) {
    this.resend = new Resend(config.resendApiKey);
    this.fromEmail = config.fromEmail;
    this.fromName = config.fromName || 'Mtaa News';
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(
    to: string,
    userName: string,
    neighborhood: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.resend.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to,
        subject: `Welcome to Mtaa News - Your ${neighborhood} News Source! 📰`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; }
    .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📰 Welcome to Mtaa News!</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>

      <p>Welcome to Mtaa News - your hyperlocal news source for ${neighborhood}! 🎉</p>

      <p>We're excited to keep you informed about what's happening in your neighborhood:</p>

      <ul>
        <li>📍 Hyperlocal news from ${neighborhood}</li>
        <li>🔔 Breaking news alerts</li>
        <li>🗳️ Community polls and discussions</li>
        <li>🏢 Local business updates</li>
        <li>🚨 Emergency alerts</li>
      </ul>

      <p>Get started by visiting your personalized news feed:</p>

      <a href="https://mtaanews.co.ke/feed" class="button">View My Feed</a>

      <p>You can also receive updates via WhatsApp for instant news on the go!</p>

      <p>Stay informed,<br>The Mtaa News Team 🌍</p>
    </div>
    <div class="footer">
      <p>Mtaa News - Your neighborhood, your news</p>
      <p>Built with ❤️ for African communities</p>
    </div>
  </div>
</body>
</html>
        `,
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Send daily digest email
   */
  async sendDailyDigest(
    to: string,
    userName: string,
    neighborhood: string,
    articles: Array<{ title: string; summary: string; url: string; imageUrl?: string }>
  ): Promise<{ success: boolean; error?: string }> {
    const articlesHtml = articles
      .map(
        (article) => `
      <div style="margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb;">
        ${article.imageUrl ? `<img src="${article.imageUrl}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 15px;" />` : ''}
        <h3 style="margin: 10px 0; color: #111827;">
          <a href="${article.url}" style="color: #667eea; text-decoration: none;">${article.title}</a>
        </h3>
        <p style="color: #6b7280; margin: 10px 0;">${article.summary}</p>
        <a href="${article.url}" style="color: #667eea; text-decoration: none; font-weight: 500;">Read more →</a>
      </div>
    `
      )
      .join('');

    try {
      await this.resend.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to,
        subject: `📰 ${neighborhood} Daily Digest - ${new Date().toLocaleDateString()}`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📰 ${neighborhood} Daily News</h1>
      <p style="margin: 10px 0; opacity: 0.9;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
    <div class="content">
      <p>Good morning ${userName}! 👋</p>
      <p>Here's what's happening in ${neighborhood} today:</p>

      ${articlesHtml}

      <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        Want more updates? Visit <a href="https://mtaanews.co.ke" style="color: #667eea;">mtaanews.co.ke</a>
      </p>
    </div>
  </div>
</body>
</html>
        `,
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Send emergency alert email
   */
  async sendEmergencyAlert(
    to: string,
    alertType: string,
    title: string,
    message: string,
    location: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.resend.emails.send({
        from: `${this.fromName} Alerts <${this.fromEmail}>`,
        to,
        subject: `🚨 EMERGENCY ALERT: ${alertType} in ${location}`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .alert { background: #fee2e2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="alert">
      <h2 style="color: #dc2626; margin-top: 0;">🚨 ${alertType.toUpperCase()}</h2>
      <p><strong>📍 Location:</strong> ${location}</p>
      <p><strong>${title}</strong></p>
      <p>${message}</p>
      <p style="margin-bottom: 0;"><strong>Please stay safe and follow official guidance.</strong></p>
    </div>
    <p style="font-size: 14px; color: #666;">This is an automated emergency alert from Mtaa News.</p>
  </div>
</body>
</html>
        `,
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export class SMSService {
  private config: SMSConfig;

  constructor(config: SMSConfig) {
    this.config = config;
  }

  /**
   * Send SMS via Africa's Talking
   */
  async sendSMS(
    to: string,
    message: string
  ): Promise<{ success: boolean; error?: string }> {
    if (this.config.provider === 'africastalking') {
      return this.sendViaAfricasTalking(to, message);
    }

    // Add Twilio implementation if needed
    return { success: false, error: 'SMS provider not implemented' };
  }

  private async sendViaAfricasTalking(
    to: string,
    message: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await axios.post(
        'https://api.africastalking.com/version1/messaging',
        new URLSearchParams({
          username: this.config.username || '',
          to,
          message,
        }),
        {
          headers: {
            apiKey: this.config.apiKey,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export class NotificationService {
  private whatsapp?: WhatsAppService;
  private email?: EmailService;
  private sms?: SMSService;

  constructor(config: {
    whatsapp?: WhatsAppConfig;
    email?: EmailConfig;
    sms?: SMSConfig;
  }) {
    if (config.whatsapp) {
      this.whatsapp = new WhatsAppService(config.whatsapp);
    }
    if (config.email) {
      this.email = new EmailService(config.email);
    }
    if (config.sms) {
      this.sms = new SMSService(config.sms);
    }
  }

  getWhatsAppService(): WhatsAppService | undefined {
    return this.whatsapp;
  }

  getEmailService(): EmailService | undefined {
    return this.email;
  }

  getSMSService(): SMSService | undefined {
    return this.sms;
  }
}
