import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import ScheduleCallView from "./_components/schedule-call-view";

// Force dynamic rendering to avoid Clerk build issues
export const dynamic = 'force-dynamic';

export default async function ScheduleCallPage() {
  const { isOnboarded } = await getUserOnboardingStatus();

  if (!isOnboarded) {
    redirect("/onboarding");
  }

  return (
    <div className="container mx-auto py-8">
      <ScheduleCallView />
    </div>
  );
}
