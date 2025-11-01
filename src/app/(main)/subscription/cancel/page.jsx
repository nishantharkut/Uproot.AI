"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function SubscriptionCancelPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 bg-gradient-to-b from-cream to-white">
      <div className="container mx-auto max-w-3xl">
        <Card className="bg-white border-4 border-charcoal shadow-neu-lg">
          <CardHeader className="text-center px-8 py-10 md:py-12">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-charcoal/10 border-4 border-charcoal flex items-center justify-center shadow-neu">
                <XCircle className="h-14 w-14 md:h-16 md:w-16 text-charcoal" />
              </div>
            </div>
            <CardTitle className="text-3xl md:text-4xl lg:text-5xl font-black text-charcoal mb-4">
              Checkout Cancelled
            </CardTitle>
            <CardDescription className="text-lg md:text-xl font-semibold text-charcoal/80">
              Your subscription was not processed. No charges were made.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-10 md:pb-12 space-y-8">
            <div className="p-6 md:p-8 bg-cream border-3 border-black rounded-xl">
              <h3 className="font-black text-xl md:text-2xl text-charcoal mb-4">
                No Worries!
              </h3>
              <p className="text-charcoal/80 font-semibold text-base md:text-lg mb-6">
                You can try again anytime. We&apos;re here to help you grow your career with our AI-powered tools.
              </p>
              <ul className="space-y-3 text-charcoal/70 font-semibold text-base md:text-lg">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-tanjiro-green border-2 border-black flex items-center justify-center flex-shrink-0">
                    <span className="text-cream font-black text-sm">•</span>
                  </div>
                  No payment was processed
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-tanjiro-green border-2 border-black flex items-center justify-center flex-shrink-0">
                    <span className="text-cream font-black text-sm">•</span>
                  </div>
                  You can subscribe anytime
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-tanjiro-green border-2 border-black flex items-center justify-center flex-shrink-0">
                    <span className="text-cream font-black text-sm">•</span>
                  </div>
                  Your free tier access remains active
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/pricing" className="flex-1">
                <Button className="w-full h-14 md:h-16 text-base md:text-lg font-black uppercase tracking-wide shadow-neu bg-tanjiro-green hover:bg-tanjiro-green/90 text-cream">
                  <RefreshCw className="h-5 w-5 md:h-6 md:w-6 mr-2" />
                  Try Again
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full h-14 md:h-16 text-base md:text-lg font-black uppercase tracking-wide">
                  <ArrowLeft className="h-5 w-5 md:h-6 md:w-6 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
