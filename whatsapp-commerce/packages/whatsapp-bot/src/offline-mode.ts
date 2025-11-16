/**
 * Offline Mode - Catalog Downloads for Low Connectivity
 * Generate PDF catalogs and SMS-based ordering
 */

export interface ProductCatalog {
  vendorId: string;
  vendorName: string;
  products: Array<{
    id: string;
    name: string;
    price: number;
    description: string;
    stock: number;
  }>;
  generatedAt: Date;
}

export interface SMSOrder {
  phoneNumber: string;
  orderCode: string; // e.g., "P001*2" (Product 001, quantity 2)
  parsedOrder: {
    productId: string;
    quantity: number;
  };
}

export class OfflineModeService {
  /**
   * Generate catalog download link
   * In production, this would generate a PDF using a library like PDFKit
   */
  async generateCatalogPDF(catalog: ProductCatalog): Promise<string> {
    // Simplified version - in production use PDFKit or similar
    const catalogText = this.generateCatalogText(catalog);

    // In real implementation:
    // - Generate PDF with product images
    // - Upload to cloud storage (Cloudflare R2, S3)
    // - Return download URL

    // For now, return a simple text format
    return catalogText;
  }

  /**
   * Generate text-based catalog for WhatsApp
   */
  generateCatalogText(catalog: ProductCatalog): string {
    const header = `
🛍️ *${catalog.vendorName.toUpperCase()}* 🛍️
Product Catalog - ${catalog.generatedAt.toLocaleDateString()}

📱 *Order via SMS*: Send product code + quantity
Example: P001*2 (Product 001, qty 2)

────────────────────────`;

    const products = catalog.products
      .map(
        (p, index) => `
*${index + 1}. ${p.name}*
Code: P${String(index + 1).padStart(3, '0')}
💰 KES ${p.price.toLocaleString()}
📦 Stock: ${p.stock}
📝 ${p.description}
`
      )
      .join('\n────────────────────────\n');

    const footer = `
────────────────────────
*How to Order:*
📱 SMS: P001*2 (Product code*quantity)
💬 WhatsApp: Send code or name
📞 Call: +254 XXX XXX XXX

✅ M-Pesa | 💵 Cash on Delivery
🚚 Free delivery in Nairobi!
`;

    return header + products + footer;
  }

  /**
   * Parse SMS order code
   */
  parseSMSOrder(message: string, phoneNumber: string): SMSOrder | null {
    // Format: P001*2 or P001*2,P002*1 (multiple products)
    const orderPattern = /P(\d{3})\*(\d+)/gi;
    const matches = [...message.matchAll(orderPattern)];

    if (matches.length === 0) {
      return null;
    }

    // For simplicity, handle first product only
    const [, productCode, quantity] = matches[0];

    return {
      phoneNumber,
      orderCode: message.trim(),
      parsedOrder: {
        productId: productCode,
        quantity: parseInt(quantity),
      },
    };
  }

  /**
   * Generate SMS confirmation message
   */
  generateSMSConfirmation(
    orderId: string,
    productName: string,
    quantity: number,
    total: number
  ): string {
    return `✅ Order confirmed!
Order: #${orderId}
${quantity}x ${productName}
Total: KES ${total.toLocaleString()}

Pay via M-Pesa:
Paybill 400200
Acc: ${orderId}

Track: wa.me/254XXX/track/${orderId}`;
  }

  /**
   * Generate QR code for quick ordering
   */
  generateProductQRCode(productId: string, vendorId: string): string {
    // Returns URL that can be converted to QR code
    // When scanned, opens WhatsApp with pre-filled message
    const message = encodeURIComponent(`I want to order product ${productId}`);
    return `https://wa.me/254XXX?text=${message}`;
  }

  /**
   * Generate USSD-style menu (future feature for feature phones)
   */
  generateUSSDMenu(vendorId: string): string {
    return `*Biashara - Shop Menu*
1. View Products
2. My Orders
3. Track Order
4. Help

Reply with option number`;
  }

  /**
   * Export catalog as CSV for offline reference
   */
  generateCSV(catalog: ProductCatalog): string {
    const header = 'Code,Name,Price (KES),Stock,Description\n';
    const rows = catalog.products
      .map(
        (p, i) =>
          `P${String(i + 1).padStart(3, '0')},${p.name},${p.price},${p.stock},"${p.description}"`
      )
      .join('\n');

    return header + rows;
  }

  /**
   * Generate simple HTML catalog for email/browser
   */
  generateHTMLCatalog(catalog: ProductCatalog): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>${catalog.vendorName} - Product Catalog</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .product { border: 1px solid #ddd; padding: 15px; margin: 10px 0; }
    .price { font-size: 1.2em; color: #28a745; font-weight: bold; }
  </style>
</head>
<body>
  <h1>${catalog.vendorName}</h1>
  <p>Catalog generated: ${catalog.generatedAt.toLocaleString()}</p>

  ${catalog.products
    .map(
      (p, i) => `
    <div class="product">
      <h3>${i + 1}. ${p.name}</h3>
      <p class="price">KES ${p.price.toLocaleString()}</p>
      <p>${p.description}</p>
      <p>Stock: ${p.stock} | Code: P${String(i + 1).padStart(3, '0')}</p>
    </div>
  `
    )
    .join('')}

  <hr>
  <p><strong>Order via WhatsApp:</strong> wa.me/254XXX</p>
  <p><strong>Order via SMS:</strong> Send code + quantity (e.g., P001*2)</p>
</body>
</html>`;
  }
}
