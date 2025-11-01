import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/prisma';
import { generateAIInsights } from '@/actions/dashboard';

export async function POST(req) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Generate fresh insights
    const insights = await generateAIInsights(user.industry || 'software engineering');

    // Sanitize insights to only fields present in the Prisma schema
    const safeInsights = {
      salaryRanges: insights?.salaryRanges || [],
      growthRate: typeof insights?.growthRate === 'number' ? insights.growthRate : parseFloat(insights?.growthRate) || 0,
      demandLevel: insights?.demandLevel || 'Medium',
      topSkills: insights?.topSkills || [],
      marketOutlook: insights?.marketOutlook || 'Neutral',
      keyTrends: insights?.keyTrends || [],
      recommendedSkills: insights?.recommendedSkills || [],
    };

    // Upsert industryInsight record
    const upserted = await db.industryInsight.upsert({
      where: { industry: user.industry },
      update: {
        ...safeInsights,
        lastUpdated: new Date(),
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      create: {
        industry: user.industry,
        ...safeInsights,
        lastUpdated: new Date(),
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({ success: true, insight: upserted });
  } catch (err) {
    console.error('Refresh endpoint error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
