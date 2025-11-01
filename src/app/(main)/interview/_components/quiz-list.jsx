"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trophy, Clock, Lightbulb, Target, Rocket } from "lucide-react";
import QuizResult from "./quiz-result";

export default function QuizList({ assessments }) {
  const router = useRouter();
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  return (
    <>
      <Card className="bg-cream border-4 border-black">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="logo-font text-3xl md:text-4xl text-tanjiro-green text-shadow-medium">
                  RECENT QUIZZES
                </CardTitle>
                {assessments && assessments.length > 0 && (
                  <div className="px-3 py-1 bg-demon-red/10 border-2 border-demon-red rounded-md">
                    <span className="text-xs font-black text-demon-red">
                      {assessments.length}
                    </span>
                  </div>
                )}
              </div>
              <CardDescription className="text-base font-medium text-charcoal/70">
                Review your past quiz performance and track your progress
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!assessments || assessments.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-20 h-20 rounded-xl bg-tanjiro-green/10 border-3 border-tanjiro-green flex items-center justify-center mx-auto mb-4">
                <Target className="h-10 w-10 text-tanjiro-green" />
              </div>
              <h3 className="text-2xl font-black text-charcoal mb-2">No Quizzes Yet</h3>
              <p className="text-base font-medium text-charcoal/70 mb-6 max-w-md mx-auto">
                Start your first quiz to track your interview preparation progress and identify areas for improvement.
              </p>
              <Button onClick={() => router.push("/interview/mock")} className="h-12 px-8 font-bold text-base gap-2">
                <Rocket className="h-5 w-5" />
                Start Your First Quiz
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {assessments.map((assessment, i) => (
                <Card
                  key={assessment.id}
                  className="cursor-pointer bg-white hover:bg-cream transition-all border-3 shadow-neu hover:shadow-neu-hover hover:translate-x-[4px] hover:translate-y-[4px] group"
                  onClick={() => setSelectedQuiz(assessment)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-tanjiro-green/10 border-2 border-tanjiro-green flex items-center justify-center group-hover:bg-tanjiro-green/20 transition-colors">
                            <span className="text-lg font-black text-tanjiro-green">{i + 1}</span>
                          </div>
                          <CardTitle className="text-2xl font-black text-charcoal">
                            Quiz {i + 1}
                          </CardTitle>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-3">
                          <div className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-zenitsu-yellow" />
                            <span className="text-base font-bold text-charcoal">
                              Score: <span className="text-tanjiro-green">{assessment.quizScore.toFixed(1)}%</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-charcoal/50" />
                            <span className="text-sm font-medium text-charcoal/70">
                              {format(
                                new Date(assessment.createdAt),
                                "MMM dd, yyyy"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  {assessment.improvementTip && (
                    <CardContent className="pt-0">
                      <div className="bg-tanjiro-green/5 border-2 border-tanjiro-green/20 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="h-5 w-5 text-tanjiro-green mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-tanjiro-green mb-1">IMPROVEMENT TIP</p>
                            <p className="text-sm font-medium text-charcoal leading-relaxed">
                              {assessment.improvementTip}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedQuiz} onOpenChange={() => setSelectedQuiz(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle></DialogTitle>
          </DialogHeader>
          <QuizResult
            result={selectedQuiz}
            hideStartNew
            onStartNew={() => router.push("/interview/mock")}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
