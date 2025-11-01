"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  Sparkles, 
  Zap, 
  Crown, 
  FileText, 
  PenBox, 
  GraduationCap, 
  MessageSquare,
  Phone,
  Download,
  TrendingUp,
  BarChart3,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      { icon: PenBox, text: "3 cover letters/month", included: true },
      { icon: GraduationCap, text: "5 interview quizzes/month", included: true },
      { icon: FileText, text: "1 resume creation", included: true },
      { icon: BarChart3, text: "Basic industry insights", included: true },
      { icon: MessageSquare, text: "50 chatbot messages/month", included: true },
      { icon: Phone, text: "2 scheduled calls/month", included: true },
      { icon: Download, text: "Export features", included: false },
    ],
    color: "cream",
    borderColor: "border-charcoal",
    buttonVariant: "outline",
    popular: false,
  },
  {
    name: "Basic",
    price: "$9.99",
    period: "month",
    description: "For active job seekers",
    features: [
      { icon: PenBox, text: "10 cover letters/month", included: true },
      { icon: GraduationCap, text: "Unlimited interview quizzes", included: true },
      { icon: FileText, text: "Unlimited resume versions", included: true },
      { icon: TrendingUp, text: "Advanced industry insights with trends", included: true },
      { icon: MessageSquare, text: "Unlimited chatbot access", included: true },
      { icon: Phone, text: "5 scheduled calls/month", included: true },
      { icon: Download, text: "PDF export", included: true },
    ],
    color: "tanjiro-green",
    borderColor: "border-tanjiro-green",
    buttonVariant: "default",
    popular: true,
  },
  {
    name: "Pro",
    price: "$19.99",
    period: "month",
    description: "For serious career growth",
    features: [
      { icon: PenBox, text: "Unlimited cover letters", included: true },
      { icon: GraduationCap, text: "Unlimited quizzes + detailed analytics", included: true },
      { icon: FileText, text: "Unlimited resumes + multiple formats", included: true },
      { icon: TrendingUp, text: "Premium insights (salary negotiations, forecasts)", included: true },
      { icon: Zap, text: "Priority AI processing (faster responses)", included: true },
      { icon: Phone, text: "Unlimited scheduled calls", included: true },
      { icon: Download, text: "All export formats (PDF, Word, HTML)", included: true },
      { icon: BarChart3, text: "Interview performance tracking & insights", included: true },
      { icon: Sparkles, text: "Resume ATS scoring & optimization tips", included: true },
    ],
    color: "demon-red",
    borderColor: "border-demon-red",
    buttonVariant: "destructive",
    popular: false,
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState(null);

  const getPriceId = (tier) => {
    // Get price IDs from environment variables
    // These should be set in your .env.local file
    const priceIds = {
      Basic: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC,
      Pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO,
    };
    return priceIds[tier];
  };

  const handleSubscribe = async (tier) => {
    if (tier === "Free") return;

    const priceId = getPriceId(tier);
    
    if (!priceId) {
      toast.error(
        `Stripe price ID for ${tier} plan is not configured. Please contact support.`
      );
      return;
    }

    setLoading(tier);

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          tier,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Failed to start checkout. Please try again.");
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 bg-gradient-to-b from-cream to-white">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <Badge className="mb-6 px-6 py-2.5 text-base font-black border-3 border-black bg-tanjiro-green text-cream shadow-neu-sm">
            Choose Your Plan
          </Badge>
          <h1 className="logo-font text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-charcoal mb-4 md:mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-charcoal/80 max-w-3xl mx-auto font-semibold leading-relaxed px-4">
            Start free and upgrade as you grow. All plans include access to our AI-powered career tools.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16">
          {pricingTiers.map((tier) => {
            const bgColor = tier.color === "cream" ? "bg-white" : tier.color === "tanjiro-green" ? "bg-white" : "bg-white";
            const headerBgColor = tier.color === "cream" ? "bg-cream" : tier.color === "tanjiro-green" ? "bg-tanjiro-green" : "bg-demon-red";
            return (
            <Card
              key={tier.name}
              className={`relative ${bgColor} border-4 ${tier.borderColor} transition-all duration-300 ${
                tier.popular
                  ? "scale-105 md:scale-110 shadow-neu-lg hover:shadow-neu border-tanjiro-green"
                  : "shadow-neu hover:shadow-neu-lg hover:scale-105"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-demon-red text-cream border-4 border-black px-6 py-2 text-sm font-black shadow-neu uppercase tracking-wide">
                    MOST POPULAR
                  </Badge>
                </div>
              )}

              {/* Header with colored background */}
              <div className={`${headerBgColor} ${tier.name === "Free" ? "text-charcoal" : "text-cream"} border-b-4 border-black px-8 py-8 md:py-10`}>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-3 md:mb-4">
                    {tier.name === "Pro" && <Crown className="h-7 w-7 md:h-8 md:w-8 mr-3" />}
                    {tier.name === "Basic" && <Sparkles className="h-7 w-7 md:h-8 md:w-8 mr-3" />}
                    <CardTitle className={`text-3xl md:text-4xl font-black ${tier.name === "Free" ? "text-charcoal" : "text-cream"}`}>
                      {tier.name}
                    </CardTitle>
                  </div>
                  <div className="flex items-baseline justify-center gap-2 mb-3">
                    <span className={`text-5xl md:text-6xl lg:text-7xl font-black ${tier.name === "Free" ? "text-charcoal" : "text-cream"}`}>
                      {tier.price}
                    </span>
                    <span className={`text-lg md:text-xl ${tier.name === "Free" ? "text-charcoal/70" : "text-cream/90"} font-semibold`}>
                      /{tier.period}
                    </span>
                  </div>
                  <CardDescription className={`text-base md:text-lg font-semibold ${tier.name === "Free" ? "text-charcoal/80" : "text-cream/95"}`}>
                    {tier.description}
                  </CardDescription>
                </div>
              </div>

              <CardHeader className="hidden">
                <CardTitle></CardTitle>
                <CardDescription></CardDescription>
              </CardHeader>

              <CardContent className="px-6 md:px-8 py-6 md:py-8 space-y-6">
                <ul className="space-y-3 md:space-y-4">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 md:gap-4">
                      <div
                        className={`flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full border-3 border-black flex items-center justify-center shadow-neu-sm ${
                          feature.included
                            ? "bg-tanjiro-green text-cream"
                            : "bg-charcoal/10 text-charcoal/30"
                        }`}
                      >
                        {feature.included ? (
                          <Check className="h-4 w-4 md:h-5 md:w-5" />
                        ) : (
                          <span className="text-xs md:text-sm font-black">✕</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 md:gap-3 flex-1 pt-0.5">
                        <feature.icon className={`h-5 w-5 md:h-6 md:w-6 flex-shrink-0 ${feature.included ? "text-charcoal" : "text-charcoal/30"}`} />
                        <span
                          className={`text-sm md:text-base font-semibold ${
                            feature.included ? "text-charcoal" : "text-charcoal/50 line-through"
                          }`}
                        >
                          {feature.text}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="pt-4">
                  <Button
                    variant={tier.buttonVariant}
                    className={`w-full h-14 md:h-16 text-base md:text-lg font-black uppercase tracking-wide shadow-neu ${
                      tier.name === "Free" 
                        ? "cursor-not-allowed opacity-50" 
                        : tier.name === "Basic"
                        ? "bg-tanjiro-green hover:bg-tanjiro-green/90 text-cream"
                        : "bg-demon-red hover:bg-demon-red/90 text-cream"
                    }`}
                    onClick={() => handleSubscribe(tier.name)}
                    disabled={tier.name === "Free" || loading === tier.name}
                  >
                    {loading === tier.name ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : tier.name === "Free" ? (
                      "Current Plan"
                    ) : (
                      `Subscribe to ${tier.name}`
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-cream border-4 border-black shadow-neu">
            <CardHeader>
              <CardTitle className="text-3xl font-black text-charcoal text-center">
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-white border-3 border-black rounded-lg">
                  <h3 className="font-black text-lg text-charcoal mb-2">
                    Can I change my plan later?
                  </h3>
                  <p className="text-charcoal/80 font-medium">
                    Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
                  </p>
                </div>
                <div className="p-4 bg-white border-3 border-black rounded-lg">
                  <h3 className="font-black text-lg text-charcoal mb-2">
                    What happens if I exceed my limits?
                  </h3>
                  <p className="text-charcoal/80 font-medium">
                    You&apos;ll receive a notification when you&apos;re close to your limit. Upgrade anytime for more features!
                  </p>
                </div>
                <div className="p-4 bg-white border-3 border-black rounded-lg">
                  <h3 className="font-black text-lg text-charcoal mb-2">
                    Do you offer refunds?
                  </h3>
                  <p className="text-charcoal/80 font-medium">
                    We offer a 30-day money-back guarantee. If you&apos;re not satisfied, contact us for a full refund.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
