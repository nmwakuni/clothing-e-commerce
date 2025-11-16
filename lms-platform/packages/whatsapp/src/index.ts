import axios from 'axios';

export interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  type: 'text' | 'button' | 'interactive';
  text?: {
    body: string;
  };
  button?: {
    text: string;
    payload: string;
  };
  interactive?: {
    type: string;
    button_reply?: {
      id: string;
      title: string;
    };
    list_reply?: {
      id: string;
      title: string;
      description: string;
    };
  };
}

export interface WhatsAppServiceConfig {
  accessToken: string;
  phoneNumberId: string;
  webhookVerifyToken: string;
  businessAccountId: string;
}

export class WhatsAppService {
  private config: WhatsAppServiceConfig;
  private baseUrl = 'https://graph.facebook.com/v18.0';

  constructor(config: WhatsAppServiceConfig) {
    this.config = config;
  }

  /**
   * Verify webhook subscription
   */
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.config.webhookVerifyToken) {
      return challenge;
    }
    return null;
  }

  /**
   * Send a text message
   */
  async sendTextMessage(
    to: string,
    text: string
  ): Promise<{ success: boolean; messageId?: string }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.config.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: text },
        },
        {
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return { success: true, messageId: response.data.messages[0].id };
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      return { success: false };
    }
  }

  /**
   * Send an interactive button message
   */
  async sendButtonMessage(
    to: string,
    bodyText: string,
    buttons: Array<{ id: string; title: string }>
  ): Promise<{ success: boolean; messageId?: string }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.config.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
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

      return { success: true, messageId: response.data.messages[0].id };
    } catch (error) {
      console.error('Failed to send button message:', error);
      return { success: false };
    }
  }

  /**
   * Send an interactive list message
   */
  async sendListMessage(
    to: string,
    bodyText: string,
    buttonText: string,
    sections: Array<{
      title: string;
      rows: Array<{ id: string; title: string; description?: string }>;
    }>
  ): Promise<{ success: boolean; messageId?: string }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.config.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'interactive',
          interactive: {
            type: 'list',
            body: { text: bodyText },
            action: {
              button: buttonText,
              sections,
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

      return { success: true, messageId: response.data.messages[0].id };
    } catch (error) {
      console.error('Failed to send list message:', error);
      return { success: false };
    }
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<boolean> {
    try {
      await axios.post(
        `${this.baseUrl}/${this.config.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId,
        },
        {
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return true;
    } catch (error) {
      console.error('Failed to mark message as read:', error);
      return false;
    }
  }
}

// Export handlers
export * from './handlers/lesson-handler';
export * from './handlers/quiz-handler';
export * from './handlers/menu-handler';
export * from './services/lesson-delivery';
