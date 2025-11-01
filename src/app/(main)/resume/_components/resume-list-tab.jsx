"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Edit,
  History,
  Copy,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Calendar,
  FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAllResumes, getResumeVersions, getPublicLink, uploadResumeVersion } from "@/actions/resume";
import { reviewUploadedResume } from "@/actions/resume-reviewer";
import { ensurePdfUrlFormat } from "@/lib/cloudinary-url-utils";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ResumeListTab() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingResumeId, setEditingResumeId] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [historyResumeId, setHistoryResumeId] = useState(null);
  const [historyVersions, setHistoryVersions] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [copyingLinkId, setCopyingLinkId] = useState(null);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      setLoading(true);
      const data = await getAllResumes();
      setResumes(data || []);
    } catch (error) {
      console.error("Error loading resumes:", error);
      toast.error("Failed to load resumes");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async (resumeId) => {
    try {
      setCopyingLinkId(resumeId);
      const linkData = await getPublicLink(resumeId);
      if (linkData?.publicLinkId) {
        // Construct full URL
        const baseUrl = typeof window !== 'undefined' 
          ? window.location.origin 
          : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const fullUrl = `${baseUrl}/resume/public/${linkData.publicLinkId}`;
        
        await navigator.clipboard.writeText(fullUrl);
        toast.success("Public link copied to clipboard!");
      } else {
        toast.error("Failed to get public link");
      }
    } catch (error) {
      console.error("Error copying link:", error);
      toast.error("Failed to copy link");
    } finally {
      setCopyingLinkId(null);
    }
  };

  const handleEdit = (resumeId) => {
    setEditingResumeId(resumeId);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingFile(file);
    }
  };

  const handleUploadNewVersion = async () => {
    if (!uploadingFile || !editingResumeId) {
      toast.error("Please select a file");
      return;
    }

    setIsUploading(true);
    try {
      // Upload file and extract text
      const formData = new FormData();
      formData.append("file", uploadingFile);
      formData.append("save", "true");
      formData.append("resumeId", editingResumeId);

      const uploadResponse = await fetch("/api/resume/upload?save=true", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.error || "Failed to upload file");
      }

      const uploadResult = await uploadResponse.json();
      const { content, version } = uploadResult;

      if (!content || content.trim().length === 0) {
        throw new Error("Could not extract text from file");
      }

      // Review the new version - pass resumeId to save to correct version
      await reviewUploadedResume(content, true, editingResumeId);

      toast.success("New version uploaded and reviewed successfully!");
      setEditingResumeId(null);
      setUploadingFile(null);
      loadResumes(); // Refresh the list
    } catch (error) {
      console.error("Error uploading new version:", error);
      toast.error(error.message || "Failed to upload new version");
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewHistory = async (resumeId) => {
    try {
      setLoadingHistory(true);
      setHistoryResumeId(resumeId);
      const data = await getResumeVersions(resumeId);
      setHistoryVersions(data);
    } catch (error) {
      console.error("Error loading history:", error);
      toast.error("Failed to load resume history");
    } finally {
      setLoadingHistory(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Your Resumes</h2>
        <p className="text-muted-foreground">
          Manage all your uploaded resumes. Each resume can have multiple versions.
        </p>
      </div>

      {resumes.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Resumes Found</h3>
              <p className="text-muted-foreground mb-4">
                Upload your first resume using the "Upload & Review" tab to get started.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <Card key={resume.id} className="border-4 border-black">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-1">{resume.title}</CardTitle>
                    <CardDescription>
                      {resume.versionCount || 0} version{resume.versionCount !== 1 ? "s" : ""}
                    </CardDescription>
                  </div>
                  {resume.currentVersion?.atsScore && (
                    <Badge variant="outline" className="ml-2">
                      ATS: {Math.round(resume.currentVersion.atsScore)}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {resume.currentVersion && (
                  <div className="text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Updated {format(new Date(resume.updatedAt), "MMM d, yyyy")}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Dialog
                    open={editingResumeId === resume.id}
                    onOpenChange={(open) => {
                      if (!open) {
                        setEditingResumeId(null);
                        setUploadingFile(null);
                      } else {
                        setEditingResumeId(resume.id);
                      }
                    }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingResumeId(resume.id)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    {editingResumeId === resume.id && (
                      <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload New Version</DialogTitle>
                        <DialogDescription>
                          Upload a new version of "{resume.title}". This will become the current version.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor={`version-file-${resume.id}`}>Select Resume File</Label>
                          <Input
                            id={`version-file-${resume.id}`}
                            type="file"
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={handleFileSelect}
                            disabled={isUploading}
                          />
                          {uploadingFile && editingResumeId === resume.id && (
                            <p className="text-sm text-muted-foreground">
                              Selected: {uploadingFile.name} ({(uploadingFile.size / 1024).toFixed(2)} KB)
                            </p>
                          )}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingResumeId(null);
                            setUploadingFile(null);
                          }}
                          disabled={isUploading}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleUploadNewVersion}
                          disabled={!uploadingFile || isUploading || editingResumeId !== resume.id}
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <FileDown className="h-4 w-4 mr-2" />
                              Upload & Review
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                      </DialogContent>
                    )}
                  </Dialog>

                  <Dialog
                    open={historyResumeId === resume.id}
                    onOpenChange={(open) => {
                      if (!open) {
                        setHistoryResumeId(null);
                        setHistoryVersions(null);
                      } else {
                        handleViewHistory(resume.id);
                      }
                    }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewHistory(resume.id)}
                      className="flex-1"
                    >
                      <History className="h-4 w-4 mr-2" />
                      History
                    </Button>
                    {historyResumeId === resume.id && (
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          Version History: {historyVersions?.resume?.title || resume.title}
                        </DialogTitle>
                        <DialogDescription>
                          View all versions of this resume and access their PDFs
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        {loadingHistory ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                        ) : historyVersions?.versions && historyVersions.versions.length > 0 ? (
                          <div className="space-y-3">
                            {historyVersions.versions.map((version) => (
                              <Card key={version.id} className="border-2">
                                <CardContent className="pt-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Badge variant={version.isCurrent ? "default" : "outline"}>
                                          Version {version.versionNumber}
                                          {version.isCurrent && " (Current)"}
                                        </Badge>
                                        {version.atsScore && (
                                          <Badge variant="secondary">
                                            ATS: {Math.round(version.atsScore)}
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-sm text-muted-foreground mb-2">
                                        {format(new Date(version.createdAt), "MMM d, yyyy 'at' h:mm a")}
                                      </p>
                                      {version.fileName && (
                                        <p className="text-sm font-medium">{version.fileName}</p>
                                      )}
                                    </div>
                                    {version.cloudinaryUrl && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                        className="ml-2"
                                      >
                                        <a
                                          href={ensurePdfUrlFormat(version.cloudinaryUrl)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          type="application/pdf"
                                        >
                                          <ExternalLink className="h-4 w-4 mr-2" />
                                          View PDF
                                        </a>
                                      </Button>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-muted-foreground py-8">
                            No versions found
                          </p>
                        )}
                      </div>
                      </DialogContent>
                    )}
                  </Dialog>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyLink(resume.id)}
                    disabled={copyingLinkId === resume.id}
                    className="flex-1"
                  >
                    {copyingLinkId === resume.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Copying...
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

