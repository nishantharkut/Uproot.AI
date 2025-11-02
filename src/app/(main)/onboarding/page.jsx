import { industries } from "@/data/industries";
import OnboardingForm from "./_components/onboarding-form";
import { getUserProfile } from "@/actions/user";

// Force dynamic rendering to avoid Clerk build issues
export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  // Get user profile data if exists (for editing)
  const { user: userProfile } = await getUserProfile();

  return (
    <main>
      <OnboardingForm industries={industries} initialData={userProfile} />
    </main>
  );
}
