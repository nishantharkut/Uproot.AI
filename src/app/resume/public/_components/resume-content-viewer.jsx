"use client";

import { FileText, ExternalLink } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";

export default function ResumeContentViewer({ content, pdfUrl }) {
  if (content) {
    return (
      <div className="prose prose-lg max-w-none">
        <MDEditor.Markdown
          source={content}
          style={{
            background: "transparent",
            color: "inherit",
          }}
        />
      </div>
    );
  }

  if (pdfUrl) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg text-charcoal/70 mb-4">
          View the PDF version of this resume using the buttons above.
        </p>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-tanjiro-green text-white rounded-md hover:bg-tanjiro-green/90 transition-colors"
        >
          <ExternalLink className="h-5 w-5" />
          Open PDF
        </a>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
      <p className="text-lg text-charcoal/70">
        No resume content available.
      </p>
    </div>
  );
}

