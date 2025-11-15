import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createMPesaService } from '@lms/payments';
import { createAuthService } from '@lms/auth';
import { db } from '@lms/database';
import { transactions, enrollments, courses, users } from '@lms/database/schema';
import { eq, and } from 'drizzle-orm';
import { PaymentMethod, PaymentStatus } from '@lms/payments';

type Bindings = {
  MPESA_CONSUMER_KEY: string;
  MPESA_CONSUMER_SECRET: string;
  MPESA_ENVIRONMENT: 'sandbox' | 'production';
  MPESA_SHORTCODE: string;
  MPESA_PASSKEY: string;
  MPESA_CALLBACK_URL: string;
  JWT_SECRET: string;
};

export const paymentsRouter = new Hono<{ Bindings: Bindings }>();

/**
 * POST /api/payments/mpesa/stk-push
 * Initiate M-Pesa STK Push payment
 */
const stkPushSchema = z.object({
  phoneNumber: z.string(),
  amount: z.number().min(1).max(150000),
  accountReference: z.string(),
  transactionDesc: z.string(),
});

paymentsRouter.post('/mpesa/stk-push', zValidator('json', stkPushSchema), async (c) => {
  try {
    // Verify authentication
    const auth = createAuthService({ jwtSecret: c.env.JWT_SECRET });
    const authHeader = c.req.header('authorization');

    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = auth.extractTokenFromHeader(authHeader);
    const user = await auth.verifyToken(token);

    if (!user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const body = c.req.valid('json');

    // Initialize M-Pesa service
    const mpesa = createMPesaService({
      consumerKey: c.env.MPESA_CONSUMER_KEY,
      consumerSecret: c.env.MPESA_CONSUMER_SECRET,
      environment: c.env.MPESA_ENVIRONMENT,
      shortcode: c.env.MPESA_SHORTCODE,
      passkey: c.env.MPESA_PASSKEY,
      callbackUrl: c.env.MPESA_CALLBACK_URL,
    });

    // Initiate STK Push
    const response = await mpesa.stkPush({
      phoneNumber: body.phoneNumber,
      amount: body.amount,
      accountReference: body.accountReference,
      transactionDesc: body.transactionDesc,
    });

    // Create transaction record
    await db.insert(transactions).values({
      userId: user.userId,
      amount: body.amount,
      currency: 'KES',
      method: PaymentMethod.MPESA,
      status: PaymentStatus.PROCESSING,
      provider: 'safaricom',
      providerReference: response.CheckoutRequestID,
      metadata: {
        MerchantRequestID: response.MerchantRequestID,
        CheckoutRequestID: response.CheckoutRequestID,
        phoneNumber: body.phoneNumber,
        accountReference: body.accountReference,
      },
    });

    return c.json({
      success: true,
      message: response.CustomerMessage,
      CheckoutRequestID: response.CheckoutRequestID,
      MerchantRequestID: response.MerchantRequestID,
    });
  } catch (error) {
    console.error('Error initiating M-Pesa payment:', error);
    return c.json(
      {
        error: 'Failed to initiate payment. Please try again.',
      },
      500
    );
  }
});

/**
 * GET /api/payments/mpesa/status
 * Check M-Pesa payment status
 */
paymentsRouter.get('/mpesa/status', async (c) => {
  try {
    const checkoutRequestId = c.req.query('checkoutRequestId');

    if (!checkoutRequestId) {
      return c.json({ error: 'CheckoutRequestID is required' }, 400);
    }

    // Verify authentication
    const auth = createAuthService({ jwtSecret: c.env.JWT_SECRET });
    const authHeader = c.req.header('authorization');

    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = auth.extractTokenFromHeader(authHeader);
    const user = await auth.verifyToken(token);

    if (!user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    // Get transaction from database
    const transaction = await db.query.transactions.findFirst({
      where: eq(transactions.providerReference, checkoutRequestId),
    });

    if (!transaction) {
      return c.json({ error: 'Transaction not found' }, 404);
    }

    // If already completed or failed, return cached status
    if (transaction.status === PaymentStatus.COMPLETED || transaction.status === PaymentStatus.FAILED) {
      return c.json({
        status: transaction.status,
        mpesaReceiptNumber: transaction.providerTransactionId,
        amount: transaction.amount,
      });
    }

    // Query M-Pesa for latest status
    const mpesa = createMPesaService({
      consumerKey: c.env.MPESA_CONSUMER_KEY,
      consumerSecret: c.env.MPESA_CONSUMER_SECRET,
      environment: c.env.MPESA_ENVIRONMENT,
      shortcode: c.env.MPESA_SHORTCODE,
      passkey: c.env.MPESA_PASSKEY,
      callbackUrl: c.env.MPESA_CALLBACK_URL,
    });

    const statusResponse = await mpesa.queryTransaction(checkoutRequestId);

    // Update transaction based on status
    if (statusResponse.ResultCode === '0') {
      // Success
      await db
        .update(transactions)
        .set({
          status: PaymentStatus.COMPLETED,
          completedAt: new Date(),
        })
        .where(eq(transactions.id, transaction.id));

      return c.json({
        status: 'completed',
        mpesaReceiptNumber: transaction.providerTransactionId,
        amount: transaction.amount,
      });
    } else if (statusResponse.ResultCode !== '1037') {
      // 1037 = timeout (still pending), any other code = failed
      await db
        .update(transactions)
        .set({
          status: PaymentStatus.FAILED,
          failedReason: statusResponse.ResultDesc,
        })
        .where(eq(transactions.id, transaction.id));

      return c.json({
        status: 'failed',
        error: statusResponse.ResultDesc,
      });
    }

    // Still pending
    return c.json({
      status: 'processing',
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    return c.json({ error: 'Failed to check payment status' }, 500);
  }
});

/**
 * POST /api/payments/mpesa/callback
 * M-Pesa callback endpoint (called by Safaricom)
 */
paymentsRouter.post('/mpesa/callback', async (c) => {
  try {
    const body = await c.req.json();

    console.log('📱 M-Pesa callback received:', JSON.stringify(body, null, 2));

    // Parse callback
    const { MPesaService } = await import('@lms/payments/mpesa');
    const parsed = MPesaService.parseCallback(body);

    // Find transaction
    const transaction = await db.query.transactions.findFirst({
      where: eq(transactions.providerReference, parsed.checkoutRequestId),
    });

    if (!transaction) {
      console.error('Transaction not found for callback:', parsed.checkoutRequestId);
      return c.json({ success: true }); // Still return 200 to Safaricom
    }

    if (parsed.success) {
      // Payment successful
      await db
        .update(transactions)
        .set({
          status: PaymentStatus.COMPLETED,
          providerTransactionId: parsed.mpesaReceiptNumber,
          completedAt: new Date(),
          metadata: {
            ...(transaction.metadata as any),
            mpesaReceiptNumber: parsed.mpesaReceiptNumber,
            transactionDate: parsed.transactionDate,
            phoneNumber: parsed.phoneNumber,
          },
        })
        .where(eq(transactions.id, transaction.id));

      // Extract course ID from account reference
      const courseId = (transaction.metadata as any)?.accountReference;

      if (courseId) {
        // Check if enrollment already exists
        const existingEnrollment = await db.query.enrollments.findFirst({
          where: and(
            eq(enrollments.userId, transaction.userId),
            eq(enrollments.courseId, courseId)
          ),
        });

        if (!existingEnrollment) {
          // Create enrollment
          await db.insert(enrollments).values({
            userId: transaction.userId,
            courseId,
            status: 'active',
          });

          console.log(`✅ Created enrollment: User ${transaction.userId} -> Course ${courseId}`);
        }

        // Update course enrollment count
        await db.execute(`
          UPDATE courses
          SET enrollment_count = enrollment_count + 1
          WHERE id = '${courseId}'
        `);
      }

      console.log(`✅ Payment successful: ${parsed.mpesaReceiptNumber}`);
    } else {
      // Payment failed
      await db
        .update(transactions)
        .set({
          status: PaymentStatus.FAILED,
          failedReason: parsed.resultDesc,
        })
        .where(eq(transactions.id, transaction.id));

      console.log(`❌ Payment failed: ${parsed.resultDesc}`);
    }

    // Always return 200 to Safaricom
    return c.json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error) {
    console.error('❌ Error processing M-Pesa callback:', error);
    // Still return 200 to prevent callback retries
    return c.json({ ResultCode: 0, ResultDesc: 'Success' });
  }
});

/**
 * GET /api/payments/history
 * Get user's payment history (requires auth)
 */
paymentsRouter.get('/history', async (c) => {
  try {
    const auth = createAuthService({ jwtSecret: c.env.JWT_SECRET });
    const authHeader = c.req.header('authorization');

    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = auth.extractTokenFromHeader(authHeader);
    const user = await auth.verifyToken(token);

    if (!user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const userTransactions = await db.query.transactions.findMany({
      where: eq(transactions.userId, user.userId),
      orderBy: (transactions, { desc }) => [desc(transactions.createdAt)],
      limit: 50,
    });

    return c.json({
      transactions: userTransactions,
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return c.json({ error: 'Failed to fetch payment history' }, 500);
  }
});

export { paymentsRouter };
