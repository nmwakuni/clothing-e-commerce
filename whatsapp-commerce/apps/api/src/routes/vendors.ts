import { Hono } from 'hono';
import { z } from 'zod';
import { createDb, vendors } from '@biashara/database';
import { eq, desc } from 'drizzle-orm';

export const vendorsRouter = new Hono();

const vendorSchema = z.object({
  businessName: z.string().min(1),
  ownerName: z.string().min(1),
  phoneNumber: z.string().min(10),
  email: z.string().email().optional(),
  description: z.string().optional(),
  category: z.enum(['fashion', 'electronics', 'food', 'produce', 'beauty', 'home', 'crafts', 'other']),
  county: z.string().optional(),
  town: z.string().optional(),
  address: z.string().optional(),
});

// GET /api/vendors - List all vendors
vendorsRouter.get('/', async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);

    const allVendors = await db
      .select()
      .from(vendors)
      .where(eq(vendors.isActive, true))
      .orderBy(desc(vendors.createdAt))
      .limit(50);

    return c.json({ vendors: allVendors });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return c.json({ error: 'Failed to fetch vendors' }, 500);
  }
});

// GET /api/vendors/:id - Get vendor details
vendorsRouter.get('/:id', async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const id = c.req.param('id');

    const [vendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.id, id))
      .limit(1);

    if (!vendor) {
      return c.json({ error: 'Vendor not found' }, 404);
    }

    return c.json({ vendor });
  } catch (error) {
    console.error('Error fetching vendor:', error);
    return c.json({ error: 'Failed to fetch vendor' }, 500);
  }
});

// POST /api/vendors - Register new vendor
vendorsRouter.post('/', async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const body = await c.req.json();
    const data = vendorSchema.parse(body);

    const [vendor] = await db.insert(vendors).values(data).returning();

    return c.json({ vendor }, 201);
  } catch (error) {
    console.error('Error creating vendor:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid vendor data', details: error.errors }, 400);
    }
    return c.json({ error: 'Failed to create vendor' }, 500);
  }
});
