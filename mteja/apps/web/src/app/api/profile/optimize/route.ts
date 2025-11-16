import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAIEngine } from '@mteja/ai-engine';
import { createDb } from '@mteja/database';
import { profiles } from '@mteja/database';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { profileId, profileData, industry, targetRole } = body;

    // Initialize AI engine
    const aiEngine = createAIEngine(process.env.ANTHROPIC_API_KEY!);

    // Optimize the profile
    const optimized = await aiEngine.profileOptimizer.optimizeProfile({
      currentHeadline: profileData.headline,
      currentAbout: profileData.about,
      currentExperience: profileData.experience,
      industry,
      targetRole,
    });

    // Update database if profileId provided
    if (profileId) {
      const db = createDb(process.env.DATABASE_URL!);
      await db
        .update(profiles)
        .set({
          optimizedHeadline: optimized.headline,
          optimizedAbout: optimized.about,
          optimizedExperience: optimized.experience,
          suggestions: optimized.suggestions,
          updatedAt: new Date(),
        })
        .where(eq(profiles.id, profileId));
    }

    return NextResponse.json({ optimized });
  } catch (error) {
    console.error('Profile optimization error:', error);
    return NextResponse.json(
      { error: 'Failed to optimize profile' },
      { status: 500 }
    );
  }
}
