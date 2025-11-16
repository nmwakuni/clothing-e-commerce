import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAIEngine } from '@mteja/ai-engine';
import { createDb } from '@mteja/database';
import { profiles } from '@mteja/database';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { linkedinUrl, industry, targetRole, profileData } = body;

    if (!profileData) {
      return NextResponse.json({ error: 'Profile data is required' }, { status: 400 });
    }

    // Initialize AI engine
    const aiEngine = createAIEngine(process.env.ANTHROPIC_API_KEY!);

    // Audit the profile
    const audit = await aiEngine.profileOptimizer.auditProfile({
      currentHeadline: profileData.headline,
      currentAbout: profileData.about,
      currentExperience: profileData.experience,
      industry,
      targetRole,
    });

    // Save to database
    const db = createDb(process.env.DATABASE_URL!);
    const [savedProfile] = await db
      .insert(profiles)
      .values({
        userId,
        linkedinUrl,
        industry,
        targetRole,
        currentHeadline: profileData.headline,
        currentAbout: profileData.about,
        currentExperience: profileData.experience,
        rawProfileData: profileData,
        auditScore: audit.score,
        auditFeedback: audit.feedback,
      })
      .returning();

    return NextResponse.json({
      profileId: savedProfile.id,
      audit,
    });
  } catch (error) {
    console.error('Profile audit error:', error);
    return NextResponse.json(
      { error: 'Failed to audit profile' },
      { status: 500 }
    );
  }
}
