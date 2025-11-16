import { NextRequest, NextResponse } from 'next/server';
import { MpesaService } from '@mteja/payments';
import { createDb } from '@mteja/database';
import { payments, users, subscriptions } from '@mteja/database';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Initialize M-Pesa service
    const mpesa = new MpesaService({
      consumerKey: process.env.MPESA_CONSUMER_KEY!,
      consumerSecret: process.env.MPESA_CONSUMER_SECRET!,
      businessShortCode: process.env.MPESA_BUSINESS_SHORT_CODE!,
      passkey: process.env.MPESA_PASSKEY!,
      environment: (process.env.MPESA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
    });

    // Parse callback
    const result = mpesa.parseCallback(body);

    const db = createDb(process.env.DATABASE_URL!);

    // Find payment by checkout request ID
    const checkoutRequestId = body.Body.stkCallback.CheckoutRequestID;
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.checkoutRequestId, checkoutRequestId));

    if (!payment) {
      console.error('Payment not found for checkout request:', checkoutRequestId);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (result.success) {
      // Update payment as completed
      await db
        .update(payments)
        .set({
          status: 'completed',
          receiptNumber: result.mpesaReceiptNumber,
          transactionId: result.mpesaReceiptNumber,
          paidAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(payments.id, payment.id));

      // Create or update subscription
      const currentPeriodStart = new Date();
      const currentPeriodEnd = new Date();
      if (payment.billingPeriod === 'monthly') {
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
      } else {
        currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
      }

      await db.insert(subscriptions).values({
        userId: payment.userId,
        plan: payment.plan,
        status: 'active',
        billingPeriod: payment.billingPeriod,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: 'mpesa',
        currentPeriodStart,
        currentPeriodEnd,
        autoRenew: false,
      });

      // Update user plan
      await db
        .update(users)
        .set({
          plan: payment.plan,
          subscriptionStatus: 'active',
          currentPeriodEnd,
          updatedAt: new Date(),
        })
        .where(eq(users.id, payment.userId));
    } else {
      // Update payment as failed
      await db
        .update(payments)
        .set({
          status: 'failed',
          failureReason: result.errorMessage,
          updatedAt: new Date(),
        })
        .where(eq(payments.id, payment.id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    return NextResponse.json({ error: 'Callback processing failed' }, { status: 500 });
  }
}
