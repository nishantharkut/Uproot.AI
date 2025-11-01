"use server";

import { db } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Get user from Clerk to create new user if needed
  const clerkUser = await currentUser();
  // Generate insights outside the transaction — external network calls should not run inside a DB transaction
  let generatedInsights = null;
  try {
    // Check if an industryInsight already exists first (read-only)
    const existing = await db.industryInsight.findUnique({ where: { industry: data.industry } });
    if (!existing) {
      try {
        generatedInsights = await generateAIInsights(data.industry);
      } catch (genErr) {
        // Log but do not block profile update; we'll proceed without creating industryInsight
        console.error('Error generating industry insights (will continue without insights):', genErr);
        generatedInsights = null;
      }
    }

    // Start a transaction to create/update user and optionally create the industryInsight
    const result = await db.$transaction(
      async (tx) => {
        // Check if user exists, create if not
        let user = await tx.user.findUnique({ where: { clerkUserId: userId } });

        if (!user) {
          // Create new user if they don't exist
          if (!clerkUser) {
            throw new Error('Clerk user not found');
          }

          const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';

          user = await tx.user.create({
            data: {
              clerkUserId: userId,
              name,
              imageUrl: clerkUser.imageUrl,
              email: clerkUser.emailAddresses[0]?.emailAddress || '',
            },
          });
        }

        // If we generated insights earlier and there isn't an existing record, create it within the transaction
        let industryInsight = await tx.industryInsight.findUnique({ where: { industry: data.industry } });
        if (!industryInsight && generatedInsights) {
          const safeGen = {
            salaryRanges: generatedInsights?.salaryRanges || [],
            growthRate: typeof generatedInsights?.growthRate === 'number' ? generatedInsights.growthRate : parseFloat(generatedInsights?.growthRate) || 0,
            demandLevel: generatedInsights?.demandLevel || 'Medium',
            topSkills: generatedInsights?.topSkills || [],
            marketOutlook: generatedInsights?.marketOutlook || 'Neutral',
            keyTrends: generatedInsights?.keyTrends || [],
            recommendedSkills: generatedInsights?.recommendedSkills || [],
          };

          industryInsight = await tx.industryInsight.create({
            data: {
              industry: data.industry,
              ...safeGen,
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        }

        // Now update the user
        const updatedUser = await tx.user.update({
          where: { id: user.id },
          data: {
            industry: data.industry,
            experience: data.experience,
            bio: data.bio,
            skills: data.skills,
          },
        });

        return { updatedUser, industryInsight };
      },
      { timeout: 10000 }
    );

    revalidatePath('/');
    return { success: true, user: result.updatedUser };
  } catch (error) {
    console.error('Error updating user and industry:', error?.message || error);
    throw new Error('Failed to update profile');
  }
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
      select: {
        industry: true,
      },
    });

    // If user doesn't exist, they're not onboarded - return false instead of throwing
    if (!user) {
      return {
        isOnboarded: false,
      };
    }

    return {
      isOnboarded: !!user?.industry,
    };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    // Return false on error to allow redirect to onboarding
    return {
      isOnboarded: false,
    };
  }
}
