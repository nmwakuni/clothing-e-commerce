import { Hono } from 'hono';
import { MpesaService } from '@biashara/payments';
import { createDb, payments, orders } from '@biashara/database';
import { eq } from 'drizzle-orm';

export const paymentsRouter = new Hono();

// POST /api/payments/mpesa/initiate - Initiate M-Pesa payment
paymentsRouter.post('/mpesa/initiate', async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const { orderId, phoneNumber } = await c.req.json();

    // Get order
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    const mpesa = new MpesaService({
      consumerKey: c.env.MPESA_CONSUMER_KEY,
      consumerSecret: c.env.MPESA_CONSUMER_SECRET,
      businessShortCode: c.env.MPESA_BUSINESS_SHORT_CODE,
      passkey: c.env.MPESA_PASSKEY,
      environment: 'sandbox',
    });

    const response = await mpesa.initiatePayment({
      phoneNumber,
      amount: parseFloat(order.total),
      accountReference: order.orderNumber,
      transactionDesc: `Payment for ${order.orderNumber}`,
    });

    // Save payment record
    await db.insert(payments).values({
      orderId: order.id,
      customerId: order.customerId,
      amount: order.total,
      paymentMethod: 'mpesa',
      provider: 'safaricom',
      status: 'pending',
      checkoutRequestId: response.checkoutRequestId,
      merchantRequestId: response.merchantRequestId,
      phoneNumber,
    });

    return c.json({ success: true, response });
  } catch (error) {
    console.error('Error initiating M-Pesa payment:', error);
    return c.json({ error: 'Failed to initiate payment' }, 500);
  }
});

// POST /api/payments/mpesa/callback - M-Pesa callback
paymentsRouter.post('/mpesa/callback', async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const body = await c.req.json();

    const mpesa = new MpesaService({
      consumerKey: c.env.MPESA_CONSUMER_KEY,
      consumerSecret: c.env.MPESA_CONSUMER_SECRET,
      businessShortCode: c.env.MPESA_BUSINESS_SHORT_CODE,
      passkey: c.env.MPESA_PASSKEY,
      environment: 'sandbox',
    });

    const callbackData = mpesa.parseCallback(body);

    // Update payment
    await db
      .update(payments)
      .set({
        status: callbackData.resultCode === 0 ? 'completed' : 'failed',
        mpesaReceiptNumber: callbackData.mpesaReceiptNumber,
        externalReference: callbackData.mpesaReceiptNumber,
        providerResponse: body,
        completedAt: callbackData.resultCode === 0 ? new Date() : undefined,
        failedAt: callbackData.resultCode !== 0 ? new Date() : undefined,
      })
      .where(eq(payments.checkoutRequestId, callbackData.checkoutRequestId));

    // If successful, update order
    if (callbackData.resultCode === 0) {
      const payment = await db
        .select()
        .from(payments)
        .where(eq(payments.checkoutRequestId, callbackData.checkoutRequestId))
        .limit(1);

      if (payment.length > 0) {
        await db
          .update(orders)
          .set({
            paymentStatus: 'paid',
            status: 'confirmed',
            confirmedAt: new Date(),
          })
          .where(eq(orders.id, payment[0].orderId));
      }
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    return c.json({ error: 'Failed to process callback' }, 500);
  }
});
