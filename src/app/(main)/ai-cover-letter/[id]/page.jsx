import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCoverLetter } from "@/actions/cover-letter";
import CoverLetterPreview from "../_components/cover-letter-preview";

// Force dynamic rendering to avoid Clerk build issues
export const dynamic = 'force-dynamic';

export default async function EditCoverLetterPage({ params }) {
  const { id } = params;
  const coverLetter = await getCoverLetter(id);

  if (!coverLetter) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-4xl font-bold text-tanjiro-green mb-4">Cover Letter Not Found</h1>
        <Link href="/ai-cover-letter">
          <Button className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Cover Letters
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link href="/ai-cover-letter">
            <Button variant="outline" className="gap-2 border-2 border-black hover:bg-black/5">
              <ArrowLeft className="h-4 w-4" />
              Back to Cover Letters
            </Button>
          </Link>
        </div>

        <div className="bg-white border-4 border-black rounded-xl shadow-neu p-6 md:p-8 mb-8">
          <h1 className="logo-font text-4xl md:text-5xl text-tanjiro-green text-shadow-medium mb-2">
            {coverLetter.jobTitle}
          </h1>
          <p className="text-xl text-charcoal/70 font-medium">
            at {coverLetter.companyName}
          </p>
        </div>

        <CoverLetterPreview content={coverLetter.content} />
      </div>
    </div>
  );
}
