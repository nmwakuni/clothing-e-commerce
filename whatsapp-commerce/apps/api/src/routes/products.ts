import { Hono } from 'hono';
import { z } from 'zod';
import { createDb, products, vendors } from '@biashara/database';
import { eq, like, and, or, desc } from 'drizzle-orm';

export const productsRouter = new Hono();

const productSchema = z.object({
  vendorId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  categoryId: z.string().uuid().optional(),
  stockQuantity: z.number().int().nonnegative().default(0),
  images: z.array(z.string().url()).optional(),
});

// GET /api/products - Search and list products
productsRouter.get('/', async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);

    const search = c.req.query('search');
    const category = c.req.query('category');
    const minPrice = c.req.query('minPrice');
    const maxPrice = c.req.query('maxPrice');
    const vendorId = c.req.query('vendorId');

    let query = db.select().from(products).where(eq(products.isActive, true));

    if (search) {
      query = query.where(
        or(
          like(products.name, `%${search}%`),
          like(products.description, `%${search}%`)
        )
      ) as any;
    }

    if (vendorId) {
      query = query.where(eq(products.vendorId, vendorId)) as any;
    }

    const allProducts = await query.orderBy(desc(products.createdAt)).limit(50);

    return c.json({ products: allProducts });
  } catch (error) {
    console.error('Error fetching products:', error);
    return c.json({ error: 'Failed to fetch products' }, 500);
  }
});

// GET /api/products/:id - Get product details
productsRouter.get('/:id', async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const id = c.req.param('id');

    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!product.length) {
      return c.json({ error: 'Product not found' }, 404);
    }

    // Get vendor info
    const vendor = await db
      .select()
      .from(vendors)
      .where(eq(vendors.id, product[0].vendorId))
      .limit(1);

    return c.json({
      product: {
        ...product[0],
        vendor: vendor[0],
      },
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return c.json({ error: 'Failed to fetch product' }, 500);
  }
});

// POST /api/products - Create product (vendor only)
productsRouter.post('/', async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const body = await c.req.json();
    const data = productSchema.parse(body);

    const [product] = await db
      .insert(products)
      .values({
        ...data,
        price: data.price.toString(),
      })
      .returning();

    return c.json({ product }, 201);
  } catch (error) {
    console.error('Error creating product:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid product data', details: error.errors }, 400);
    }
    return c.json({ error: 'Failed to create product' }, 500);
  }
});

// PATCH /api/products/:id - Update product
productsRouter.patch('/:id', async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const id = c.req.param('id');
    const body = await c.req.json();

    const updates: any = {};
    if (body.name) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.price) updates.price = body.price.toString();
    if (body.stockQuantity !== undefined) updates.stockQuantity = body.stockQuantity;
    if (body.images) updates.images = body.images;

    updates.updatedAt = new Date();

    await db.update(products).set(updates).where(eq(products.id, id));

    return c.json({ success: true });
  } catch (error) {
    console.error('Error updating product:', error);
    return c.json({ error: 'Failed to update product' }, 500);
  }
});

// DELETE /api/products/:id - Delete product
productsRouter.delete('/:id', async (c) => {
  try {
    const db = createDb(c.env.DATABASE_URL);
    const id = c.req.param('id');

    await db.update(products).set({ isActive: false }).where(eq(products.id, id));

    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return c.json({ error: 'Failed to delete product' }, 500);
  }
});
