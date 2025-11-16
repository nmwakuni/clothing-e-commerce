import Anthropic from '@anthropic-ai/sdk';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  vendor: string;
  images: string[];
  stock: number;
  rating?: number;
  reviewCount?: number;
}

export interface SearchContext {
  query: string;
  priceRange?: { min: number; max: number };
  category?: string;
  location?: string;
}

export interface ConversationContext {
  customerId?: string;
  sessionState: 'browsing' | 'viewing_product' | 'cart' | 'checkout' | 'payment';
  currentProduct?: Product;
  cart?: Product[];
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export class AIShoppingAssistant {
  private anthropic: Anthropic;

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({ apiKey });
  }

  /**
   * Parse natural language search query into structured search parameters
   */
  async parseSearchQuery(query: string): Promise<SearchContext> {
    const prompt = `You are a product search query parser for an African e-commerce platform.
Parse this customer query into structured search parameters:

Query: "${query}"

Return ONLY a JSON object with these fields:
{
  "query": "cleaned search terms",
  "priceRange": { "min": number or null, "max": number or null },
  "category": "fashion|electronics|food|produce|beauty|home|crafts|other" or null,
  "location": "county/town" or null
}

Examples:
"red dresses under 2000" → {"query": "red dresses", "priceRange": {"min": null, "max": 2000}, "category": "fashion", "location": null}
"phones in Nairobi" → {"query": "phones", "priceRange": null, "category": "electronics", "location": "Nairobi"}
"cheap rice" → {"query": "rice", "priceRange": {"min": null, "max": null}, "category": "food", "location": null}`;

    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20250116',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    try {
      const parsed = JSON.parse(content.text);
      return parsed as SearchContext;
    } catch (error) {
      // Fallback to basic search
      return {
        query: query.toLowerCase(),
        priceRange: undefined,
        category: undefined,
        location: undefined,
      };
    }
  }

  /**
   * Generate conversational product recommendations
   */
  async recommendProducts(products: Product[], context: ConversationContext): Promise<string> {
    const productsText = products.slice(0, 5).map((p, i) =>
      `${i + 1}. ${p.name} - KES ${p.price.toLocaleString()}
   ${p.description}
   ${p.rating ? `⭐ ${p.rating}/5 (${p.reviewCount} reviews)` : ''}
   🏪 ${p.vendor}
   ${p.stock > 0 ? '✅ In stock' : '❌ Out of stock'}`
    ).join('\n\n');

    const prompt = `You are Biashara, a friendly AI shopping assistant for Kenya's WhatsApp commerce platform.

Customer's search resulted in ${products.length} products. Here are the top ${Math.min(5, products.length)}:

${productsText}

Generate a helpful, concise response (max 300 characters) that:
1. Acknowledges the search
2. Highlights 2-3 best options with brief reasons
3. Asks what they'd like to do next
4. Uses Kenyan English and friendly tone
5. Includes relevant emojis

Response:`;

    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20250116',
      max_tokens: 300,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const content = response.content[0];
    return content.type === 'text' ? content.text : '';
  }

  /**
   * Handle conversational shopping queries
   */
  async chat(message: string, context: ConversationContext): Promise<string> {
    const systemPrompt = `You are Biashara, a friendly AI shopping assistant for Kenya's WhatsApp commerce platform.

You help customers:
- Find products through natural conversation
- Compare options
- Check stock and delivery
- Place orders
- Track shipments

Guidelines:
- Use Kenyan English and Swahili greetings (Karibu, Asante)
- Be concise (WhatsApp messages should be brief)
- Use emojis appropriately
- Mention M-Pesa for payments
- Be helpful and friendly
- If customer needs help, offer to connect them to vendor

Customer context:
- Session state: ${context.sessionState}
- Cart items: ${context.cart?.length || 0}
${context.currentProduct ? `- Currently viewing: ${context.currentProduct.name}` : ''}`;

    const messages = [
      ...context.conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: message,
      },
    ];

    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20250116',
      max_tokens: 400,
      temperature: 0.8,
      system: systemPrompt,
      messages: messages as any,
    });

    const content = response.content[0];
    return content.type === 'text' ? content.text : '';
  }

  /**
   * Generate product description from details
   */
  async generateProductDescription(productName: string, specs: Record<string, any>): Promise<string> {
    const specsText = Object.entries(specs)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    const prompt = `Generate a compelling WhatsApp-friendly product description (max 200 characters) for:

Product: ${productName}
Specifications:
${specsText}

Make it engaging, highlight key features, use emojis.`;

    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20250116',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const content = response.content[0];
    return content.type === 'text' ? content.text : '';
  }

  /**
   * Detect customer intent from message
   */
  async detectIntent(message: string): Promise<{
    intent: 'search' | 'view_product' | 'add_to_cart' | 'checkout' | 'track_order' | 'help' | 'greeting';
    confidence: number;
    entities?: any;
  }> {
    const prompt = `Analyze this WhatsApp message and return the customer's intent:

Message: "${message}"

Return ONLY JSON:
{
  "intent": "search|view_product|add_to_cart|checkout|track_order|help|greeting",
  "confidence": 0.0 to 1.0,
  "entities": {}
}

Examples:
"show me phones" → {"intent": "search", "confidence": 0.9, "entities": {"query": "phones"}}
"hi" → {"intent": "greeting", "confidence": 1.0}
"add to cart" → {"intent": "add_to_cart", "confidence": 0.95}
"track my order" → {"intent": "track_order", "confidence": 0.9}`;

    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20250116',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      return { intent: 'help', confidence: 0.5 };
    }

    try {
      return JSON.parse(content.text);
    } catch {
      return { intent: 'help', confidence: 0.5 };
    }
  }
}
