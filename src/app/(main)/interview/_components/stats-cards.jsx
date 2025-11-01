import { Brain, Target, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function StatsCards({ assessments }) {
  const getAverageScore = () => {
    if (!assessments?.length) return 0;
    const total = assessments.reduce(
      (sum, assessment) => sum + assessment.quizScore,
      0
    );
    return (total / assessments.length).toFixed(1);
  };

  const getLatestAssessment = () => {
    if (!assessments?.length) return null;
    return assessments[0];
  };

  const getTotalQuestions = () => {
    if (!assessments?.length) return 0;
    return assessments.reduce(
      (sum, assessment) => sum + assessment.questions.length,
      0
    );
  };

  if (!assessments || assessments.length === 0) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-cream border-3 shadow-neu">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base font-black text-charcoal">Average Score</CardTitle>
            <div className="w-12 h-12 rounded-lg bg-zenitsu-yellow/30 border-3 border-black flex items-center justify-center shadow-neu-sm">
              <Trophy className="h-6 w-6 text-charcoal/50" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-charcoal/30 mb-2">--</div>
            <p className="text-sm font-medium text-charcoal/50">No assessments yet</p>
          </CardContent>
        </Card>

        <Card className="bg-cream border-3 shadow-neu">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base font-black text-charcoal">Questions Practiced</CardTitle>
            <div className="w-12 h-12 rounded-lg bg-tanjiro-green/30 border-3 border-black flex items-center justify-center shadow-neu-sm">
              <Brain className="h-6 w-6 text-charcoal/50" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-charcoal/30 mb-2">0</div>
            <p className="text-sm font-medium text-charcoal/50">Start practicing</p>
          </CardContent>
        </Card>

        <Card className="bg-cream border-3 shadow-neu">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-base font-black text-charcoal">Latest Score</CardTitle>
            <div className="w-12 h-12 rounded-lg bg-demon-red/30 border-3 border-black flex items-center justify-center shadow-neu-sm">
              <Target className="h-6 w-6 text-charcoal/50" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-charcoal/30 mb-2">--</div>
            <p className="text-sm font-medium text-charcoal/50">Take a quiz</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const averageScore = parseFloat(getAverageScore());
  const getScoreBadge = () => {
    if (averageScore >= 80) return { text: "Excellent", color: "bg-tanjiro-green/20 text-tanjiro-green border-tanjiro-green" };
    if (averageScore >= 60) return { text: "Good", color: "bg-zenitsu-yellow/20 text-zenitsu-yellow border-zenitsu-yellow" };
    return { text: "Keep Going", color: "bg-demon-red/20 text-demon-red border-demon-red" };
  };
  const scoreBadge = getScoreBadge();

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="bg-cream hover:bg-white transition-all group border-3 shadow-neu hover:shadow-neu-hover hover:translate-x-[2px] hover:translate-y-[2px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-black text-charcoal">Average Score</CardTitle>
          <div className="w-12 h-12 rounded-lg bg-zenitsu-yellow border-3 border-black flex items-center justify-center shadow-neu-sm group-hover:shadow-neu transition-all">
            <Trophy className="h-6 w-6 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 mb-2">
            <div className="text-3xl font-black text-charcoal">{getAverageScore()}%</div>
            <Badge className={`${scoreBadge.color} border-2 text-xs font-bold px-2 py-0.5`}>
              {scoreBadge.text}
            </Badge>
          </div>
          <p className="text-sm font-medium text-charcoal/60">
            Across all assessments
          </p>
        </CardContent>
      </Card>

      <Card className="bg-cream hover:bg-white transition-all group border-3 shadow-neu hover:shadow-neu-hover hover:translate-x-[2px] hover:translate-y-[2px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-black text-charcoal">
            Questions Practiced
          </CardTitle>
          <div className="w-12 h-12 rounded-lg bg-tanjiro-green border-3 border-black flex items-center justify-center shadow-neu-sm group-hover:shadow-neu transition-all">
            <Brain className="h-6 w-6 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-charcoal mb-2">{getTotalQuestions()}</div>
          <p className="text-sm font-medium text-charcoal/60">Total questions answered</p>
        </CardContent>
      </Card>

      <Card className="bg-cream hover:bg-white transition-all group border-3 shadow-neu hover:shadow-neu-hover hover:translate-x-[2px] hover:translate-y-[2px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-black text-charcoal">Latest Score</CardTitle>
          <div className="w-12 h-12 rounded-lg bg-demon-red border-3 border-black flex items-center justify-center shadow-neu-sm group-hover:shadow-neu transition-all">
            <Target className="h-6 w-6 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-charcoal mb-2">
            {getLatestAssessment()?.quizScore.toFixed(1) || 0}%
          </div>
          <p className="text-sm font-medium text-charcoal/60">Most recent quiz</p>
        </CardContent>
      </Card>
    </div>
  );
}
