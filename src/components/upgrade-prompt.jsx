"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles, ArrowUpRight, X } from "lucide-react";
import Link from "next/link";

const UpgradePrompt = ({ 
  isOpen, 
  onClose, 
  featureName, 
  currentTier = "Free",
  requiredTier = "Pro" 
}) => {
  const getTierInfo = (tier) => {
    const tiers = {
      Basic: {
        name: "Basic",
        price: "$9.99",
        icon: Sparkles,
        bgColor: "bg-tanjiro-green",
        textColor: "text-tanjiro-green",
        borderColor: "border-tanjiro-green",
        bgColorLight: "bg-tanjiro-green/10",
        benefits: [
          "10 cover letters/month",
          "Unlimited interview quizzes",
          "Unlimited resume versions",
          "Advanced industry insights",
        ],
      },
      Pro: {
        name: "Pro",
        price: "$19.99",
        icon: Crown,
        bgColor: "bg-demon-red",
        textColor: "text-demon-red",
        borderColor: "border-demon-red",
        bgColorLight: "bg-demon-red/10",
        benefits: [
          "Unlimited cover letters",
          "Unlimited quizzes + analytics",
          "Unlimited resumes + formats",
          "Premium insights & forecasts",
          "Priority AI processing",
          "All export formats",
        ],
      },
    };
    return tiers[tier] || tiers.Pro;
  };

  const tierInfo = getTierInfo(requiredTier);
  const TierIcon = tierInfo.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-cream border-4 border-black shadow-neu-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-3xl font-black text-charcoal">
              Upgrade Required
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <DialogDescription className="text-base font-medium text-charcoal/80 pt-2">
            {featureName} is only available on the {requiredTier} plan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Feature Locked Message */}
          <div className="p-6 bg-white border-3 border-black rounded-lg">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-lg ${tierInfo.bgColor} border-3 border-black flex items-center justify-center shadow-neu-sm flex-shrink-0`}>
                <TierIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-xl text-charcoal mb-2">
                  Unlock {featureName}
                </h3>
                <p className="text-charcoal/80 font-medium">
                  You&apos;re currently on the <strong>{currentTier}</strong> plan. 
                  Upgrade to <strong>{requiredTier}</strong> to access this feature and many more!
                </p>
              </div>
            </div>
          </div>

          {/* Tier Highlight */}
          <div className={`p-6 ${tierInfo.bgColorLight} border-3 ${tierInfo.borderColor} rounded-lg`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <TierIcon className={`h-8 w-8 ${tierInfo.textColor}`} />
                <div>
                  <h3 className="font-black text-2xl text-charcoal">{tierInfo.name} Plan</h3>
                  <p className="text-lg font-bold text-charcoal">
                    {tierInfo.price}<span className="text-base font-medium">/month</span>
                  </p>
                </div>
              </div>
              <Badge className={`${tierInfo.bgColor} text-cream border-3 border-black px-4 py-2 text-sm font-bold shadow-neu-sm`}>
                RECOMMENDED
              </Badge>
            </div>
            <ul className="space-y-2 mb-6">
              {tierInfo.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full ${tierInfo.bgColor} border-2 border-black flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white text-xs font-black">✓</span>
                  </div>
                  <span className="text-charcoal font-medium">{benefit}</span>
                </li>
              ))}
            </ul>
            <Link href="/pricing" onClick={onClose}>
              <Button 
                className={`w-full h-12 text-base font-bold ${tierInfo.bgColor} hover:opacity-90`}
              >
                Upgrade to {tierInfo.name}
                <ArrowUpRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Alternative: View All Plans */}
          <div className="text-center">
            <Link href="/pricing" onClick={onClose}>
              <Button variant="outline" className="font-bold">
                View All Pricing Plans
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradePrompt;
