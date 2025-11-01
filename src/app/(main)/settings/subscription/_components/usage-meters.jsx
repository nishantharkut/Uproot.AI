"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PenBox,
  GraduationCap,
  FileText,
  MessageSquare,
  Phone,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import Link from "next/link";

const tierLimits = {
  Free: {
    coverLetters: 3,
    interviewQuizzes: 5,
    resumes: 1,
    chatbotMessages: 50,
    scheduledCalls: 2,
  },
  Basic: {
    coverLetters: 10,
    interviewQuizzes: Infinity,
    resumes: Infinity,
    chatbotMessages: Infinity,
    scheduledCalls: 5,
  },
  Pro: {
    coverLetters: Infinity,
    interviewQuizzes: Infinity,
    resumes: Infinity,
    chatbotMessages: Infinity,
    scheduledCalls: Infinity,
  },
};

const UsageMeters = ({ currentTier = "Free" }) => {
  const limits = tierLimits[currentTier] || tierLimits.Free;
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsage() {
      try {
        const response = await fetch("/api/usage/current");
        if (!response.ok) {
          throw new Error("Failed to load usage");
        }
        const usageData = await response.json();
        setUsage({
          coverLetters: usageData.usage.coverLetters,
          interviewQuizzes: usageData.usage.interviewQuizzes,
          resumes: usageData.usage.resumes,
          chatbotMessages: usageData.usage.chatbotMessages,
          scheduledCalls: usageData.usage.scheduledCalls,
        });
      } catch (error) {
        console.error("Error loading usage:", error);
        // Fallback to empty usage on error
        setUsage({
          coverLetters: { used: 0, limit: limits.coverLetters },
          interviewQuizzes: { used: 0, limit: limits.interviewQuizzes },
          resumes: { used: 0, limit: limits.resumes },
          chatbotMessages: { used: 0, limit: limits.chatbotMessages },
          scheduledCalls: { used: 0, limit: limits.scheduledCalls },
        });
      } finally {
        setLoading(false);
      }
    }
    loadUsage();
  }, [currentTier, limits]);

  if (loading || !usage) {
    return (
      <Card className="bg-cream border-4 border-black shadow-neu">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-tanjiro-green" />
          <p className="text-sm text-charcoal/70 font-medium">Loading usage data...</p>
        </CardContent>
      </Card>
    );
  }

  const usageItems = [
    {
      id: "coverLetters",
      icon: PenBox,
      label: "Cover Letters",
      used: usage.coverLetters.used,
      limit: limits.coverLetters,
      bgColor: "bg-tanjiro-green",
    },
    {
      id: "interviewQuizzes",
      icon: GraduationCap,
      label: "Interview Quizzes",
      used: usage.interviewQuizzes.used,
      limit: limits.interviewQuizzes,
      bgColor: "bg-zenitsu-yellow",
    },
    {
      id: "resumes",
      icon: FileText,
      label: "Resumes",
      used: usage.resumes.used,
      limit: limits.resumes,
      bgColor: "bg-earthy-orange",
    },
    {
      id: "chatbotMessages",
      icon: MessageSquare,
      label: "Chatbot Messages",
      used: usage.chatbotMessages.used,
      limit: limits.chatbotMessages,
      bgColor: "bg-nezuko-pink",
    },
    {
      id: "scheduledCalls",
      icon: Phone,
      label: "Scheduled Calls",
      used: usage.scheduledCalls.used,
      limit: limits.scheduledCalls,
      bgColor: "bg-demon-red",
    },
  ];

  const getUsagePercentage = (used, limit) => {
    if (limit === Infinity) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageStatus = (used, limit) => {
    if (limit === Infinity) return "unlimited";
    const percentage = getUsagePercentage(used, limit);
    if (percentage >= 100) return "exceeded";
    if (percentage >= 80) return "warning";
    return "normal";
  };

  const formatLimit = (limit) => {
    if (limit === Infinity) return "Unlimited";
    return limit.toString();
  };

  return (
    <Card className="bg-cream border-4 border-black shadow-neu">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-black text-charcoal mb-2">
              Usage This Month
            </CardTitle>
            <CardDescription className="text-base font-medium">
              Track your feature usage and limits
            </CardDescription>
          </div>
          <Badge className="bg-charcoal text-cream border-3 border-black px-3 py-1 text-xs font-bold">
            Resets monthly
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {usageItems.map((item) => {
          const status = getUsageStatus(item.used, item.limit);
          const percentage = getUsagePercentage(item.used, item.limit);
          const isUnlimited = item.limit === Infinity;

          return (
            <div
              key={item.id}
              className="p-4 bg-white border-3 border-black rounded-lg space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg ${item.bgColor} border-3 border-black flex items-center justify-center shadow-neu-sm`}
                  >
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-charcoal">{item.label}</h3>
                    <p className="text-sm text-charcoal/70 font-medium">
                      {item.used} / {formatLimit(item.limit)} used
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {status === "exceeded" && (
                    <Badge className="bg-demon-red text-cream border-2 border-black text-xs font-bold">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Limit Reached
                    </Badge>
                  )}
                  {status === "warning" && (
                    <Badge className="bg-earthy-orange text-charcoal border-2 border-black text-xs font-bold">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Almost Full
                    </Badge>
                  )}
                  {isUnlimited && (
                    <Badge className="bg-tanjiro-green text-cream border-2 border-black text-xs font-bold">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Unlimited
                    </Badge>
                  )}
                </div>
              </div>

              {!isUnlimited && (
                <>
                  <Progress value={percentage} className="h-4" />
                  {status === "exceeded" && (
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-sm font-medium text-demon-red">
                        You&apos;ve reached your limit for this month
                      </p>
                      {currentTier !== "Pro" && (
                        <Link href="/pricing">
                          <Button size="sm" className="h-8 text-xs font-bold">
                            Upgrade
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                  {status === "warning" && (
                    <p className="text-sm font-medium text-earthy-orange">
                      You&apos;re using {percentage.toFixed(0)}% of your monthly limit
                    </p>
                  )}
                </>
              )}
            </div>
          );
        })}

        {/* Upgrade CTA for Free/Basic tiers */}
        {currentTier !== "Pro" && (
          <div className="p-6 bg-tanjiro-green/10 border-3 border-tanjiro-green rounded-lg">
            <div className="flex items-start gap-4">
              <TrendingUp className="h-6 w-6 text-tanjiro-green flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-black text-lg text-charcoal mb-2">
                  Need More? Upgrade to Pro!
                </h3>
                <p className="text-charcoal/80 font-medium mb-4">
                  Unlock unlimited access to all features and priority AI processing.
                </p>
                <Link href="/pricing">
                  <Button className="font-bold">
                    View Pricing Plans
                    <TrendingUp className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UsageMeters;
