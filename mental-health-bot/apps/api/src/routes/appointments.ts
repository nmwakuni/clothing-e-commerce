import { Hono } from 'hono';
import { z } from 'zod';
import { db, appointments, therapists, users } from '@nafsi/database';
import { eq, and, desc, gte } from 'drizzle-orm';

export const appointmentsRouter = new Hono();

// Schema for booking appointment
const appointmentSchema = z.object({
  userId: z.string().uuid(),
  therapistId: z.string().uuid(),
  scheduledFor: z.string().datetime(),
  sessionType: z.enum(['video', 'chat', 'phone']),
  notes: z.string().optional(),
});

// POST /api/appointments - Book a new appointment
appointmentsRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const data = appointmentSchema.parse(body);

    // Check therapist availability
    const therapist = await db
      .select()
      .from(therapists)
      .where(eq(therapists.id, data.therapistId))
      .limit(1);

    if (!therapist.length || !therapist[0].acceptingClients) {
      return c.json({ error: 'Therapist not available' }, 400);
    }

    // Check for conflicting appointments
    const conflicting = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.therapistId, data.therapistId),
          eq(appointments.scheduledFor, new Date(data.scheduledFor))
        )
      );

    if (conflicting.length > 0) {
      return c.json({ error: 'Time slot not available' }, 400);
    }

    const [appointment] = await db
      .insert(appointments)
      .values({
        ...data,
        scheduledFor: new Date(data.scheduledFor),
        status: 'scheduled',
      })
      .returning();

    return c.json({ appointment }, 201);
  } catch (error) {
    console.error('Error booking appointment:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid appointment data', details: error.errors }, 400);
    }
    return c.json({ error: 'Failed to book appointment' }, 500);
  }
});

// GET /api/appointments/:userId - Get user appointments
appointmentsRouter.get('/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const status = c.req.query('status'); // upcoming, completed, cancelled

    let query = db.select().from(appointments).where(eq(appointments.userId, userId));

    if (status === 'upcoming') {
      query = query.where(
        and(eq(appointments.status, 'scheduled'), gte(appointments.scheduledFor, new Date()))
      ) as any;
    } else if (status) {
      query = query.where(eq(appointments.status, status as any)) as any;
    }

    const userAppointments = await query.orderBy(desc(appointments.scheduledFor));

    return c.json({ appointments: userAppointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return c.json({ error: 'Failed to fetch appointments' }, 500);
  }
});

// PATCH /api/appointments/:appointmentId/cancel - Cancel appointment
appointmentsRouter.patch('/:appointmentId/cancel', async (c) => {
  try {
    const appointmentId = c.req.param('appointmentId');
    const body = await c.req.json();
    const { cancellationReason } = body;

    await db
      .update(appointments)
      .set({
        status: 'cancelled',
        cancellationReason,
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, appointmentId));

    return c.json({ success: true, message: 'Appointment cancelled' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return c.json({ error: 'Failed to cancel appointment' }, 500);
  }
});

// PATCH /api/appointments/:appointmentId/complete - Mark appointment as completed
appointmentsRouter.patch('/:appointmentId/complete', async (c) => {
  try {
    const appointmentId = c.req.param('appointmentId');
    const body = await c.req.json();
    const { sessionSummary, rating } = body;

    await db
      .update(appointments)
      .set({
        status: 'completed',
        completedAt: new Date(),
        sessionSummary,
        rating,
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, appointmentId));

    return c.json({ success: true, message: 'Appointment completed' });
  } catch (error) {
    console.error('Error completing appointment:', error);
    return c.json({ error: 'Failed to complete appointment' }, 500);
  }
});
