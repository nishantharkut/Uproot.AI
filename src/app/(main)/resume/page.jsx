import { getResume } from "@/actions/resume";
import ResumeBuilder from "./_components/resume-builder";

// Force dynamic rendering to avoid Clerk build issues
export const dynamic = 'force-dynamic';

export default async function ResumePage() {
  let resumeData = null;
  let initialContent = null;
  
  try {
    resumeData = await getResume();
    initialContent = resumeData?.currentVersion?.content || null;
  } catch (error) {
    console.error("Error fetching resume:", error);
    // Continue with null content - component will handle it
  }

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container mx-auto px-4">
        <ResumeBuilder initialContent={initialContent} />
      </div>
    </div>
  );
}
