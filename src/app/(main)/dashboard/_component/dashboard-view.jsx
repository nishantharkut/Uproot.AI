"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BriefcaseIcon,
  LineChart,
  TrendingUp,
  TrendingDown,
  Brain,
  Activity,
  Target,
  Sparkles,
  Clock,
  Bot,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Chatbot from "@/components/chatbot";

const DashboardView = ({ insights }) => {
  const [chatbotOpen, setChatbotOpen] = useState(false);

  // Fallback for missing insights
  const fallbackInsights = {
    salaryRanges: [
      { role: "Junior Developer", min: 300, max: 500, median: 400 },
      { role: "Senior Developer", min: 600, max: 1200, median: 900 },
      { role: "Project Manager", min: 800, max: 1500, median: 1150 },
      { role: "Data Analyst", min: 400, max: 700, median: 550 },
      { role: "Consultant", min: 500, max: 1000, median: 750 },
    ],
    marketOutlook: "Neutral",
    lastUpdated: new Date().toISOString(),
    nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    growthRate: 5.0,
    demandLevel: "Medium",
    topSkills: ["Communication", "Problem-solving", "Teamwork"],
    keyTrends: ["Remote work", "AI integration", "Upskilling"],
    recommendedSkills: ["Python", "Data Visualization", "Leadership"],
  };

  const safeInsights = insights || fallbackInsights;

  // Transform salary data for the chart
  const salaryData = safeInsights.salaryRanges.map((range) => ({
    name: range.role || "Unknown Role",
    min: range.min ? range.min / 1000 : 0,
    max: range.max ? range.max / 1000 : 0,
    median: range.median ? range.median / 1000 : 0,
  }));

  const getDemandLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case "high":
        return "bg-tanjiro-green";
      case "medium":
        return "bg-zenitsu-yellow";
      case "low":
        return "bg-demon-red";
      default:
        return "bg-charcoal";
    }
  };

  const getMarketOutlookInfo = (outlook) => {
    switch (outlook.toLowerCase()) {
      case "positive":
        return { icon: TrendingUp, color: "text-tanjiro-green" };
      case "neutral":
        return { icon: LineChart, color: "text-zenitsu-yellow" };
      case "negative":
        return { icon: TrendingDown, color: "text-demon-red" };
      default:
        return { icon: LineChart, color: "text-charcoal" };
    }
  };

  const OutlookIcon = getMarketOutlookInfo(safeInsights.marketOutlook).icon;
  const outlookColor = getMarketOutlookInfo(safeInsights.marketOutlook).color;

  // Format dates using date-fns
  const lastUpdatedDate = format(new Date(safeInsights.lastUpdated), "dd/MM/yyyy");
  const nextUpdateDistance = formatDistanceToNow(
    new Date(safeInsights.nextUpdate),
    { addSuffix: true }
  );

  return (
    <>
      <div className="space-y-6">
        {/* Last Updated Badge */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border-3 border-black rounded-lg shadow-neu-sm">
            <Clock className="h-4 w-4 text-tanjiro-green" />
            <span className="text-sm font-bold text-charcoal">Last updated: {lastUpdatedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={async () => {
                try {
                  const btn = document.activeElement;
                  btn?.setAttribute('disabled','true');
                  btn?.classList.add('opacity-60');
                  const res = await fetch('/api/insights/refresh', { method: 'POST' });
                  if (!res.ok) throw new Error('Refresh failed');
                  // reload to fetch updated server-rendered data
                  window.location.reload();
                } catch (err) {
                  console.error('Refresh error', err);
                  alert('Failed to refresh insights. Check console for details.');
                }
              }}
              variant="secondary"
              className="text-sm font-bold"
            >
              Refresh insights
            </Button>
          </div>
        </div>

        {/* Market Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-cream hover:bg-white transition-colors group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base font-black text-charcoal">
                Market Outlook
              </CardTitle>
              <div className="w-12 h-12 rounded-lg bg-tanjiro-green border-3 border-black flex items-center justify-center shadow-neu-sm group-hover:shadow-neu transition-all">
                <OutlookIcon className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-charcoal mb-2">{safeInsights.marketOutlook}</div>
              <p className="text-sm font-medium text-charcoal/60">
                Next update {nextUpdateDistance}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-cream hover:bg-white transition-colors group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base font-black text-charcoal">
                Industry Growth
              </CardTitle>
              <div className="w-12 h-12 rounded-lg bg-earthy-orange border-3 border-black flex items-center justify-center shadow-neu-sm group-hover:shadow-neu transition-all">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-charcoal mb-3">
                {safeInsights.growthRate.toFixed(1)}%
              </div>
              <Progress value={safeInsights.growthRate} className="h-3" />
            </CardContent>
          </Card>

          <Card className="bg-cream hover:bg-white transition-colors group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base font-black text-charcoal">Demand Level</CardTitle>
              <div className="w-12 h-12 rounded-lg bg-demon-red border-3 border-black flex items-center justify-center shadow-neu-sm group-hover:shadow-neu transition-all">
                <Target className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-charcoal mb-3">{safeInsights.demandLevel}</div>
              <div
                className={`h-3 w-full rounded-full border-2 border-black ${getDemandLevelColor(
                  safeInsights.demandLevel
                )}`}
              />
            </CardContent>
          </Card>

          <Card className="bg-cream hover:bg-white transition-colors group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base font-black text-charcoal">Top Skills</CardTitle>
              <div className="w-12 h-12 rounded-lg bg-nezuko-pink border-3 border-black flex items-center justify-center shadow-neu-sm group-hover:shadow-neu transition-all">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {safeInsights.topSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="font-bold">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Salary Ranges Chart */}
        <Card className="col-span-4 bg-cream">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg bg-zenitsu-yellow border-3 border-black flex items-center justify-center shadow-neu-sm">
                <BriefcaseIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black text-charcoal">Salary Ranges by Role</CardTitle>
                <CardDescription className="text-base font-medium">
                  Displaying minimum, median, and maximum salaries (in thousands)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-white border-3 border-black rounded-lg p-4">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salaryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1b1b1b" strokeOpacity={0.1} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#1b1b1b', fontWeight: 600 }}
                      stroke="#1b1b1b"
                    />
                    <YAxis 
                      tick={{ fill: '#1b1b1b', fontWeight: 600 }}
                      stroke="#1b1b1b"
                      tickFormatter={(val) => `₹${Math.round(val)}`}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white border-3 border-black rounded-lg p-3 shadow-neu">
                              <p className="font-black text-charcoal mb-2">{label}</p>
                              {payload.map((item, idx) => (
                                <p key={item.name} className="text-sm font-bold text-charcoal">
                                  {item.name}: ₹{Math.round(item.value)}K
                                </p>
                              ))}
                            </div>
                          );
                        }
                        return (
                          <div className="bg-white border-3 border-black rounded-lg p-3 shadow-neu">
                            <p className="font-black text-charcoal mb-2">No data available</p>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="min" fill="#4f7942" name="Min Salary (K)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="median" fill="#1a4d2e" name="Median Salary (K)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="max" fill="#c1121f" name="Max Salary (₹K)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Industry Trends */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-cream">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-lg bg-tanjiro-green border-3 border-black flex items-center justify-center shadow-neu-sm">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black text-charcoal">Key Industry Trends</CardTitle>
                  <CardDescription className="font-medium">
                    Current trends shaping the industry
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-white border-3 border-black rounded-lg p-4">
                <ul className="space-y-3">
                  {safeInsights.keyTrends.map((trend, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-cream rounded-lg border-2 border-black">
                      <div className="h-6 w-6 mt-0.5 rounded-full bg-tanjiro-green border-2 border-black flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-black text-xs">{index + 1}</span>
                      </div>
                      <span className="text-sm md:text-base font-medium text-charcoal leading-relaxed">{trend}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-cream">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-lg bg-demon-red border-3 border-black flex items-center justify-center shadow-neu-sm">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black text-charcoal">Recommended Skills</CardTitle>
                  <CardDescription className="font-medium">Skills to consider developing</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-white border-3 border-black rounded-lg p-4">
                <div className="flex flex-wrap gap-3">
                  {safeInsights.recommendedSkills.map((skill) => (
                    <Badge 
                      key={skill} 
                      variant="outline" 
                      className="text-sm font-bold px-4 py-2 border-2 hover:bg-tanjiro-green hover:text-white hover:border-tanjiro-green transition-colors"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Chatbot Button */}
      <Button
        onClick={() => setChatbotOpen(true)}
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
      >
        <Bot className="h-6 w-6" />
      </Button>

      {/* Chatbot Dialog */}
      <Chatbot open={chatbotOpen} onOpenChange={setChatbotOpen} />
    </>
  );
};

export default DashboardView;
