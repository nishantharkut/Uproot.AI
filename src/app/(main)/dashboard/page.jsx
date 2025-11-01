import { getIndustryInsights } from "@/actions/dashboard";
import DashboardView from "./_component/dashboard-view";
import { getUserOnboardingStatus } from "@/actions/user";
import { getUserSubscription } from "@/actions/subscription";
import { redirect } from "next/navigation";

// Force dynamic rendering to avoid Clerk build issues
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { isOnboarded } = await getUserOnboardingStatus();

  // If not onboarded, redirect to onboarding page
  // Skip this check if already on the onboarding page
  if (!isOnboarded) {
    redirect("/onboarding");
  }

  const insights = await getIndustryInsights();
  
  // Get user's subscription tier
  let currentTier = "Free";
  try {
    const subscription = await getUserSubscription();
    currentTier = subscription?.tier || "Free";
  } catch (error) {
    console.error("Error getting subscription:", error);
  }

  return <DashboardView insights={insights} currentTier={currentTier} />;
}
