import { AIShoppingAssistant, ConversationContext, Product } from '@biashara/ai-assistant';
import { createDb, customers, products, vendors, customerSessions, orders, orderItems } from '@biashara/database';
import { eq, and, like, or, gte, lte, sql } from 'drizzle-orm';

export class WhatsAppCommerceBot {
  private ai: AIShoppingAssistant;
  private db: ReturnType<typeof createDb>;
  private whatsappApiKey: string;

  constructor(anthropicApiKey: string, databaseUrl: string, whatsappApiKey: string) {
    this.ai = new AIShoppingAssistant(anthropicApiKey);
    this.db = createDb(databaseUrl);
    this.whatsappApiKey = whatsappApiKey;
  }

  /**
   * Main message handler
   */
  async handleMessage(from: string, message: string, messageId: string): Promise<void> {
    // Get or create customer
    const customer = await this.getOrCreateCustomer(from);

    // Get or create session
    const session = await this.getOrCreateSession(customer.id, from);

    // Detect intent
    const intent = await this.ai.detectIntent(message);

    // Handle based on intent
    switch (intent.intent) {
      case 'greeting':
        await this.handleGreeting(from, customer);
        break;

      case 'search':
        await this.handleSearch(from, message, session, customer);
        break;

      case 'view_product':
        await this.handleViewProduct(from, message, session);
        break;

      case 'add_to_cart':
        await this.handleAddToCart(from, session);
        break;

      case 'checkout':
        await this.handleCheckout(from, session, customer);
        break;

      case 'track_order':
        await this.handleTrackOrder(from, customer);
        break;

      case 'help':
      default:
        await this.handleHelp(from);
        break;
    }

    // Update session
    await this.updateSession(session.id, message, 'user');
  }

  /**
   * Handle greeting
   */
  private async handleGreeting(phoneNumber: string, customer: any): Promise<void> {
    const message = `Karibu ${customer.name || 'to Biashara'}! 🛍️

I'm your AI shopping assistant. What would you like to buy today?

📱 *Popular Categories:*
1️⃣ Fashion & Clothing
2️⃣ Electronics & Phones
3️⃣ Food & Fresh Produce
4️⃣ Beauty & Personal Care
5️⃣ Home & Living

Type a category number or search for anything!

Examples:
• "Show me phones under 15000"
• "Red dresses"
• "Fresh vegetables in Nairobi"`;

    await this.sendMessage(phoneNumber, message);
  }

  /**
   * Handle product search
   */
  private async handleSearch(
    phoneNumber: string,
    query: string,
    session: any,
    customer: any
  ): Promise<void> {
    // Parse search query with AI
    const searchContext = await this.ai.parseSearchQuery(query);

    // Build database query
    let dbQuery = this.db.select().from(products).where(eq(products.isActive, true));

    // Apply filters
    if (searchContext.query) {
      dbQuery = dbQuery.where(
        or(
          like(products.name, `%${searchContext.query}%`),
          like(products.description, `%${searchContext.query}%`),
          sql`${products.searchKeywords} && ARRAY[${searchContext.query}]`
        )
      ) as any;
    }

    if (searchContext.category) {
      const categoryMap: Record<string, string> = {
        fashion: 'fashion',
        electronics: 'electronics',
        food: 'food',
        produce: 'produce',
        beauty: 'beauty',
        home: 'home',
        crafts: 'crafts',
      };
      const cat = await this.db.select().from(categories).where(
        eq(categories.slug, categoryMap[searchContext.category])
      ).limit(1);
      if (cat.length > 0) {
        dbQuery = dbQuery.where(eq(products.categoryId, cat[0].id)) as any;
      }
    }

    if (searchContext.priceRange) {
      if (searchContext.priceRange.min) {
        dbQuery = dbQuery.where(gte(products.price, searchContext.priceRange.min.toString())) as any;
      }
      if (searchContext.priceRange.max) {
        dbQuery = dbQuery.where(lte(products.price, searchContext.priceRange.max.toString())) as any;
      }
    }

    // Execute query
    const results = await dbQuery.limit(10);

    if (results.length === 0) {
      await this.sendMessage(
        phoneNumber,
        `Sorry, I couldn't find any products matching "${query}". 😔\n\nTry:\n• Different keywords\n• Broader search\n• Browse categories\n\nType "help" for assistance.`
      );
      return;
    }

    // Get vendor info for products
    const productsWithVendors = await Promise.all(
      results.map(async (p) => {
        const vendor = await this.db.select().from(vendors).where(eq(vendors.id, p.vendorId)).limit(1);
        return {
          ...p,
          vendor: vendor[0]?.businessName || 'Unknown',
        };
      })
    );

    // Format as Product objects for AI
    const productList: Product[] = productsWithVendors.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description || '',
      price: parseFloat(p.price),
      category: '',
      vendor: p.vendor,
      images: p.images as string[] || [],
      stock: p.stockQuantity,
      rating: p.rating ? parseFloat(p.rating) : undefined,
      reviewCount: p.reviewCount,
    }));

    // Generate AI response
    const context: ConversationContext = {
      customerId: customer.id,
      sessionState: 'browsing',
      conversationHistory: [],
    };

    const aiResponse = await this.ai.recommendProducts(productList, context);

    // Build product list message
    const productMessages = productList.slice(0, 5).map((p, i) =>
      `${i + 1}. *${p.name}* - KES ${p.price.toLocaleString()}
${p.description.substring(0, 80)}${p.description.length > 80 ? '...' : ''}
${p.rating ? `⭐ ${p.rating}/5 (${p.reviewCount})` : ''}
🏪 ${p.vendor}
${p.stock > 0 ? '✅ In stock' : '❌ Out of stock'}`
    ).join('\n\n');

    const message = `${aiResponse}\n\n${productMessages}\n\n💬 Reply with a number to view details or search again!`;

    await this.sendMessage(phoneNumber, message);

    // Update session with results
    await this.db.update(customerSessions).set({
      sessionData: { searchResults: productList },
      currentState: 'browsing',
    }).where(eq(customerSessions.id, session.id));
  }

  /**
   * Handle viewing product details
   */
  private async handleViewProduct(phoneNumber: string, message: string, session: any): Promise<void> {
    const number = parseInt(message.trim());

    if (isNaN(number)) {
      await this.sendMessage(phoneNumber, 'Please reply with a number to view product details.');
      return;
    }

    const sessionData = session.sessionData as any;
    const searchResults = sessionData?.searchResults || [];

    if (number < 1 || number > searchResults.length) {
      await this.sendMessage(
        phoneNumber,
        `Please choose a number between 1 and ${searchResults.length}`
      );
      return;
    }

    const product = searchResults[number - 1];

    const productMessage = `📱 *${product.name}*

💰 *Price:* KES ${product.price.toLocaleString()}

📝 *Description:*
${product.description}

🏪 *Seller:* ${product.vendor}
${product.rating ? `⭐ Rating: ${product.rating}/5 (${product.reviewCount} reviews)` : ''}
📦 Stock: ${product.stock > 0 ? `${product.stock} available` : 'Out of stock'}

*What would you like to do?*
1️⃣ Buy Now
2️⃣ Add to Cart
3️⃣ Contact Seller
4️⃣ View Reviews
5️⃣ Back to Search

Reply with number:`;

    await this.sendMessage(phoneNumber, productMessage);

    // Update session
    await this.db.update(customerSessions).set({
      sessionData: { ...sessionData, currentProduct: product },
      currentState: 'viewing_product',
    }).where(eq(customerSessions.id, session.id));
  }

  /**
   * Handle add to cart
   */
  private async handleAddToCart(phoneNumber: string, session: any): Promise<void> {
    const sessionData = session.sessionData as any;
    const currentProduct = sessionData?.currentProduct;

    if (!currentProduct) {
      await this.sendMessage(phoneNumber, 'Please select a product first.');
      return;
    }

    const cart = sessionData?.cart || [];
    cart.push(currentProduct);

    await this.db.update(customerSessions).set({
      sessionData: { ...sessionData, cart },
      currentState: 'cart',
    }).where(eq(customerSessions.id, session.id));

    await this.sendMessage(
      phoneNumber,
      `✅ Added *${currentProduct.name}* to cart!\n\n🛒 Cart: ${cart.length} item(s)\n💰 Total: KES ${cart.reduce((sum: number, p: any) => sum + p.price, 0).toLocaleString()}\n\nType "checkout" to complete your order or continue shopping.`
    );
  }

  /**
   * Handle checkout
   */
  private async handleCheckout(phoneNumber: string, session: any, customer: any): Promise<void> {
    const sessionData = session.sessionData as any;
    const cart = sessionData?.cart || [];

    if (cart.length === 0) {
      await this.sendMessage(phoneNumber, 'Your cart is empty! Add some products first.');
      return;
    }

    const subtotal = cart.reduce((sum: number, p: any) => sum + p.price, 0);
    const deliveryFee = 200; // Fixed for now
    const total = subtotal + deliveryFee;

    const cartSummary = cart.map((p: any, i: number) =>
      `${i + 1}. ${p.name} - KES ${p.price.toLocaleString()}`
    ).join('\n');

    const message = `🛍️ *ORDER SUMMARY*

${cartSummary}

Subtotal: KES ${subtotal.toLocaleString()}
Delivery: KES ${deliveryFee.toLocaleString()}
*Total: KES ${total.toLocaleString()}*

📍 *Delivery Address:*
${customer.deliveryAddresses?.[0]?.address || 'Not set'}

Reply:
• "YES" to confirm
• "ADDRESS" to change address
• "CANCEL" to cancel order`;

    await this.sendMessage(phoneNumber, message);

    await this.db.update(customerSessions).set({
      currentState: 'checkout',
    }).where(eq(customerSessions.id, session.id));
  }

  /**
   * Handle order tracking
   */
  private async handleTrackOrder(phoneNumber: string, customer: any): Promise<void> {
    const recentOrders = await this.db
      .select()
      .from(orders)
      .where(eq(orders.customerId, customer.id))
      .orderBy(sql`${orders.createdAt} DESC`)
      .limit(5);

    if (recentOrders.length === 0) {
      await this.sendMessage(phoneNumber, 'You have no orders yet. Start shopping! 🛍️');
      return;
    }

    const orderMessages = recentOrders.map(order =>
      `📦 *${order.orderNumber}*
Status: ${this.formatStatus(order.status)}
Total: KES ${parseFloat(order.total).toLocaleString()}
Date: ${order.createdAt.toLocaleDateString()}`
    ).join('\n\n');

    await this.sendMessage(
      phoneNumber,
      `*YOUR ORDERS* 📦\n\n${orderMessages}\n\nReply with order number for details.`
    );
  }

  /**
   * Handle help
   */
  private async handleHelp(phoneNumber: string): Promise<void> {
    const message = `🤖 *BIASHARA HELP*

*How to Shop:*
• Search: "show me phones"
• Filter: "dresses under 2000"
• Location: "food in Nairobi"

*Commands:*
• "cart" - View your cart
• "checkout" - Complete order
• "track" - Track orders
• "help" - This message

*Payment Methods:*
💳 M-Pesa
📱 Airtel Money
💵 Cash on Delivery

Need assistance? Type "support"`;

    await this.sendMessage(phoneNumber, message);
  }

  /**
   * Get or create customer
   */
  private async getOrCreateCustomer(phoneNumber: string): Promise<any> {
    const existing = await this.db
      .select()
      .from(customers)
      .where(eq(customers.phoneNumber, phoneNumber))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const [customer] = await this.db.insert(customers).values({
      phoneNumber,
      whatsappNumber: phoneNumber,
    }).returning();

    return customer;
  }

  /**
   * Get or create session
   */
  private async getOrCreateSession(customerId: string, phoneNumber: string): Promise<any> {
    const existing = await this.db
      .select()
      .from(customerSessions)
      .where(
        and(
          eq(customerSessions.phoneNumber, phoneNumber),
          eq(customerSessions.isActive, true)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const [session] = await this.db.insert(customerSessions).values({
      customerId,
      phoneNumber,
      currentState: 'idle',
      sessionData: {},
      messages: [],
    }).returning();

    return session;
  }

  /**
   * Update session with message
   */
  private async updateSession(sessionId: string, message: string, role: 'user' | 'assistant'): Promise<void> {
    const session = await this.db.select().from(customerSessions).where(eq(customerSessions.id, sessionId)).limit(1);

    if (session.length === 0) return;

    const messages = (session[0].messages as any[]) || [];
    messages.push({ role, content: message, timestamp: new Date().toISOString() });

    await this.db.update(customerSessions).set({
      messages,
      lastMessage: message,
      lastMessageAt: new Date(),
    }).where(eq(customerSessions.id, sessionId));
  }

  /**
   * Send WhatsApp message
   */
  private async sendMessage(to: string, message: string): Promise<void> {
    // Integration with WhatsApp Business API
    // For now, just log
    console.log(`[WhatsApp] To ${to}: ${message}`);

    // In production:
    // await fetch('https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${this.whatsappApiKey}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     messaging_product: 'whatsapp',
    //     to: to,
    //     type: 'text',
    //     text: { body: message },
    //   }),
    // });
  }

  /**
   * Format order status
   */
  private formatStatus(status: string): string {
    const statusMap: Record<string, string> = {
      pending: '⏳ Pending',
      confirmed: '✅ Confirmed',
      processing: '📦 Processing',
      ready_for_delivery: '🚀 Ready for Delivery',
      out_for_delivery: '🚚 Out for Delivery',
      delivered: '✅ Delivered',
      cancelled: '❌ Cancelled',
      refunded: '💰 Refunded',
    };
    return statusMap[status] || status;
  }
}
