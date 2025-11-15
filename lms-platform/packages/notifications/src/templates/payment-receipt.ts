export interface PaymentReceiptEmailData {
  userName: string;
  transactionId: string;
  amount: number;
  currency: string;
  courseName: string;
  paymentDate: string;
  paymentMethod: string;
}

export function generatePaymentReceiptEmail(data: PaymentReceiptEmailData): string {
  const formattedAmount = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: data.currency,
    minimumFractionDigits: 0,
  }).format(data.amount);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 40px 20px; border: 1px solid #e5e7eb; }
    .receipt { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .receipt-row:last-child { border-bottom: none; }
    .total { font-size: 24px; font-weight: bold; color: #22c55e; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💳 Payment Received</h1>
    </div>
    <div class="content">
      <h2>Hi ${data.userName},</h2>
      <p>Thank you for your payment! Here's your receipt:</p>

      <div class="receipt">
        <div class="receipt-row">
          <span>Transaction ID</span>
          <strong>${data.transactionId}</strong>
        </div>
        <div class="receipt-row">
          <span>Course</span>
          <strong>${data.courseName}</strong>
        </div>
        <div class="receipt-row">
          <span>Payment Method</span>
          <strong>${data.paymentMethod}</strong>
        </div>
        <div class="receipt-row">
          <span>Date</span>
          <strong>${data.paymentDate}</strong>
        </div>
        <div class="receipt-row">
          <span>Amount Paid</span>
          <span class="total">${formattedAmount}</span>
        </div>
      </div>

      <p>Your enrollment is now active. Start learning immediately!</p>

      <p>If you have any questions about this transaction, please don't hesitate to contact us.</p>

      <p>Thank you for choosing SkillHub Africa!</p>

      <p>Best regards,<br>The SkillHub Africa Team</p>
    </div>
    <div class="footer">
      <p>SkillHub Africa | <a href="https://skillhub.co.ke">skillhub.co.ke</a></p>
      <p>This is an automated receipt. Please save it for your records.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
