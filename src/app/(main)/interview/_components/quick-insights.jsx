"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Award, Zap, Star } from "lucide-react";

export default function QuickInsights({ assessments }) {
  if (!assessments || assessments.length === 0) {
    return null;
  }

  const getAverageScore = () => {
    if (!assessments?.length) return 0;
    const total = assessments.reduce(
      (sum, assessment) => sum + assessment.quizScore,
      0
    );
    return (total / assessments.length).toFixed(1);
  };

  const getBestScore = () => {
    if (!assessments?.length) return 0;
    return Math.max(...assessments.map(a => a.quizScore)).toFixed(1);
  };

  const getScoreTrend = () => {
    if (!assessments || assessments.length < 2) return null;
    const latest = assessments[0].quizScore;
    const previous = assessments[1].quizScore;
    return latest > previous ? 'up' : latest < previous ? 'down' : 'same';
  };

  const getStreak = () => {
    if (!assessments || assessments.length < 2) return 0;
    // Simple streak: consecutive quizzes within a day
    let streak = 1;
    for (let i = 1; i < assessments.length; i++) {
      const current = new Date(assessments[i-1].createdAt);
      const previous = new Date(assessments[i].createdAt);
      const diffDays = Math.floor((current - previous) / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) streak++;
      else break;
    }
    return streak;
  };

  const averageScore = parseFloat(getAverageScore());
  const bestScore = parseFloat(getBestScore());
  const trend = getScoreTrend();
  const streak = getStreak();

  const getPerformanceBadge = () => {
    if (averageScore >= 80) return { text: "Expert", color: "bg-tanjiro-green", icon: Award };
    if (averageScore >= 60) return { text: "Advanced", color: "bg-zenitsu-yellow", icon: Star };
    return { text: "Improving", color: "bg-demon-red", icon: TrendingUp };
  };

  const performanceBadge = getPerformanceBadge();
  const BadgeIcon = performanceBadge.icon;

  return (
    <Card className="bg-white border-4 border-black rounded-xl shadow-neu">
      <CardHeader>
        <CardTitle className="text-2xl font-black text-charcoal flex items-center gap-2">
          <Zap className="h-6 w-6 text-tanjiro-green" />
          Quick Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Performance Badge */}
          <div className="bg-cream border-3 border-black rounded-lg p-4 flex flex-col items-center text-center">
            <div className={`w-12 h-12 rounded-lg ${performanceBadge.color} border-3 border-black flex items-center justify-center mb-2 shadow-neu-sm`}>
              <BadgeIcon className="h-6 w-6 text-white" />
            </div>
            <p className="text-xs font-bold text-charcoal/60 mb-1">LEVEL</p>
            <p className="text-base font-black text-charcoal">{performanceBadge.text}</p>
          </div>

          {/* Best Score */}
          <div className="bg-cream border-3 border-black rounded-lg p-4 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-lg bg-zenitsu-yellow border-3 border-black flex items-center justify-center mb-2 shadow-neu-sm">
              <Star className="h-6 w-6 text-white" />
            </div>
            <p className="text-xs font-bold text-charcoal/60 mb-1">BEST SCORE</p>
            <p className="text-base font-black text-charcoal">{bestScore}%</p>
          </div>

          {/* Trend */}
          {trend && (
            <div className="bg-cream border-3 border-black rounded-lg p-4 flex flex-col items-center text-center">
              <div className={`w-12 h-12 rounded-lg ${trend === 'up' ? 'bg-tanjiro-green' : trend === 'down' ? 'bg-demon-red' : 'bg-charcoal'} border-3 border-black flex items-center justify-center mb-2 shadow-neu-sm`}>
                <TrendingUp className={`h-6 w-6 text-white ${trend === 'down' ? 'rotate-180' : ''}`} />
              </div>
              <p className="text-xs font-bold text-charcoal/60 mb-1">TREND</p>
              <p className="text-base font-black text-charcoal capitalize">{trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}</p>
            </div>
          )}

          {/* Streak */}
          {streak > 1 && (
            <div className="bg-cream border-3 border-black rounded-lg p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-lg bg-demon-red border-3 border-black flex items-center justify-center mb-2 shadow-neu-sm">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <p className="text-xs font-bold text-charcoal/60 mb-1">STREAK</p>
              <p className="text-base font-black text-charcoal">{streak} days</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

