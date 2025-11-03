import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/interview(.*)",
  "/ai-cover-letter(.*)",
  "/onboarding(.*)",
  "/settings(.*)",
  "/resume(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Don't return early - let Clerk process all routes for handshake/session management
  // Only apply protection logic to protected routes
  
  // Exclude public resume routes from protection
  const pathname = req.nextUrl.pathname;
  const isPublicResume = pathname.startsWith("/resume/public");
  
  // Protect routes that match the pattern, but skip public resume routes
  if (isProtectedRoute(req) && !isPublicResume) {
    await auth.protect();
  }
  // Public routes (including /resume/public) are allowed through without protection
});

export const config = {
  matcher: [
    /*
     * Clerk's recommended matcher pattern from official docs
     * Skip Next.js internals and all static files
     * Clerk handles its internal API routes automatically
     */
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
