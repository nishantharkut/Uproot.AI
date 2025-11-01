"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { search, searchNews } from "@/lib/googleSearch";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const serpApiKey = process.env.SERP_API_KEY;

// Function to convert USD to INR
const convertToINR = async () => {
  try {
    const res = await search("1 USD to INR exchange rate", 1, { engine: "google" });
    const rateText = (res[0]?.snippet || "").replace(/,/g, "");
    const rateMatch = rateText.match(/\d+(\.\d+)?/);
    return rateMatch ? parseFloat(rateMatch[0]) : 83.0;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return 83.0;
  }
};

const fetchIndustryData = async (industry) => {
  try {
    console.log('Starting Industry Data Fetch for:', industry);
    console.log('Using SerpAPI Key:', serpApiKey ? 'Key is present' : 'Key is missing');

    // Get salary insights
    console.log('Fetching salary data...');
    const salaryData = await search(`${industry} jobs salary range india 2025 payscale glassdoor`, 7, { gl: 'in' });

    // Get growth and market trends
    const marketTrends = await search(`${industry} sector growth rate india market size 2025 forecast`, 5, { gl: 'in' });

    // Get latest news and analysis
    const newsResults = await searchNews(`${industry} industry india market analysis trends 2025`, 5, { gl: 'in' });

    // Get skills in demand
    const skillsData = await search(`${industry} most in demand skills requirements india 2025`, 5, { gl: 'in' });

    // Log API responses
    console.log('API Responses:', {
      salaryDataReceived: !!salaryData,
      marketTrendsReceived: !!marketTrends,
      newsResultsReceived: !!newsResults,
      skillsDataReceived: !!skillsData
    });

    // Structure and clean the data
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

    // Extract numerical data where possible
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
    
    return {
      ...structuredData,
      extractedMetrics: {
        growthRates: growthRateMatches,
        salaryRanges: salaryRangeMatches
      },
      sources: sourceUrls
    };
  } catch (error) {
    console.error("Error fetching industry data:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return { 
      salaryInsights: { results: [], snippets: [] },
      marketAnalysis: { results: [], snippets: [] },
      newsUpdates: { articles: [], titles: [] },
      skillsRequired: { results: [], snippets: [] },
      extractedMetrics: { growthRates: [], salaryRanges: [] }
    };
  }
};

export const generateAIInsights = async (industry) => {
  console.log('Starting generateAIInsights for industry:', industry);
  
  // Fetch real-world data
  const industryData = await fetchIndustryData(industry);
  console.log('Industry Data Fetched:', {
    hasSalaryData: industryData.salaryInsights.snippets.length > 0,
    hasMarketData: industryData.marketAnalysis.snippets.length > 0,
    hasNewsData: industryData.newsUpdates.titles.length > 0,
    hasSkillsData: industryData.skillsRequired.snippets.length > 0
  });

  const exchangeRate = await convertToINR();
  console.log('Exchange Rate Fetched:', exchangeRate);
  
  const prompt = `
          You are an expert industry analyst. Analyze the current state of the ${industry} industry using the following real-world data and provide insights in the specified JSON format.
          
          Real-world data structure:
          1. Salary Insights: ${JSON.stringify(industryData.salaryInsights.snippets)}
          2. Market Analysis: ${JSON.stringify(industryData.marketAnalysis.snippets)}
          3. Recent News: ${JSON.stringify(industryData.newsUpdates.titles)}
          4. Required Skills: ${JSON.stringify(industryData.skillsRequired.snippets)}
          5. Extracted Metrics:
             - Growth Rates Found: ${JSON.stringify(industryData.extractedMetrics.growthRates)}
             - Salary Ranges Found: ${JSON.stringify(industryData.extractedMetrics.salaryRanges)}
          
          Instructions:
          1. Use the actual salary ranges from the data when available
          2. Extract growth rates from market analysis
          3. Identify trends from recent news articles
          4. List skills mentioned in the job requirements
          5. Use news sentiment to determine market outlook
          6. All monetary values should be in INR
          
          Return insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { 
                "role": "string", 
                "min": number, // in INR
                "max": number, // in INR
                "median": number, // in INR
                "location": "string"
              }
            ],
            "growthRate": number,
            "demandLevel": "High" | "Medium" | "Low",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "Positive" | "Neutral" | "Negative",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"],
            "sources": ["url1", "url2"] // Add sources from the real-world data
          }
          
          IMPORTANT:
          1. Use the provided real-world data to inform your analysis
          2. Return ONLY the JSON. No additional text, notes, or markdown formatting
          3. Include at least 5 common roles for salary ranges
          4. Growth rate should be a percentage
          5. Include at least 5 skills and trends
          6. Include relevant source URLs from the search results
          7. ALL monetary values MUST be in Indian Rupees (INR)
          8. Use the provided USD to INR exchange rate to convert any USD values found in the data
        `;

  const result = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });
  const text = result.choices[0].message.content || "";
  const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

  // Parse model output and normalize salary values to INR
  let parsed = {};
  try {
    parsed = JSON.parse(cleanedText);
  } catch (e) {
    console.error('Failed to parse model output as JSON:', e, '\nRaw:', cleanedText);
    throw e;
  }

  // Helper: parse salary-like strings into numeric INR
  const parseSalaryToINR = (val) => {
    if (val == null || val === '') return 0;
    if (typeof val === 'number') return val; // assume already INR number
    let s = String(val).trim();
    // Remove wrapping text
    s = s.replace(/,|\s+/g, '');
    // detect lakhs (L) or 'Lakhs' (e.g., 5L or 5Lakhs)
    const lakhMatch = s.match(/(\d+(?:\.\d+)?)(?:L|l|Lakhs|lakhs|Lakh|lakh)/);
    if (lakhMatch) {
      return parseFloat(lakhMatch[1]) * 100000;
    }
    // detect INR rupee symbols
    if (/^₹|^Rs\.?|INR/i.test(s)) {
      s = s.replace(/^₹|^Rs\.?|^INR/i, '');
      const num = parseFloat(s.replace(/[^0-9\.]/g, ''));
      return isNaN(num) ? 0 : num;
    }
    // detect USD amounts (with $ or USD)
    if (/\$|USD/i.test(s)) {
      // remove $ and USD
      s = s.replace(/\$|USD/i, '');
      // K means thousands
      const kMatch = s.match(/(\d+(?:\.\d+)?)[kK]/);
      if (kMatch) {
        const usd = parseFloat(kMatch[1]) * 1000;
        return Math.round(usd * exchangeRate);
      }
      const num = parseFloat(s.replace(/[^0-9\.]/g, ''));
      return isNaN(num) ? 0 : Math.round(num * exchangeRate);
    }
    // detect thousands shorthand like 90K
    const kMatch2 = s.match(/(\d+(?:\.\d+)?)[kK]$/);
    if (kMatch2) {
      return parseFloat(kMatch2[1]) * 1000;
    }
    // fallback: numeric parse
    const num = parseFloat(s.replace(/[^0-9\.]/g, ''));
    return isNaN(num) ? 0 : num;
  };

  if (Array.isArray(parsed.salaryRanges)) {
    parsed.salaryRanges = parsed.salaryRanges.map((r) => {
      try {
        const min = parseSalaryToINR(r.min);
        const max = parseSalaryToINR(r.max);
        const median = parseSalaryToINR(r.median);
        return {
          role: r.role || r.title || 'Unknown',
          min: min,
          max: max,
          median: median,
          location: r.location || 'India',
        };
      } catch (err) {
        return {
          role: r.role || 'Unknown',
          min: 0,
          max: 0,
          median: 0,
          location: r.location || 'India',
        };
      }
    });
  }

  // Ensure growthRate is numeric
  if (parsed.growthRate && typeof parsed.growthRate !== 'number') {
    const m = String(parsed.growthRate).match(/(\d+(?:\.\d+)?)/);
    parsed.growthRate = m ? parseFloat(m[1]) : 0;
  }

  return parsed;
};

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  // Fallback insights
  const fallbackInsights = {
    salaryRanges: [],
    marketOutlook: "No data available",
    lastUpdated: new Date().toISOString(),
    nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    growthRate: 0,
    demandLevel: "No data available",
    topSkills: ["No skills available"],
    keyTrends: ["No trends available"],
    recommendedSkills: ["No recommendations available"],
  };

  // If no insights exist, generate them
  if (!user.industryInsight) {
    try {
      const insights = await generateAIInsights(user.industry);

      const industryInsight = await db.industryInsight.create({
        data: {
          industry: user.industry,
          ...insights,
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return industryInsight;
    } catch (error) {
      console.error("Failed to generate insights:", error);
      return fallbackInsights;
    }
  }

  return user.industryInsight || fallbackInsights;
}
