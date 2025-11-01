import { getCoverLetters } from "@/actions/cover-letter";
import Link from "next/link";
import { Plus, Sparkles, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CoverLetterList from "./_components/cover-letter-list";

// Force dynamic rendering to avoid Clerk build issues
export const dynamic = 'force-dynamic';

export default async function CoverLetterPage() {
  const coverLetters = await getCoverLetters();

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container mx-auto px-4 space-y-6">
        {/* Upgrade Banner */}
        <Card className="bg-gradient-to-r from-tanjiro-green/10 to-nezuko-pink/10 border-4 border-tanjiro-green shadow-neu">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-tanjiro-green border-3 border-black flex items-center justify-center shadow-neu-sm flex-shrink-0">
                  <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-cream" />
                </div>
                <div>
                  <h3 className="font-black text-lg md:text-xl text-charcoal mb-1">
                    Need More Cover Letters?
                  </h3>
                  <p className="text-charcoal/70 font-semibold text-sm md:text-base">
                    Upgrade to Pro for unlimited cover letters
                  </p>
                </div>
              </div>
              <Link href="/pricing">
                <Button className="h-11 md:h-12 px-5 md:px-6 text-sm md:text-base font-black uppercase tracking-wide shadow-neu bg-tanjiro-green hover:bg-tanjiro-green/90 text-cream whitespace-nowrap">
                  Upgrade
                  <ArrowUpRight className="h-4 w-4 md:h-5 md:w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="bg-white border-4 border-black rounded-xl shadow-neu p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <h1 className="logo-font text-4xl md:text-5xl text-tanjiro-green text-shadow-medium">
                MY COVER LETTERS
              </h1>
              <p className="text-base md:text-lg text-charcoal/70 font-medium mt-2">
                Manage your AI-generated cover letters
              </p>
            </div>
            <Link href="/ai-cover-letter/new">
              <Button className="h-12 px-6 font-bold whitespace-nowrap">
                <Plus className="h-5 w-5 mr-2" />
                Create New
              </Button>
            </Link>
          </div>
        </div>

        <CoverLetterList coverLetters={coverLetters} />
      </div>
    </div>
  );
}
