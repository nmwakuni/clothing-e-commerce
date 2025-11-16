import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PesapalService } from '@mteja/payments';
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
    const { email, phoneNumber, plan, billingPeriod, currency = 'KES' } = body;

    if (!email || !phoneNumber || !plan || !billingPeriod) {
      return NextResponse.json(
        { error: 'Email, phone number, plan, and billing period are required' },
        { status: 400 }
      );
    }

    const db = createDb(process.env.DATABASE_URL!);
    const [user] = await db.select().from(users).where(eq(users.clerkId, userId));

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get plan pricing
    const pricing = getPlanPricing(plan, currency, billingPeriod);

    // Initialize Pesapal service
    const pesapal = new PesapalService({
      consumerKey: process.env.PESAPAL_CONSUMER_KEY!,
      consumerSecret: process.env.PESAPAL_CONSUMER_SECRET!,
      environment: (process.env.PESAPAL_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
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
        paymentMethod: 'pesapal',
        paymentProvider: 'pesapal',
        phoneNumber,
        email,
        status: 'pending',
      })
      .returning();

    // Submit order to Pesapal
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/pesapal/callback`;
    const response = await pesapal.submitOrder({
      amount: pricing.amount,
      currency: pricing.currency,
      description: `Mteja ${pricing.plan} subscription - ${billingPeriod}`,
      callbackUrl,
      notificationId: process.env.PESAPAL_IPN_ID!,
      billingAddress: {
        email,
        phone: phoneNumber,
        firstName: user.name?.split(' ')[0],
        lastName: user.name?.split(' ').slice(1).join(' '),
      },
    });

    if (response.error) {
      await db
        .update(payments)
        .set({
          status: 'failed',
          failureReason: response.error,
          updatedAt: new Date(),
        })
        .where(eq(payments.id, payment.id));

      return NextResponse.json({ error: response.error }, { status: 400 });
    }

    // Update payment with Pesapal IDs
    await db
      .update(payments)
      .set({
        pesapalOrderId: response.merchantReference,
        pesapalTrackingId: response.orderTrackingId,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, payment.id));

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      redirectUrl: response.redirectUrl,
      orderTrackingId: response.orderTrackingId,
    });
  } catch (error) {
    console.error('Pesapal initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Pesapal payment' },
      { status: 500 }
    );
  }
}
