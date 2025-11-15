import { Hono } from 'hono';
import { z } from 'zod';
import { db, crisisEvents, users } from '@nafsi/database';
import { eq, desc } from 'drizzle-orm';

export const crisisRouter = new Hono();

// Schema for reporting crisis
const crisisSchema = z.object({
  userId: z.string().uuid(),
  crisisType: z.enum([
    'suicidal_ideation',
    'self_harm',
    'panic_attack',
    'severe_distress',
    'psychotic_episode',
  ]),
  severity: z.enum(['mild', 'moderate', 'severe', 'critical']),
  triggerMessage: z.string(),
  detectedBy: z.enum(['ai', 'user_reported', 'therapist', 'emergency_contact']),
  location: z.string().optional(),
  contactedEmergencyServices: z.boolean().default(false),
});

// POST /api/crisis/report - Report a crisis event
crisisRouter.post('/report', async (c) => {
  try {
    const body = await c.req.json();
    const data = crisisSchema.parse(body);

    const [crisis] = await db
      .insert(crisisEvents)
      .values({
        ...data,
        interventionType: ['ai_support', 'hotline_provided'],
        resolved: false,
      })
      .returning();

    // Update user risk level
    await db
      .update(users)
      .set({
        riskLevel: data.severity,
        lastRiskAssessment: new Date(),
      })
      .where(eq(users.id, data.userId));

    // Get crisis resources based on location
    const resources = {
      kenya: {
        hotlines: [
          { name: 'Kenya Red Cross', number: '+254722178177', available: '24/7' },
          { name: 'Befrienders Kenya', number: '+254722178177', available: '24/7' },
          { name: 'MHAK Helpline', number: '0800 720 020', available: '24/7' },
        ],
        emergency: { police: '999', ambulance: '999' },
      },
      default: {
        hotlines: [
          { name: 'International Crisis Line', number: 'Find local crisis line', available: '24/7' },
        ],
        emergency: { universal: '112' },
      },
    };

    const countryResources = resources.kenya; // Default to Kenya for now

    return c.json(
      {
        crisis,
        resources: countryResources,
        message:
          'Crisis reported. If you are in immediate danger, please call emergency services or go to the nearest hospital.',
      },
      201
    );
  } catch (error) {
    console.error('Error reporting crisis:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid crisis data', details: error.errors }, 400);
    }
    return c.json({ error: 'Failed to report crisis' }, 500);
  }
});

// GET /api/crisis/:userId/history - Get crisis history for a user
crisisRouter.get('/:userId/history', async (c) => {
  try {
    const userId = c.req.param('userId');

    const crises = await db
      .select()
      .from(crisisEvents)
      .where(eq(crisisEvents.userId, userId))
      .orderBy(desc(crisisEvents.occurredAt));

    return c.json({ crises });
  } catch (error) {
    console.error('Error fetching crisis history:', error);
    return c.json({ error: 'Failed to fetch crisis history' }, 500);
  }
});

// PATCH /api/crisis/:crisisId/resolve - Mark crisis as resolved
crisisRouter.patch('/:crisisId/resolve', async (c) => {
  try {
    const crisisId = c.req.param('crisisId');
    const body = await c.req.json();
    const { resolutionNotes } = body;

    await db
      .update(crisisEvents)
      .set({
        resolved: true,
        resolvedAt: new Date(),
        resolutionNotes,
      })
      .where(eq(crisisEvents.id, crisisId));

    return c.json({ success: true, message: 'Crisis marked as resolved' });
  } catch (error) {
    console.error('Error resolving crisis:', error);
    return c.json({ error: 'Failed to resolve crisis' }, 500);
  }
});

// GET /api/crisis/resources - Get crisis resources and hotlines
crisisRouter.get('/resources', async (c) => {
  const country = c.req.query('country') || 'kenya';

  const allResources = {
    kenya: {
      country: 'Kenya',
      hotlines: [
        {
          name: 'Kenya Red Cross Hotline',
          number: '+254 722 178 177',
          available: '24/7',
          services: 'Crisis counseling, emotional support',
        },
        {
          name: 'Befrienders Kenya',
          number: '+254 722 178 177',
          available: '24/7',
          services: 'Suicide prevention, emotional support',
        },
        {
          name: 'Mental Health Association of Kenya (MHAK)',
          number: '0800 720 020',
          available: '24/7',
          services: 'Mental health support, referrals',
        },
        {
          name: 'Gender Violence Recovery Centre',
          number: '+254 709 738 000',
          available: '24/7',
          services: 'GBV support, counseling',
        },
      ],
      emergency: {
        police: '999',
        ambulance: '999',
        fire: '999',
      },
      hospitals: [
        {
          name: 'Kenyatta National Hospital - Psychiatric Unit',
          location: 'Nairobi',
          contact: '+254 20 272 6300',
        },
        {
          name: 'Mathari National Teaching and Referral Hospital',
          location: 'Nairobi',
          contact: '+254 20 864 9541',
        },
      ],
    },
  };

  const resources = allResources[country as keyof typeof allResources] || allResources.kenya;

  return c.json({ resources });
});
