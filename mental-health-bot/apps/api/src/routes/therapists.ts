import { Hono } from 'hono';
import { z } from 'zod';
import { db, therapists, users, appointments } from '@nafsi/database';
import { eq, like, or, desc, and } from 'drizzle-orm';

export const therapistsRouter = new Hono();

// Schema for therapist registration
const therapistSchema = z.object({
  userId: z.string().uuid(),
  licenseNumber: z.string().min(1),
  specializations: z.array(z.string()),
  bio: z.string(),
  yearsOfExperience: z.number().min(0),
  education: z.array(z.string()),
  languages: z.array(z.string()),
  sessionRate: z.number().min(0),
});

// GET /api/therapists - Get all verified therapists
therapistsRouter.get('/', async (c) => {
  try {
    const specialization = c.req.query('specialization');
    const language = c.req.query('language');
    const search = c.req.query('search');
    const maxRate = c.req.query('maxRate');

    let query = db
      .select()
      .from(therapists)
      .where(and(eq(therapists.verified, true), eq(therapists.acceptingClients, true)));

    if (search) {
      query = query.where(or(like(therapists.bio, `%${search}%`))) as any;
    }

    const allTherapists = await query.orderBy(desc(therapists.createdAt));

    // Filter by specialization and language (arrays)
    let filtered = allTherapists;

    if (specialization) {
      filtered = filtered.filter((t) =>
        t.specializations?.some((s) => s.toLowerCase().includes(specialization.toLowerCase()))
      );
    }

    if (language) {
      filtered = filtered.filter((t) =>
        t.languages?.some((l) => l.toLowerCase().includes(language.toLowerCase()))
      );
    }

    if (maxRate) {
      filtered = filtered.filter((t) => t.sessionRate <= parseInt(maxRate));
    }

    return c.json({ therapists: filtered });
  } catch (error) {
    console.error('Error fetching therapists:', error);
    return c.json({ error: 'Failed to fetch therapists' }, 500);
  }
});

// GET /api/therapists/:id - Get specific therapist profile
therapistsRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const therapist = await db.select().from(therapists).where(eq(therapists.id, id)).limit(1);

    if (!therapist.length) {
      return c.json({ error: 'Therapist not found' }, 404);
    }

    // Get user info
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, therapist[0].userId))
      .limit(1);

    // Get completed appointments count (as reviews proxy)
    const completedSessions = await db
      .select()
      .from(appointments)
      .where(and(eq(appointments.therapistId, id), eq(appointments.status, 'completed')));

    return c.json({
      therapist: {
        ...therapist[0],
        name: user[0]?.name,
        totalSessions: completedSessions.length,
      },
    });
  } catch (error) {
    console.error('Error fetching therapist:', error);
    return c.json({ error: 'Failed to fetch therapist' }, 500);
  }
});

// POST /api/therapists - Register as a therapist
therapistsRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const data = therapistSchema.parse(body);

    // Check if user already registered as therapist
    const existing = await db
      .select()
      .from(therapists)
      .where(eq(therapists.userId, data.userId))
      .limit(1);

    if (existing.length > 0) {
      return c.json({ error: 'User already registered as therapist' }, 400);
    }

    const [therapist] = await db
      .insert(therapists)
      .values({
        ...data,
        verified: false, // Requires admin verification
        acceptingClients: false,
      })
      .returning();

    return c.json(
      {
        therapist,
        message: 'Application submitted. Verification pending.',
      },
      201
    );
  } catch (error) {
    console.error('Error registering therapist:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid therapist data', details: error.errors }, 400);
    }
    return c.json({ error: 'Failed to register therapist' }, 500);
  }
});

// PATCH /api/therapists/:id - Update therapist profile
therapistsRouter.patch('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    const allowedFields = [
      'bio',
      'specializations',
      'education',
      'languages',
      'sessionRate',
      'acceptingClients',
    ];

    const updates = Object.keys(body)
      .filter((key) => allowedFields.includes(key))
      .reduce(
        (obj, key) => {
          obj[key] = body[key];
          return obj;
        },
        {} as any
      );

    updates.updatedAt = new Date();

    await db.update(therapists).set(updates).where(eq(therapists.id, id));

    return c.json({ success: true, message: 'Profile updated' });
  } catch (error) {
    console.error('Error updating therapist:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// GET /api/therapists/:id/availability - Get therapist availability
therapistsRouter.get('/:id/availability', async (c) => {
  try {
    const id = c.req.param('id');
    const date = c.req.query('date') || new Date().toISOString().split('T')[0];

    // Get all appointments for the date
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const bookedSlots = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.therapistId, id),
          eq(appointments.status, 'scheduled')
          // Note: Would need proper date range filtering with gte/lte
        )
      );

    // Generate available time slots (9 AM - 5 PM, 1-hour slots)
    const allSlots = [];
    for (let hour = 9; hour < 17; hour++) {
      const slotTime = new Date(startDate);
      slotTime.setHours(hour, 0, 0, 0);
      allSlots.push(slotTime.toISOString());
    }

    const bookedTimes = bookedSlots.map((a) => a.scheduledFor.toISOString());
    const availableSlots = allSlots.filter((slot) => !bookedTimes.includes(slot));

    return c.json({ availableSlots });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return c.json({ error: 'Failed to fetch availability' }, 500);
  }
});
