import { getResumeByPublicLink } from "@/actions/resume";
import { notFound } from "next/navigation";
import { ExternalLink, Download } from "lucide-react";
import Link from "next/link";
import { ensurePdfUrlFormat } from "@/lib/cloudinary-url-utils";
import ResumeContentViewer from "../_components/resume-content-viewer";

export default async function PublicResumePage({ params }) {
  const { publicLinkId } = await params;
  
  let resumeData = null;
  
  try {
    resumeData = await getResumeByPublicLink(publicLinkId);
  } catch (error) {
    console.error("Error fetching public resume:", error);
  }

  if (!resumeData || !resumeData.currentVersion) {
    notFound();
  }

  const { resume, currentVersion } = resumeData;
  const hasPdf = currentVersion.cloudinaryUrl;
  const pdfUrl = hasPdf ? ensurePdfUrlFormat(currentVersion.cloudinaryUrl) : null;

  return (
    <div className="min-h-screen bg-cream py-12 pb-24">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mt-20 bg-white border-4 border-black rounded-xl shadow-neu-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-charcoal mb-2">{resume.title}</h1>
              {resumeData.user?.name && (
                <p className="text-lg text-charcoal/70">by {resumeData.user.name}</p>
              )}
            </div>
            <Link 
              href="/"
              className="px-4 py-2 bg-tanjiro-green text-white rounded-md hover:bg-tanjiro-green/90 transition-colors"
            >
              UpRoot
            </Link>
          </div>

          {/* PDF Download Button */}
          {pdfUrl && (
            <div className="mt-4 flex gap-3">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-tanjiro-green text-white rounded-md hover:bg-tanjiro-green/90 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                View PDF
              </a>
              <a
                href={pdfUrl}
                download
                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-black rounded-md hover:bg-gray-100 transition-colors"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </a>
            </div>
          )}
        </div>

        {/* Resume Content */}
        <div className="bg-white border-4 border-black rounded-xl shadow-neu-lg p-8">
          <ResumeContentViewer 
            content={currentVersion.content} 
            pdfUrl={pdfUrl} 
          />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-charcoal/60">
          <p>Shared via UpRoot - AI-Powered Career Development Platform</p>
        </div>
      </div>
    </div>
  );
}

