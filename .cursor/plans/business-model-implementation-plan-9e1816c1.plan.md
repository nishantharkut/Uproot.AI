<!-- 9e1816c1-9959-43c0-9594-25559135299d a6f9b4b4-78b0-4cdf-8486-771ef901ee4d -->
# Business Model Implementation Plan for UPROOT

## Overview

Transform UPROOT from a free unlimited platform into a sustainable freemium SaaS with subscription tiers, usage limits, payment processing, and premium features.

## Current State Analysis

**Existing Features (All Unlimited & Free):**

- Resume Builder (AI-powered ATS optimization)
- Cover Letter Generator (GPT-4)
- Interview Quiz System (GPT-4o-mini)
- Industry Insights Dashboard
- Scheduled Call Automation
- AI Career Chatbot (GPT-4)

**Missing Infrastructure:**

- No subscription/payment system
- No usage tracking/limits
- No feature gating
- No billing management

## Proposed Business Model: Freemium with Tiered Subscriptions

### Subscription Tiers

**1. Free Tier (Lead Generation)**

- 3 cover letters/month
- 5 interview quizzes/month
- 1 resume creation
- Basic industry insights
- Limited chatbot messages (50/month)
- Basic scheduled calls (2/month)
- No export features

**2. Basic Tier ($9.99/month)**

- 10 cover letters/month
- Unlimited interview quizzes
- Unlimited resume versions
- Advanced industry insights with trends
- Unlimited chatbot access
- 5 scheduled calls/month
- PDF export

**3. Pro Tier ($19.99/month)**

- Unlimited cover letters
- Unlimited quizzes + detailed analytics
- Unlimited resumes + multiple formats
- Premium industry insights (salary negotiations, market forecasts)
- Priority AI processing (faster responses)
- Unlimited scheduled calls
- All export formats (PDF, Word, HTML)
- Interview performance tracking & insights
- Resume ATS scoring & optimization tips

**4. Enterprise Tier ($49.99/month - Future)**

- Everything in Pro
- Team management
- Bulk operations
- API access
- Custom integrations
- Dedicated support

## Implementation Components

### 1. Database Schema Extensions

**New Prisma Models:**

- `Subscription` model (user subscription status, tier, billing cycle, renewal date, Stripe subscription ID)
- `UsageTracking` model (track AI calls, feature usage per user/month)
- `Payment` model (transaction history, invoices, similar to W3nity pattern)
- Add `subscriptionId`, `tier`, `stripeCustomerId` to User model

**Files to modify:**

- `prisma/schema.prisma` - Add subscription, usage, and payment models

### 2. Stripe Integration (Following W3nity Pattern)

**Stripe Setup Requirements:**

- Create Stripe Products & Prices in Stripe Dashboard or via API
- Basic Tier: $9.99/month (price ID: price_basic_monthly)
- Pro Tier: $19.99/month (price ID: price_pro_monthly)
- Store price IDs in environment variables or config
- Configure webhook endpoint in Stripe Dashboard
- Set up Stripe Customer Portal settings

**Backend API Routes:**

- `src/app/api/stripe/webhook/route.js` - Handle Stripe webhook events:
- `checkout.session.completed` - New subscription created
- `customer.subscription.created` - Subscription activated
- `customer.subscription.updated` - Tier changes, renewals
- `customer.subscription.deleted` - Cancellation
- `invoice.payment_succeeded` - Payment successful
- `invoice.payment_failed` - Payment failed
- `src/app/api/stripe/create-checkout/route.js` - Create subscription checkout session (mode: 'subscription')
- `src/app/api/stripe/customer-portal/route.js` - Generate customer portal session for billing management
- `src/app/api/stripe/verify-subscription/route.js` - Verify subscription status after redirect
- `src/lib/stripe.js` - Stripe client initialization (similar to W3nity pattern)

**Frontend Integration:**

- Install `@stripe/stripe-js` package in `package.json`
- `src/lib/stripe-client.js` - Load Stripe.js with `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (like W3nity's `loadStripe`)
- Subscription checkout button component (`src/components/subscription-button.jsx`)
- Success/Cancel pages:
- `src/app/(main)/subscription/success/page.jsx` - Subscription success handler (like PaymentSuccessPage)
- `src/app/(main)/subscription/cancel/page.jsx` - Subscription cancellation handler (like PaymentCancelPage)
- Subscription status checking utilities

### 3. Usage Tracking System

**Middleware for Feature Access:**

- Check subscription tier before AI operations
- Track usage in real-time (increment counters)
- Enforce limits with user-friendly error messages
- Reset monthly usage counters

**Files to modify:**

- `src/actions/cover-letter.js` - Add usage check before generation
- `src/actions/interview.js` - Add usage check before quiz generation
- `src/app/api/chat/route.js` - Add usage check for chatbot
- `src/lib/usage-tracker.js` - New utility for usage management

### 4. Subscription Management UI

**New Components:**

- Pricing page (`src/app/(main)/pricing/page.jsx`)
- Subscription dashboard (`src/app/(main)/settings/subscription/page.jsx`)
- Usage meter components (show remaining usage)
- Upgrade prompts when limits reached

**Files to create:**

- `src/app/(main)/pricing/page.jsx` - Pricing page with tier comparison
- `src/app/(main)/settings/subscription/_components/subscription-card.jsx` - Current plan display
- `src/app/(main)/settings/subscription/_components/usage-meters.jsx` - Usage tracking UI
- `src/components/upgrade-prompt.jsx` - Reusable upgrade modal

### 5. Feature Gating & UI Updates

**Add Restrictions:**

- Show "Upgrade to Pro" badges on premium features
- Disable buttons when limits reached
- Show usage meters in dashboard
- Add upgrade CTAs strategically

**Files to modify:**

- `src/app/(main)/dashboard/_component/dashboard-view.jsx` - Add usage meters
- `src/app/(main)/ai-cover-letter/_components/cover-letter-generator.jsx` - Add limit checks
- `src/app/(main)/interview/_components/quiz-list.jsx` - Add upgrade prompts
- All action files - Add subscription checks

### 6. Subscription Actions

**Server Actions:**

- `src/actions/subscription.js` - Create, update, cancel subscriptions
- `src/actions/usage.js` - Track and check usage limits
- Helper functions for tier-based feature access

### 7. Email Notifications

**Automated Emails (via Resend):**

- Welcome email with tier benefits
- Usage limit warnings (80%, 100%)
- Subscription renewal reminders
- Upgrade prompts after limit reached

## Additional Monetization Features (Future)

### 8. One-Time Purchases

- Resume templates marketplace ($4.99 each)
- Interview question packs by industry ($9.99)
- Cover letter templates ($2.99 each)

### 9. Referral Program

- Credit system: Refer a friend, both get 1 month Pro free
- Referral tracking in database

### 10. Analytics & Admin Dashboard

- Revenue analytics
- User conversion funnel
- Feature usage statistics
- Churn analysis

## Implementation Priority

**Phase 1 (Core Monetization):**

1. Database schema for subscriptions & usage
2. Stripe integration & payment processing
3. Basic usage tracking middleware
4. Subscription management UI
5. Feature gating on existing features

**Phase 2 (Enhancement):**

6. Pricing page & marketing
7. Usage meters & upgrade prompts
8. Email notifications
9. Customer portal

**Phase 3 (Optimization):**

10. Analytics dashboard
11. Referral program
12. Template marketplace

## Technical Considerations

- **Environment Variables Needed:**
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PUBLISHABLE_KEY` (for frontend)

- **Database Migrations:**
- Create subscription tables
- Add indexes for performance
- Migration scripts for existing users (default to Free tier)

- **Error Handling:**
- Graceful degradation when Stripe is down
- Clear error messages for payment failures
- Usage limit reached notifications

- **Security:**
- Verify Stripe webhook signatures
- Server-side usage validation (never trust client)
- Rate limiting on API routes