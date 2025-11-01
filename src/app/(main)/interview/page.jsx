import { getAssessments } from "@/actions/interview";
import StatsCards from "./_components/stats-cards";
import PerformanceChart from "./_components/performace-chart";
import QuizList from "./_components/quiz-list";
import QuickInsights from "./_components/quick-insights";
import { Swords, Rocket, Sparkles, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

// Force dynamic rendering to avoid Clerk build issues
export const dynamic = 'force-dynamic';

export default async function InterviewPrepPage() {
  const assessments = await getAssessments();

  return (
    <div className="space-y-8">
      {/* Upgrade Banner */}
      <Card className="bg-gradient-to-r from-zenitsu-yellow/10 to-earthy-orange/10 border-4 border-zenitsu-yellow shadow-neu">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-zenitsu-yellow border-3 border-black flex items-center justify-center shadow-neu-sm flex-shrink-0">
                <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-charcoal" />
              </div>
              <div>
                <h3 className="font-black text-lg md:text-xl text-charcoal mb-1">
                  Unlimited Interview Practice
                </h3>
                <p className="text-charcoal/70 font-semibold text-sm md:text-base">
                  Upgrade to Basic or Pro for unlimited interview quizzes
                </p>
              </div>
            </div>
            <Link href="/pricing">
              <Button className="h-11 md:h-12 px-5 md:px-6 text-sm md:text-base font-black uppercase tracking-wide shadow-neu bg-zenitsu-yellow hover:bg-zenitsu-yellow/90 text-charcoal whitespace-nowrap">
                View Plans
                <ArrowUpRight className="h-4 w-4 md:h-5 md:w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Header Section */}
      <div className="bg-white border-4 border-black rounded-xl shadow-neu p-6 md:p-8 relative overflow-hidden">
        {/* Decorative corner elements */}
        <div className="absolute top-0 right-0 w-32 h-32 border-t-4 border-r-4 border-black opacity-5" />
        <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-black opacity-5" />
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-demon-red border-4 border-black flex items-center justify-center shadow-neu-sm relative group">
              <Swords className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-tanjiro-green border-2 border-black rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="logo-font text-4xl md:text-5xl text-tanjiro-green text-shadow-medium">
                  Interview Preparation
                </h1>
                {assessments && assessments.length > 0 && (
                  <div className="px-3 py-1 bg-tanjiro-green/10 border-2 border-tanjiro-green rounded-md">
                    <span className="text-xs font-black text-tanjiro-green">
                      {assessments.length} QUIZ{assessments.length !== 1 ? 'ZES' : ''}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-base md:text-lg text-charcoal/70 font-medium">
                Master your skills with AI-powered mock interviews
              </p>
            </div>
          </div>
          <Link href="/interview/mock">
            <Button className="h-12 px-8 font-bold text-base gap-2 w-full md:w-auto shadow-neu-sm hover:shadow-neu-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
              <Rocket className="h-5 w-5" />
              Start New Quiz
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        <StatsCards assessments={assessments} />
        <QuizList assessments={assessments} />
        <QuickInsights assessments={assessments} />
        <PerformanceChart assessments={assessments} />
      </div>
    </div>
  );
}
