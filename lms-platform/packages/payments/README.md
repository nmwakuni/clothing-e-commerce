# @lms/payments

Payment processing package for the LMS Platform, with M-Pesa integration for Kenya.

## Features

- 💳 **M-Pesa STK Push** (Lipa Na M-Pesa Online)
- 📱 **Phone number validation** and formatting
- 🔄 **Transaction status queries**
- 📊 **Callback parsing** for payment confirmations
- 🔐 **OAuth token management** (auto-refresh)
- ✅ **Amount validation** (M-Pesa limits)
- 🌍 **Sandbox & Production** environments

## Quick Start

```typescript
import { createMPesaService } from '@lms/payments';

const mpesa = createMPesaService({
  consumerKey: process.env.MPESA_CONSUMER_KEY!,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET!,
  environment: 'sandbox', // or 'production'
  shortcode: '174379', // Your business shortcode
  passkey: process.env.MPESA_PASSKEY!,
  callbackUrl: 'https://yourdomain.com/api/payments/mpesa/callback',
});
```

## Initiating Payment (STK Push)

```typescript
const response = await mpesa.stkPush({
  phoneNumber: '0712345678', // or '254712345678' or '+254712345678'
  amount: 2000, // KES 2,000
  accountReference: 'Course_123', // Max 12 characters
  transactionDesc: 'Web Dev Course', // Max 13 characters
});

console.log('Checkout Request ID:', response.CheckoutRequestID);
console.log('Customer Message:', response.CustomerMessage);
// "A payment request has been sent to your phone. Please enter your M-Pesa PIN to complete."
```

## Handling Payment Callback

M-Pesa will send a callback to your `callbackUrl` when the payment is completed or cancelled.

```typescript
import { MPesaService, MPesaCallback } from '@lms/payments';

// In your API route (e.g., POST /api/payments/mpesa/callback)
export async function handleCallback(request: Request) {
  const callback: MPesaCallback = await request.json();

  // Parse the callback
  const result = MPesaService.parseCallback(callback);

  if (result.success) {
    console.log('Payment successful!');
    console.log('Amount:', result.amount);
    console.log('Receipt:', result.mpesaReceiptNumber);
    console.log('Phone:', result.phoneNumber);
    console.log('Date:', result.transactionDate);

    // Update your database
    // await db.transactions.update({
    //   where: { checkoutRequestId: result.checkoutRequestId },
    //   data: {
    //     status: 'completed',
    //     mpesaReceiptNumber: result.mpesaReceiptNumber,
    //     completedAt: new Date(),
    //   },
    // });

    // Notify user (WhatsApp, email)
    // await notifyPaymentSuccess(result);
  } else {
    console.log('Payment failed:', result.resultDesc);
    // Common failure reasons:
    // - User cancelled
    // - Insufficient balance
    // - Wrong PIN entered too many times
    // - Network timeout

    // Update your database
    // await db.transactions.update({
    //   where: { checkoutRequestId: result.checkoutRequestId },
    //   data: {
    //     status: 'failed',
    //     failedReason: result.resultDesc,
    //   },
    // });

    // Notify user
    // await notifyPaymentFailed(result);
  }

  // Always return 200 to acknowledge receipt
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
```

## Querying Transaction Status

```typescript
// Query using the CheckoutRequestID from STK Push response
const status = await mpesa.queryTransaction(checkoutRequestID);

console.log('Result Code:', status.ResultCode);
console.log('Result Description:', status.ResultDesc);

if (status.ResultCode === '0') {
  console.log('Payment completed');
} else if (status.ResultCode === '1032') {
  console.log('Payment cancelled by user');
} else if (status.ResultCode === '1037') {
  console.log('Timeout - user did not enter PIN');
}
```

## Complete Flow Example

```typescript
import { createMPesaService, MPesaService } from '@lms/payments';
import { db } from '@lms/database';

// 1. User wants to buy a course
async function purchaseCourse(userId: string, courseId: string, phoneNumber: string) {
  const course = await db.courses.findUnique({ where: { id: courseId } });

  if (!course) {
    throw new Error('Course not found');
  }

  // Create pending transaction
  const transaction = await db.transactions.create({
    data: {
      userId,
      type: 'course_purchase',
      amountKes: course.priceKes,
      provider: 'mpesa',
      phoneNumber,
      status: 'pending',
      courseId,
    },
  });

  // Initiate M-Pesa payment
  const mpesa = createMPesaService({
    consumerKey: process.env.MPESA_CONSUMER_KEY!,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET!,
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
    shortcode: process.env.MPESA_SHORTCODE!,
    passkey: process.env.MPESA_PASSKEY!,
    callbackUrl: `${process.env.API_URL}/api/payments/mpesa/callback`,
  });

  const response = await mpesa.stkPush({
    phoneNumber,
    amount: course.priceKes,
    accountReference: `COURSE_${courseId.slice(0, 6)}`,
    transactionDesc: course.title.slice(0, 13),
  });

  // Update transaction with checkout request ID
  await db.transactions.update({
    where: { id: transaction.id },
    data: {
      providerTransactionId: response.CheckoutRequestID,
      status: 'processing',
    },
  });

  return {
    transactionId: transaction.id,
    checkoutRequestId: response.CheckoutRequestID,
    customerMessage: response.CustomerMessage,
  };
}

// 2. M-Pesa callback handler
async function handleMPesaCallback(callback: any) {
  const result = MPesaService.parseCallback(callback);

  // Find transaction
  const transaction = await db.transactions.findFirst({
    where: { providerTransactionId: result.checkoutRequestId },
  });

  if (!transaction) {
    console.error('Transaction not found:', result.checkoutRequestId);
    return;
  }

  if (result.success) {
    // Update transaction
    await db.transactions.update({
      where: { id: transaction.id },
      data: {
        status: 'completed',
        mpesaReceiptNumber: result.mpesaReceiptNumber,
        completedAt: new Date(),
      },
    });

    // Enroll user in course
    await db.enrollments.create({
      data: {
        userId: transaction.userId,
        courseId: transaction.courseId!,
        paymentType: 'one_time',
        amountPaidKes: result.amount!,
        transactionId: transaction.id,
      },
    });

    // Send confirmation (WhatsApp, email)
    // await sendPaymentConfirmation(transaction.userId, transaction.courseId!);
  } else {
    // Update transaction as failed
    await db.transactions.update({
      where: { id: transaction.id },
      data: {
        status: 'failed',
        metadata: { failureReason: result.resultDesc },
      },
    });

    // Notify user of failure
    // await sendPaymentFailedNotification(transaction.userId);
  }
}
```

## M-Pesa Result Codes

| Code | Description |
|------|-------------|
| 0 | Success |
| 1 | Insufficient balance |
| 1032 | Cancelled by user |
| 1037 | Timeout (user didn't enter PIN) |
| 2001 | Invalid PIN |
| 1 | System error |

## Phone Number Formats

All these formats work:
- `0712345678` → Converted to `254712345678`
- `+254712345678` → Converted to `254712345678`
- `254712345678` → Used as-is ✅
- `712345678` → Converted to `254712345678`

## Amount Limits

M-Pesa STK Push limits:
- **Minimum**: KES 1
- **Maximum**: KES 150,000
- **Must be integer** (no decimals)

```typescript
import { validateAmount } from '@lms/payments';

if (!validateAmount(amount)) {
  throw new Error('Amount must be between KES 1 and KES 150,000');
}
```

## Testing

### Sandbox Environment

Use these test credentials from [Safaricom Developer Portal](https://developer.safaricom.co.ke/):

1. Create an app
2. Get Consumer Key & Consumer Secret
3. Use test shortcode: `174379`
4. Get test passkey from app credentials

### Test Phone Numbers

In sandbox, use:
- `254708374149` - Will simulate successful payment
- `254700000000` - Will simulate failed payment

## Environment Variables

```bash
# M-Pesa Configuration
MPESA_CONSUMER_KEY=your-consumer-key
MPESA_CONSUMER_SECRET=your-consumer-secret
MPESA_SHORTCODE=174379  # Your business shortcode
MPESA_PASSKEY=your-passkey
MPESA_ENVIRONMENT=sandbox  # or production

# Callback URL
API_URL=https://yourdomain.com
```

## Production Checklist

Before going live:

- [ ] Get production credentials from Safaricom
- [ ] Switch `environment` to `'production'`
- [ ] Update shortcode to your live paybill/till
- [ ] Verify callback URL is publicly accessible (HTTPS)
- [ ] Test with small real amounts first
- [ ] Monitor transaction logs
- [ ] Set up error alerts
- [ ] Implement retry logic for failed callbacks

## Security Best Practices

1. **Never expose credentials** in client-side code
2. **Validate callbacks** - ensure they came from Safaricom
3. **Implement idempotency** - handle duplicate callbacks
4. **Log everything** - transactions, callbacks, errors
5. **Use HTTPS** - callback URL must be secure
6. **Whitelist Safaricom IPs** (optional)
   - Production: `196.201.214.0/24`

## Common Issues

### "Invalid Access Token"
- Token expired - automatically handled by the service
- Check consumer key/secret are correct

### "Timeout - User did not enter PIN"
- User has 60 seconds to enter PIN
- Implement retry option in UI

### "Callback not received"
- Check callback URL is publicly accessible
- Verify firewall allows Safaricom IPs
- Check server logs for errors

### "Wrong PIN entered multiple times"
- User must wait 24 hours or contact Safaricom
- Inform user to try again tomorrow

## Development

```bash
# Type checking
pnpm type-check
```

## License

MIT
