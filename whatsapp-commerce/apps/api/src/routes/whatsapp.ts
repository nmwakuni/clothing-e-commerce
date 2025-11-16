import { Hono } from 'hono';
import { WhatsAppCommerceBot } from '@biashara/whatsapp-bot';

export const whatsappRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    ANTHROPIC_API_KEY: string;
    WHATSAPP_API_KEY: string;
  };
}>();

// WhatsApp webhook for incoming messages
whatsappRouter.post('/webhook', async (c) => {
  try {
    const body = await c.req.json();

    // Verify webhook (Meta/WhatsApp sends verification requests)
    if (body.object === 'whatsapp_business_account') {
      // Process messages
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.value?.messages) {
            for (const message of change.value.messages) {
              const bot = new WhatsAppCommerceBot(
                c.env.ANTHROPIC_API_KEY,
                c.env.DATABASE_URL,
                c.env.WHATSAPP_API_KEY
              );

              await bot.handleMessage(
                message.from,
                message.text?.body || '',
                message.id
              );
            }
          }
        }
      }
    }

    return c.json({ status: 'ok' });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return c.json({ error: 'Failed to process webhook' }, 500);
  }
});

// WhatsApp webhook verification (GET)
whatsappRouter.get('/webhook', async (c) => {
  const mode = c.req.query('hub.mode');
  const token = c.req.query('hub.verify_token');
  const challenge = c.req.query('hub.challenge');

  const VERIFY_TOKEN = 'biashara_webhook_token'; // Store in env

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return c.text(challenge || '');
  }

  return c.json({ error: 'Invalid verification token' }, 403);
});
