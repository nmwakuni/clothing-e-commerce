import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { MpesaService } from '@mteja/payments';
import { getPlanPricing } from '@mteja/payments';
import { createDb } from '@mteja/database';
import { payments, users } from '@mteja/database';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { phoneNumber, plan, billingPeriod } = body;

    if (!phoneNumber || !plan || !billingPeriod) {
      return NextResponse.json(
        { error: 'Phone number, plan, and billing period are required' },
        { status: 400 }
      );
    }

    const db = createDb(process.env.DATABASE_URL!);
    const [user] = await db.select().from(users).where(eq(users.clerkId, userId));

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get plan pricing
    const pricing = getPlanPricing(plan, 'KES', billingPeriod);

    // Initialize M-Pesa service
    const mpesa = new MpesaService({
      consumerKey: process.env.MPESA_CONSUMER_KEY!,
      consumerSecret: process.env.MPESA_CONSUMER_SECRET!,
      businessShortCode: process.env.MPESA_BUSINESS_SHORT_CODE!,
      passkey: process.env.MPESA_PASSKEY!,
      environment: (process.env.MPESA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
    });

    // Create payment record
    const [payment] = await db
      .insert(payments)
      .values({
        userId: user.id,
        amount: String(pricing.amount),
        currency: pricing.currency,
        plan,
        billingPeriod,
        paymentMethod: 'mpesa',
        paymentProvider: 'mpesa',
        phoneNumber,
        status: 'pending',
      })
      .returning();

    // Initiate STK push
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/mpesa/callback`;
    const response = await mpesa.initiateSTKPush({
      phoneNumber,
      amount: pricing.amount,
      accountReference: `MTEJA-${payment.id}`,
      transactionDesc: `Mteja ${pricing.plan} subscription`,
      callbackUrl,
    });

    // Update payment with checkout request ID
    await db
      .update(payments)
      .set({
        checkoutRequestId: response.checkoutRequestID,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, payment.id));

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      checkoutRequestId: response.checkoutRequestID,
      message: response.customerMessage,
    });
  } catch (error) {
    console.error('M-Pesa initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate M-Pesa payment' },
      { status: 500 }
    );
  }
}
