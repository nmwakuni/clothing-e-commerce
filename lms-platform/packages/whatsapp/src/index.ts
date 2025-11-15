import { z } from 'zod';

/**
 * WhatsApp Business API Service
 *
 * Handles sending messages, media, interactive buttons, and templates
 */

// Configuration
export interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  apiVersion?: string; // default: v21.0
  webhookVerifyToken?: string;
}

// Message Types
export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'document' | 'interactive' | 'template';

// Text Message
export interface TextMessage {
  to: string;
  type: 'text';
  text: {
    body: string;
    preview_url?: boolean;
  };
}

// Image Message
export interface ImageMessage {
  to: string;
  type: 'image';
  image: {
    link?: string;
    id?: string; // Media ID from WhatsApp
    caption?: string;
  };
}

// Interactive Button Message
export interface ButtonMessage {
  to: string;
  type: 'interactive';
  interactive: {
    type: 'button';
    body: {
      text: string;
    };
    action: {
      buttons: Array<{
        type: 'reply';
        reply: {
          id: string;
          title: string; // Max 20 chars
        };
      }>;
    };
    header?: {
      type: 'text';
      text: string;
    };
    footer?: {
      text: string;
    };
  };
}

// Interactive List Message
export interface ListMessage {
  to: string;
  type: 'interactive';
  interactive: {
    type: 'list';
    body: {
      text: string;
    };
    action: {
      button: string; // Button text (e.g., "View Options")
      sections: Array<{
        title?: string;
        rows: Array<{
          id: string;
          title: string; // Max 24 chars
          description?: string; // Max 72 chars
        }>;
      }>;
    };
    header?: {
      type: 'text';
      text: string;
    };
    footer?: {
      text: string;
    };
  };
}

// Template Message
export interface TemplateMessage {
  to: string;
  type: 'template';
  template: {
    name: string;
    language: {
      code: string; // e.g., 'en', 'sw' for Swahili
    };
    components?: Array<{
      type: 'header' | 'body' | 'button';
      parameters: Array<{
        type: 'text' | 'currency' | 'date_time' | 'image' | 'document' | 'video';
        text?: string;
        currency?: { fallback_value: string; code: string; amount_1000: number };
        date_time?: { fallback_value: string };
        image?: { link: string };
        document?: { link: string; filename: string };
        video?: { link: string };
      }>;
    }>;
  };
}

// Union type for all messages
export type WhatsAppMessage =
  | TextMessage
  | ImageMessage
  | ButtonMessage
  | ListMessage
  | TemplateMessage;

// Response from WhatsApp API
export interface WhatsAppResponse {
  messaging_product: 'whatsapp';
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

// Webhook Event Types
export interface WebhookMessage {
  from: string;
  id: string;
  timestamp: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'interactive';
  text?: {
    body: string;
  };
  image?: {
    id: string;
    mime_type: string;
    sha256: string;
    caption?: string;
  };
  interactive?: {
    type: 'button_reply' | 'list_reply';
    button_reply?: {
      id: string;
      title: string;
    };
    list_reply?: {
      id: string;
      title: string;
      description?: string;
    };
  };
}

export interface WebhookStatus {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
  errors?: Array<{
    code: number;
    title: string;
    message: string;
  }>;
}

/**
 * WhatsApp Business API Client
 */
export class WhatsAppService {
  private config: WhatsAppConfig;
  private baseUrl: string;

  constructor(config: WhatsAppConfig) {
    this.config = config;
    const version = config.apiVersion || 'v21.0';
    this.baseUrl = `https://graph.facebook.com/${version}/${config.phoneNumberId}`;
  }

  /**
   * Send any type of WhatsApp message
   */
  async sendMessage(message: WhatsAppMessage): Promise<WhatsAppResponse> {
    const url = `${this.baseUrl}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      ...message,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`WhatsApp API error: ${JSON.stringify(error)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      throw error;
    }
  }

  /**
   * Send a simple text message
   */
  async sendText(to: string, text: string, previewUrl = false): Promise<WhatsAppResponse> {
    return this.sendMessage({
      to,
      type: 'text',
      text: { body: text, preview_url: previewUrl },
    });
  }

  /**
   * Send image with optional caption
   */
  async sendImage(to: string, imageUrl: string, caption?: string): Promise<WhatsAppResponse> {
    return this.sendMessage({
      to,
      type: 'image',
      image: { link: imageUrl, caption },
    });
  }

  /**
   * Send interactive buttons
   */
  async sendButtons(
    to: string,
    bodyText: string,
    buttons: Array<{ id: string; title: string }>,
    options?: {
      header?: string;
      footer?: string;
    }
  ): Promise<WhatsAppResponse> {
    const message: ButtonMessage = {
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: bodyText },
        action: {
          buttons: buttons.slice(0, 3).map((btn) => ({ // Max 3 buttons
            type: 'reply',
            reply: {
              id: btn.id,
              title: btn.title.slice(0, 20), // Max 20 chars
            },
          })),
        },
      },
    };

    if (options?.header) {
      message.interactive.header = {
        type: 'text',
        text: options.header,
      };
    }

    if (options?.footer) {
      message.interactive.footer = {
        text: options.footer,
      };
    }

    return this.sendMessage(message);
  }

  /**
   * Send interactive list
   */
  async sendList(
    to: string,
    bodyText: string,
    buttonText: string,
    sections: Array<{
      title?: string;
      rows: Array<{ id: string; title: string; description?: string }>;
    }>,
    options?: {
      header?: string;
      footer?: string;
    }
  ): Promise<WhatsAppResponse> {
    const message: ListMessage = {
      to,
      type: 'interactive',
      interactive: {
        type: 'list',
        body: { text: bodyText },
        action: {
          button: buttonText,
          sections: sections.map((section) => ({
            title: section.title,
            rows: section.rows.map((row) => ({
              id: row.id,
              title: row.title.slice(0, 24), // Max 24 chars
              description: row.description?.slice(0, 72), // Max 72 chars
            })),
          })),
        },
      },
    };

    if (options?.header) {
      message.interactive.header = {
        type: 'text',
        text: options.header,
      };
    }

    if (options?.footer) {
      message.interactive.footer = {
        text: options.footer,
      };
    }

    return this.sendMessage(message);
  }

  /**
   * Send template message
   */
  async sendTemplate(
    to: string,
    templateName: string,
    languageCode = 'en',
    components?: TemplateMessage['template']['components']
  ): Promise<WhatsAppResponse> {
    return this.sendMessage({
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components,
      },
    });
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<{ success: boolean }> {
    const url = `${this.baseUrl}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      }),
    });

    return await response.json();
  }

  /**
   * Get media URL from media ID
   */
  async getMediaUrl(mediaId: string): Promise<{ url: string; mimeType: string }> {
    const url = `https://graph.facebook.com/${this.config.apiVersion || 'v21.0'}/${mediaId}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
      },
    });

    const data = await response.json();

    return {
      url: data.url,
      mimeType: data.mime_type,
    };
  }

  /**
   * Download media file
   */
  async downloadMedia(mediaUrl: string): Promise<ArrayBuffer> {
    const response = await fetch(mediaUrl, {
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
      },
    });

    return await response.arrayBuffer();
  }

  /**
   * Verify webhook signature (for security)
   */
  static verifyWebhook(
    mode: string,
    token: string,
    verifyToken: string
  ): boolean {
    return mode === 'subscribe' && token === verifyToken;
  }

  /**
   * Parse webhook event
   */
  static parseWebhookEvent(body: any): {
    messages?: WebhookMessage[];
    statuses?: WebhookStatus[];
  } | null {
    if (body.object !== 'whatsapp_business_account') {
      return null;
    }

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value) {
      return null;
    }

    return {
      messages: value.messages,
      statuses: value.statuses,
    };
  }
}

// Export helper to create service
export function createWhatsAppService(config: WhatsAppConfig): WhatsAppService {
  return new WhatsAppService(config);
}

// Export types
export type {
  WhatsAppConfig,
  WhatsAppMessage,
  WhatsAppResponse,
  TextMessage,
  ImageMessage,
  ButtonMessage,
  ListMessage,
  TemplateMessage,
  WebhookMessage,
  WebhookStatus,
};
