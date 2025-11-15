import { Hono } from 'hono';

type Bindings = {
  WHATSAPP_TOKEN: string;
  WHATSAPP_VERIFY_TOKEN: string;
};

export const whatsappRouter = new Hono<{ Bindings: Bindings }>();

// GET /api/whatsapp/webhook - Webhook verification (Meta requirement)
whatsappRouter.get('/webhook', (c) => {
  const mode = c.req.query('hub.mode');
  const token = c.req.query('hub.verify_token');
  const challenge = c.req.query('hub.challenge');

  const verifyToken = c.env.WHATSAPP_VERIFY_TOKEN || 'skillhub_verify_token';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('Webhook verified successfully');
    return c.text(challenge || '');
  }

  console.log('Webhook verification failed');
  return c.json({ error: 'Verification failed' }, 403);
});

// POST /api/whatsapp/webhook - Receive WhatsApp messages
whatsappRouter.post('/webhook', async (c) => {
  try {
    const body = await c.req.json();

    console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2));

    // Check if it's a message event
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (value?.messages) {
        const message = value.messages[0];
        const from = message.from; // Phone number
        const messageId = message.id;
        const messageType = message.type; // text, image, video, etc.

        console.log(`Message from ${from}:`, {
          id: messageId,
          type: messageType,
          timestamp: message.timestamp,
        });

        // Handle different message types
        if (messageType === 'text') {
          const text = message.text.body;
          console.log(`Text message: "${text}"`);

          // TODO: Process message with AI tutor
          // 1. Get or create user from phone number
          // 2. Get or create conversation
          // 3. Determine context (learning, browsing, support)
          // 4. Generate AI response
          // 5. Send reply via WhatsApp API

          // For now, just acknowledge receipt
          // await sendWhatsAppMessage(from, `Echo: ${text}`);
        }

        // Handle images, videos, documents, etc.
        if (messageType === 'image') {
          console.log('Image received:', message.image);
        }

        if (messageType === 'interactive') {
          console.log('Interactive message (button/list):', message.interactive);
        }
      }

      // Handle message status updates (sent, delivered, read)
      if (value?.statuses) {
        const status = value.statuses[0];
        console.log('Message status update:', {
          id: status.id,
          status: status.status,
          timestamp: status.timestamp,
        });

        // TODO: Update message status in database
      }
    }

    // Always return 200 to acknowledge receipt
    return c.json({ success: true });
  } catch (error) {
    console.error('Error processing WhatsApp webhook:', error);
    // Still return 200 to prevent Meta from disabling webhook
    return c.json({ success: true });
  }
});

// Helper function to send WhatsApp message
async function sendWhatsAppMessage(to: string, message: string, token: string) {
  // TODO: Implement WhatsApp Cloud API message sending
  // const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;
  // const response = await fetch(url, {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${token}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     messaging_product: 'whatsapp',
  //     to,
  //     type: 'text',
  //     text: { body: message },
  //   }),
  // });

  console.log(`Would send message to ${to}: ${message}`);
}
