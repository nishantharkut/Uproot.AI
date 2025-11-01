import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { db } from '../src/lib/prisma.js';
import { generateAIInsights } from '../src/actions/dashboard.js';

function usage() {
  console.log('Usage: node scripts/refresh-insights.mjs --clerkUserId=<id> | --email=<email>');
  process.exit(1);
}

const argv = Object.fromEntries(process.argv.slice(2).map(a => a.split('=').map(s=>s.replace(/^--/,''))));
const clerkUserId = argv.clerkUserId;
const email = argv.email;

if (!clerkUserId && !email) usage();

async function run() {
  try {
    let user;
    if (clerkUserId) {
      user = await db.user.findUnique({ where: { clerkUserId } });
    } else if (email) {
      user = await db.user.findUnique({ where: { email } });
    }

    if (!user) {
      console.error('User not found for', { clerkUserId, email });
      process.exit(2);
    }

    console.log('Refreshing insights for user:', user.id, user.clerkUserId || user.email);

    const insights = await generateAIInsights(user.industry || 'software engineering');

    const safeInsights = {
      salaryRanges: insights?.salaryRanges || [],
      growthRate: typeof insights?.growthRate === 'number' ? insights.growthRate : parseFloat(insights?.growthRate) || 0,
      demandLevel: insights?.demandLevel || 'Medium',
      topSkills: insights?.topSkills || [],
      marketOutlook: insights?.marketOutlook || 'Neutral',
      keyTrends: insights?.keyTrends || [],
      recommendedSkills: insights?.recommendedSkills || [],
    };

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

    console.log('Upserted industryInsight id:', upserted.id || '(no id)');
    console.log('Sources:', upserted.sources || insights.sources || []);
    process.exit(0);
  } catch (err) {
    console.error('Error refreshing insights:', err);
    process.exit(3);
  }
}

run();
