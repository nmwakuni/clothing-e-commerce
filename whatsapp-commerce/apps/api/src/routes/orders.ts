import { Hono } from 'hono';
import { createDb, orders, orderItems } from '@biashara/database';
import { eq, desc } from 'drizzle-orm';

export const ordersRouter = new Hono();

// GET /api/orders/:customerId - Get customer orders
ordersRouter.get('/:customerId', async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const customerId = c.req.param('customerId');

    const customerOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.customerId, customerId))
      .orderBy(desc(orders.createdAt));

    return c.json({ orders: customerOrders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return c.json({ error: 'Failed to fetch orders' }, 500);
  }
});

// GET /api/orders/details/:orderId - Get order details
ordersRouter.get('/details/:orderId', async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const orderId = c.req.param('orderId');

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    return c.json({ order, items });
  } catch (error) {
    console.error('Error fetching order details:', error);
    return c.json({ error: 'Failed to fetch order details' }, 500);
  }
});

// PATCH /api/orders/:orderId/status - Update order status
ordersRouter.patch('/:orderId/status', async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const orderId = c.req.param('orderId');
    const { status } = await c.req.json();

    await db
      .update(orders)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    return c.json({ success: true });
  } catch (error) {
    console.error('Error updating order status:', error);
    return c.json({ error: 'Failed to update order status' }, 500);
  }
});
