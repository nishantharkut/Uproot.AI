import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { db } from '../src/lib/prisma.js';
import OpenAI from 'openai';
import { search, searchNews } from '../src/lib/googleSearch.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function sanitizeInsights(insights) {
  return {
    salaryRanges: insights?.salaryRanges || [],
    growthRate: typeof insights?.growthRate === 'number' ? insights.growthRate : parseFloat(insights?.growthRate) || 0,
    demandLevel: insights?.demandLevel || 'Medium',
    topSkills: insights?.topSkills || [],
    marketOutlook: insights?.marketOutlook || 'Neutral',
    keyTrends: insights?.keyTrends || [],
    recommendedSkills: insights?.recommendedSkills || [],
  };
}

async function generateAIInsightsLocal(industry) {
  // Fetch real-world data
  const salaryData = await search(`${industry} jobs salary range india 2025 payscale glassdoor`, 7, { gl: 'in' });
  const marketTrends = await search(`${industry} sector growth rate india market size 2025 forecast`, 5, { gl: 'in' });
  const newsResults = await searchNews(`${industry} industry india market analysis trends 2025`, 5, { gl: 'in' });
  const skillsData = await search(`${industry} most in demand skills requirements india 2025`, 5, { gl: 'in' });

  const structuredData = {
    salaryInsights: {
      results: salaryData || [],
      snippets: (salaryData || []).map(r => r.snippet).filter(Boolean)
    },
    marketAnalysis: {
      results: marketTrends || [],
      snippets: (marketTrends || []).map(r => r.snippet).filter(Boolean)
    },
    newsUpdates: {
      articles: newsResults || [],
      titles: (newsResults || []).map(r => r.title).filter(Boolean)
    },
    skillsRequired: {
      results: skillsData || [],
      snippets: (skillsData || []).map(r => r.snippet).filter(Boolean)
    }
  };

  const growthRateMatches = structuredData.marketAnalysis.snippets.join(' ').match(/(\d+(\.\d+)?)\s*%\s*(?:growth|CAGR|increase)/gi) || [];
  const salaryRangeMatches = structuredData.salaryInsights.snippets.join(' ').match(/(?:Rs|INR|₹)\s*\d+(\.\d+)?\s*(?:L|Lakhs|Lakh|Lacs|K|,000)/gi) || [];

  const sourceUrls = [
    ...new Set([
      ...(salaryData || []).map(r => r.link).filter(Boolean),
      ...(marketTrends || []).map(r => r.link).filter(Boolean),
      ...(newsResults || []).map(r => r.link).filter(Boolean),
      ...(skillsData || []).map(r => r.link).filter(Boolean),
    ])
  ];

  const prompt = `You are an expert industry analyst. Analyze the current state of the ${industry} industry using the following real-world data and provide insights in JSON format.\n\nSalary Insights: ${JSON.stringify(structuredData.salaryInsights.snippets)}\nMarket Analysis: ${JSON.stringify(structuredData.marketAnalysis.snippets)}\nRecent News: ${JSON.stringify(structuredData.newsUpdates.titles)}\nRequired Skills: ${JSON.stringify(structuredData.skillsRequired.snippets)}\n\nReturn JSON with fields: salaryRanges (array), growthRate (number), demandLevel (High|Medium|Low), topSkills (array), marketOutlook (Positive|Neutral|Negative), keyTrends (array), recommendedSkills (array). Include at least 5 salary roles and 5 skills.`;

  const result = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
  });

  const text = result.choices?.[0]?.message?.content || '{}';
  const cleaned = text.replace(/```(?:json)?\n?/g, '').trim();
  let parsed = {};
  try { parsed = JSON.parse(cleaned); } catch (e) { console.error('Failed to parse model JSON:', e, '\nRaw:', cleaned); parsed = {}; }

  // Attach sources for logging but they won't be stored directly
  parsed._sources = sourceUrls;
  parsed._extracted = { growthRates: growthRateMatches, salaryRanges: salaryRangeMatches };

  return parsed;
}

function usage() {
  console.log('Usage: node scripts/refresh-insights-local.mjs --clerkUserId=<id> | --email=<email>');
  process.exit(1);
}

const argv = Object.fromEntries(process.argv.slice(2).map(a => a.split('=').map(s=>s.replace(/^--/,''))));
const clerkUserId = argv.clerkUserId;
const email = argv.email;

if (!clerkUserId && !email) usage();

async function run() {
  try {
    let user;
    if (clerkUserId) user = await db.user.findUnique({ where: { clerkUserId } });
    if (email) user = await db.user.findUnique({ where: { email } });
    if (!user) { console.error('User not found'); process.exit(2); }

    console.log('Generating insights for user:', user.clerkUserId, 'industry:', user.industry);
    const insights = await generateAIInsightsLocal(user.industry || 'software engineering');
    console.log('Generated insights keys:', Object.keys(insights));

    const safe = sanitizeInsights(insights);

    const upserted = await db.industryInsight.upsert({
      where: { industry: user.industry },
      update: { ...safe, lastUpdated: new Date(), nextUpdate: new Date(Date.now()+7*24*60*60*1000) },
      create: { industry: user.industry, ...safe, lastUpdated: new Date(), nextUpdate: new Date(Date.now()+7*24*60*60*1000) }
    });

    console.log('Upserted industryInsight id:', upserted.id);
    console.log('Sources (preview):', insights._sources?.slice(0,5));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
