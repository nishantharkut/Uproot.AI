"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles, ArrowRight, Home, Settings } from "lucide-react";
import Link from "next/link";

function SubscriptionSuccessContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    async function verifySubscription() {
      if (!sessionId) {
        setLoading(false);
        setError("No session ID provided");
        return;
      }

      try {
        // Verify the checkout session and create subscription
        const response = await fetch("/api/stripe/verify-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to verify subscription");
        }

        console.log("Subscription verified:", data);
        setLoading(false);
      } catch (error) {
        console.error("Error verifying subscription:", error);
        setError(error.message);
        setLoading(false);
      }
    }

    verifySubscription();
  }, [sessionId]);

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 bg-gradient-to-b from-cream to-white">
      <div className="container mx-auto max-w-3xl">
        <Card className="bg-white border-4 border-tanjiro-green shadow-neu-lg">
          <CardHeader className="text-center px-8 py-10 md:py-12">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-tanjiro-green border-4 border-black flex items-center justify-center shadow-neu">
                <CheckCircle2 className="h-14 w-14 md:h-16 md:w-16 text-cream" />
              </div>
            </div>
            <CardTitle className="text-3xl md:text-4xl lg:text-5xl font-black text-charcoal mb-4">
              Welcome to Your New Plan!
            </CardTitle>
            <CardDescription className="text-lg md:text-xl font-semibold text-charcoal/80">
              {loading ? (
                "Verifying your subscription..."
              ) : error ? (
                "There was an issue verifying your subscription. Please check your subscription status."
              ) : (
                "Your subscription has been successfully activated."
              )}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-10 md:pb-12 space-y-8">
            {error && (
              <div className="p-6 bg-demon-red/10 border-3 border-demon-red rounded-xl">
                <p className="font-semibold text-demon-red mb-2">Verification Error</p>
                <p className="text-charcoal/80 text-sm">{error}</p>
                <p className="text-charcoal/60 text-xs mt-2">
                  Don't worry - if payment was successful, your subscription may still be active.
                  Check your subscription settings to verify.
                </p>
              </div>
            )}
            {!loading && !error && (
              <>
                <div className="p-6 md:p-8 bg-tanjiro-green/10 border-3 border-tanjiro-green rounded-xl">
                  <div className="flex items-start gap-4 md:gap-6">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-tanjiro-green border-3 border-black flex items-center justify-center shadow-neu-sm flex-shrink-0">
                      <Sparkles className="h-6 w-6 md:h-7 md:w-7 text-cream" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-xl md:text-2xl text-charcoal mb-4">
                        What&apos;s Next?
                      </h3>
                      <ul className="space-y-3 text-charcoal/80 font-semibold text-base md:text-lg">
                        <li className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-tanjiro-green border-2 border-black flex items-center justify-center flex-shrink-0">
                            <span className="text-cream font-black text-sm">✓</span>
                          </div>
                          Start using all your new plan features
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-tanjiro-green border-2 border-black flex items-center justify-center flex-shrink-0">
                            <span className="text-cream font-black text-sm">✓</span>
                          </div>
                          Check your usage dashboard for limits
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-tanjiro-green border-2 border-black flex items-center justify-center flex-shrink-0">
                            <span className="text-cream font-black text-sm">✓</span>
                          </div>
                          Manage your subscription anytime in settings
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/dashboard" className="flex-1">
                    <Button className="w-full h-14 md:h-16 text-base md:text-lg font-black uppercase tracking-wide shadow-neu bg-tanjiro-green hover:bg-tanjiro-green/90 text-cream">
                      <Home className="h-5 w-5 md:h-6 md:w-6 mr-2" />
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Link href="/settings/subscription" className="flex-1">
                    <Button variant="outline" className="w-full h-14 md:h-16 text-base md:text-lg font-black uppercase tracking-wide">
                      <Settings className="h-5 w-5 md:h-6 md:w-6 mr-2" />
                      Manage Subscription
                    </Button>
                  </Link>
                </div>

                {sessionId && (
                  <div className="pt-4 border-t-3 border-black">
                    <p className="text-sm text-charcoal/60 font-medium text-center">
                      Session ID: {sessionId}
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-32 pb-20 px-4 bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tanjiro-green mx-auto mb-4"></div>
          <p className="text-charcoal font-medium">Loading...</p>
        </div>
      </div>
    }>
      <SubscriptionSuccessContent />
    </Suspense>
  );
}
