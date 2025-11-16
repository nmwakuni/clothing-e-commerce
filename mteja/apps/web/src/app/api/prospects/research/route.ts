import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAIEngine } from '@mteja/ai-engine';
import { LinkedInScraper } from '@mteja/linkedin-scraper';
import { createDb } from '@mteja/database';
import { prospects, users } from '@mteja/database';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { linkedinUrl, tags, listName } = body;

    if (!linkedinUrl) {
      return NextResponse.json({ error: 'LinkedIn URL is required' }, { status: 400 });
    }

    // Check usage limits
    const db = createDb(process.env.DATABASE_URL!);
    const [user] = await db.select().from(users).where(eq(users.clerkId, userId));

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has prospect research quota (based on plan)
    const prospectLimit = user.plan === 'free' ? 0 : user.plan === 'starter' ? 50 : user.plan === 'pro' ? 200 : 999999;
    const currentUsage = parseInt(user.prospectsResearchedThisMonth || '0');

    if (currentUsage >= prospectLimit) {
      return NextResponse.json(
        { error: 'Prospect research limit reached. Please upgrade your plan.' },
        { status: 403 }
      );
    }

    // Scrape LinkedIn profile
    const scraper = new LinkedInScraper();
    await scraper.initialize();

    let profileData;
    try {
      profileData = await scraper.scrapePublicProfile(linkedinUrl);
    } finally {
      await scraper.close();
    }

    // Analyze prospect with AI
    const aiEngine = createAIEngine(process.env.ANTHROPIC_API_KEY!);
    const analysis = await aiEngine.outreachGenerator.analyzeProspect(profileData);

    // Save to database
    const [savedProspect] = await db
      .insert(prospects)
      .values({
        userId: user.id,
        name: profileData.name || 'Unknown',
        linkedinUrl,
        company: profileData.currentPosition?.company,
        title: profileData.currentPosition?.title,
        location: profileData.location,
        researchData: analysis,
        painPoints: analysis.painPoints,
        interests: analysis.interests,
        tags,
        listName,
      })
      .returning();

    // Update usage counter
    await db
      .update(users)
      .set({
        prospectsResearchedThisMonth: String(currentUsage + 1),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({
      prospect: savedProspect,
      profileData,
      analysis,
    });
  } catch (error) {
    console.error('Prospect research error:', error);
    return NextResponse.json(
      { error: 'Failed to research prospect' },
      { status: 500 }
    );
  }
}
