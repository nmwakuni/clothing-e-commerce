# 🛍️ Biashara - WhatsApp Commerce Platform

**Revolutionizing commerce in Africa through WhatsApp**

> "Biashara" means "Business" in Swahili

## 🌍 Vision

Enable millions of African entrepreneurs to sell products via WhatsApp without needing a website, app, or technical expertise. Buyers can shop naturally through chat, pay with mobile money, and get hyperlocal delivery.

## ✨ Key Features

### For Sellers (Vendors)
- 📱 Sell via WhatsApp without a website
- 📦 Manage inventory through chat commands
- 💰 Accept M-Pesa, Airtel Money, cash payments
- 📊 View sales analytics
- 🚚 Manage orders and deliveries
- 📸 Share product catalogs

### For Buyers (Customers)
- 🛍️ Browse products via WhatsApp
- 🔍 AI-powered product search
- 💳 Mobile money & cash on delivery
- 📦 Real-time order tracking
- ⭐ Rate and review sellers
- 👥 Group buying (Chama orders)

### Unique Features
- 🤖 **AI Shopping Assistant**: Natural language product search
- 👥 **Group Buying**: Bulk orders for Chamas/communities
- 🏘️ **Hyperlocal Delivery**: Neighborhood-based logistics
- 🎤 **Voice Commerce**: Order via voice notes
- 📱 **Mobile Money First**: M-Pesa, Airtel Money, MTN
- 🌐 **Offline Support**: Works on 2G networks

## 🏗️ Architecture

### Monorepo Structure
```
whatsapp-commerce/
├── apps/
│   ├── api/                    # Hono REST API (Cloudflare Workers)
│   ├── vendor-dashboard/       # Next.js vendor portal
│   └── admin/                  # Admin dashboard
├── packages/
│   ├── database/              # PostgreSQL schema (Drizzle ORM)
│   ├── whatsapp-bot/          # WhatsApp Business API integration
│   ├── ai-assistant/          # Claude-powered shopping assistant
│   ├── payments/              # M-Pesa, Airtel Money integrations
│   └── auth/                  # Better Auth authentication
```

### Tech Stack
- **Backend**: Hono (Cloudflare Workers), PostgreSQL (Neon)
- **Frontend**: Next.js 15, React, Tailwind CSS
- **AI**: Anthropic Claude 3.5 Sonnet
- **Messaging**: WhatsApp Business API
- **Payments**: M-Pesa, Airtel Money, Paystack
- **Auth**: Better Auth with Google OAuth

## 💼 Business Model

1. **Commission**: 2-5% per transaction
2. **Subscription Tiers**:
   - **Free**: 10 products, basic features
   - **Pro** (KES 1,000/month): Unlimited products, analytics
   - **Enterprise** (KES 5,000/month): API access, white-label
3. **Payment Processing**: 1% fee
4. **Premium Features**: Promoted listings, advanced analytics

## 🎯 Target Markets

### Primary
- Kenya (M-Pesa stronghold)
- Uganda, Tanzania, Rwanda (East Africa)
- Nigeria, Ghana (West Africa expansion)

### Users
- Small shop owners (mama mboga, kiosks)
- Fashion designers and tailors
- Food vendors and restaurants
- Farmers selling produce
- Artisans and crafters

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- pnpm 9+
- PostgreSQL (Neon)
- WhatsApp Business API account
- M-Pesa API credentials

### Installation
```bash
# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env

# Run database migrations
pnpm db:migrate

# Start development servers
pnpm dev
```

### Environment Variables
```env
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...
WHATSAPP_API_KEY=...
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
AIRTEL_MONEY_API_KEY=...
```

## 📊 Database Schema

**13 Core Tables**:
- `vendors` - Seller accounts
- `products` - Product catalog
- `categories` - Product categories
- `inventory` - Stock management
- `customers` - Buyer profiles
- `orders` - Order management
- `order_items` - Line items
- `payments` - Payment tracking
- `deliveries` - Delivery status
- `reviews` - Product/seller reviews
- `chama_orders` - Group buying
- `promotions` - Discounts/coupons
- `analytics` - Sales metrics

## 🔒 Security & Privacy

- End-to-end encryption for messages
- PCI-DSS compliant payment processing
- GDPR/NDPR data protection
- Secure mobile money integrations
- Fraud detection and prevention

## 📈 Roadmap

### Phase 1 (MVP) ✅
- WhatsApp bot for browsing/ordering
- M-Pesa payment integration
- Vendor dashboard
- Order tracking
- Basic analytics

### Phase 2
- Group buying (Chama orders)
- Voice commerce
- Multi-country expansion
- Advanced AI recommendations

### Phase 3
- Delivery partner network
- Installment payments
- Vendor financing
- API for third-party integrations

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 License

MIT License - see [LICENSE](LICENSE)

## 🌟 Impact

**Empowering 10 million African entrepreneurs to thrive in the digital economy**

---

Built with 💜 for Africa
