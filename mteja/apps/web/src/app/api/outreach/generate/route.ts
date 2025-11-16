import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAIEngine } from '@mteja/ai-engine';
import { createDb } from '@mteja/database';
import { prospects, outreachMessages, users } from '@mteja/database';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { prospectId, senderContext } = body;

    if (!prospectId) {
      return NextResponse.json({ error: 'Prospect ID is required' }, { status: 400 });
    }

    const db = createDb(process.env.DATABASE_URL!);

    // Get user and prospect data
    const [user] = await db.select().from(users).where(eq(users.clerkId, userId));
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const [prospect] = await db.select().from(prospects).where(eq(prospects.id, prospectId));
    if (!prospect) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
    }

    // Generate outreach with AI
    const aiEngine = createAIEngine(process.env.ANTHROPIC_API_KEY!);
    const outreach = await aiEngine.outreachGenerator.generateOutreach(
      {
        name: prospect.name,
        company: prospect.company || undefined,
        title: prospect.title || undefined,
        industry: prospect.industry || undefined,
        linkedinUrl: prospect.linkedinUrl,
        recentPosts: (prospect.researchData as any)?.recentPosts,
      },
      senderContext
    );

    // Save messages to database
    const messages = [];

    // Connection request
    const [connectionMsg] = await db
      .insert(outreachMessages)
      .values({
        userId: user.id,
        prospectId,
        type: 'connection_request',
        channel: 'linkedin',
        message: outreach.connectionRequest,
        personalizationData: JSON.stringify(outreach.personalizationUsed),
        status: 'draft',
      })
      .returning();
    messages.push(connectionMsg);

    // Follow-up messages
    for (const [key, message] of Object.entries(outreach.followupSequence)) {
      const [followupMsg] = await db
        .insert(outreachMessages)
        .values({
          userId: user.id,
          prospectId,
          type: key,
          channel: 'linkedin',
          message,
          personalizationData: JSON.stringify(outreach.personalizationUsed),
          status: 'draft',
        })
        .returning();
      messages.push(followupMsg);
    }

    // Cold email
    const [emailMsg] = await db
      .insert(outreachMessages)
      .values({
        userId: user.id,
        prospectId,
        type: 'cold_email',
        channel: 'email',
        subject: outreach.coldEmail.subject,
        message: outreach.coldEmail.body,
        personalizationData: JSON.stringify(outreach.personalizationUsed),
        status: 'draft',
      })
      .returning();
    messages.push(emailMsg);

    return NextResponse.json({
      outreach,
      messages,
    });
  } catch (error) {
    console.error('Outreach generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate outreach' },
      { status: 500 }
    );
  }
}
