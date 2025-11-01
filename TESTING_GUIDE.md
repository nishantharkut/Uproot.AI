# Testing Guide - Subscription Features

## Prerequisites

1. ✅ Stripe keys added to `.env.local`
2. ⚠️ Run database migration (if not done): `npx prisma migrate dev --name add_subscription_models`
3. ⚠️ Generate Prisma client: `npx prisma generate`
4. ⚠️ Start your dev server: `npm run dev`

## Stripe Dashboard Setup (Required Before Testing)

1. **Create Products & Prices:**
   - Go to: https://dashboard.stripe.com/test/products
   - Click "Add product"
   - Product name: "Basic Plan"
   - Pricing: $9.99/month recurring
   - Copy the Price ID (starts with `price_`)
   - Add to `.env.local`: `STRIPE_PRICE_ID_BASIC=price_xxxxx`
   - Repeat for "Pro Plan" at $19.99/month
   - Add to `.env.local`: `STRIPE_PRICE_ID_PRO=price_xxxxx`

2. **Set up Webhook (for local testing):**
   - Install Stripe CLI: https://stripe.com/docs/stripe-cli
   - Run: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
   - Copy the webhook signing secret (starts with `whsec_`)
   - Add to `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_xxxxx`

## Pages to Test

### 1. Pricing Page
**URL:** `http://localhost:3000/pricing`

**What to test:**
- ✅ View all subscription tiers (Free, Basic, Pro)
- ✅ See pricing and feature comparison
- ✅ Click "Subscribe Now" buttons (should redirect to Stripe Checkout)
- ✅ Verify current tier shows as "Current Plan" if subscribed

### 2. Subscription Success Page
**URL:** `http://localhost:3000/subscription/success?session_id=xxx`

**What to test:**
- ✅ Automatic redirect after successful Stripe checkout
- ✅ Shows success message
- ✅ Displays "What's Next" information
- ✅ Links to dashboard and settings

### 3. Subscription Cancel Page
**URL:** `http://localhost:3000/subscription/cancel`

**What to test:**
- ✅ Shown when user cancels checkout
- ✅ Provides retry option
- ✅ Links back to pricing

### 4. Subscription Settings Page
**URL:** `http://localhost:3000/settings/subscription`

**What to test:**
- ✅ View current subscription tier
- ✅ See usage statistics for current month
- ✅ Click "Manage Billing" (opens Stripe Customer Portal)
- ✅ Cancel subscription option
- ✅ Upgrade prompts if on free tier

### 5. Dashboard (with Usage Meters)
**URL:** `http://localhost:3000/dashboard`

**What to test:**
- ✅ (Optional) View usage meters if added
- ✅ Access industry insights (should work for all tiers)

### 6. Cover Letter Generator
**URL:** `http://localhost:3000/ai-cover-letter/new`

**What to test:**
- ✅ Free tier: Should limit to 3 cover letters/month
- ✅ After 3rd generation, should show error/upgrade prompt
- ✅ Basic/Pro tiers: Should allow more/unlimited

**Test card:** Use Stripe test card `4242 4242 4242 4242`

### 7. Interview Quiz
**URL:** `http://localhost:3000/interview/mock`

**What to test:**
- ✅ Free tier: Should limit to 5 quizzes/month
- ✅ After 5th quiz, should show error/upgrade prompt
- ✅ Basic/Pro tiers: Should allow unlimited

### 8. Chatbot
**URL:** Any page with chatbot widget

**What to test:**
- ✅ Free tier: Should limit to 50 messages/month
- ✅ After 50th message, should show error
- ✅ Basic/Pro tiers: Should allow unlimited

## Complete Testing Flow

### Flow 1: Subscribe to Basic Plan

1. Go to `/pricing`
2. Click "Subscribe Now" on Basic Plan
3. You'll be redirected to Stripe Checkout
4. Enter test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/25`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)
5. Click "Subscribe"
6. Should redirect to `/subscription/success`
7. Go to `/settings/subscription`
8. Verify subscription shows as "Active"
9. Check usage limits are updated (10 cover letters, unlimited quizzes, etc.)

### Flow 2: Test Usage Limits (Free Tier)

1. Make sure you're on Free tier (no subscription)
2. Go to `/ai-cover-letter/new`
3. Generate 3 cover letters (should work)
4. Try to generate 4th cover letter
5. Should show error: "You've reached your free tier limit of 3 cover letters/month"
6. Go to `/pricing` and subscribe to upgrade

### Flow 3: Test Feature Gating

1. Use free tier account
2. Try generating cover letters beyond limit
3. Try generating quizzes beyond limit
4. Try sending chatbot messages beyond limit
5. Each should show appropriate error messages
6. Errors should include upgrade prompts

### Flow 4: Cancel Subscription

1. Go to `/settings/subscription`
2. Click "Cancel Subscription"
3. Confirm cancellation
4. Subscription should show as "Cancelling"
5. Status should indicate access until period end

### Flow 5: Manage Billing

1. Go to `/settings/subscription`
2. Click "Manage Billing"
3. Should open Stripe Customer Portal
4. Can update payment method, view invoices, etc.

## API Endpoints to Test

### 1. Create Checkout Session
```bash
POST http://localhost:3000/api/stripe/create-checkout
Body: {
  "priceId": "price_xxxxx",
  "tier": "basic"
}
```

### 2. Get Pricing Data
```bash
GET http://localhost:3000/api/pricing
```

### 3. Get User Subscription
```bash
# This is a server action, call from client component
# getUserSubscription() from @/actions/subscription
```

### 4. Get Usage Stats
```bash
# This is a server action, call from client component
# getUsageStats() from @/actions/usage
```

### 5. Webhook Endpoint
```bash
# Test via Stripe CLI:
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
```

## Stripe Test Cards

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **Requires Authentication:** `4000 0027 6000 3184`

## Common Issues & Solutions

### Issue: "Price ID not found"
**Solution:** Make sure you created the products/prices in Stripe Dashboard and added the Price IDs to `.env.local`

### Issue: Webhook not working
**Solution:** 
- Make sure Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Verify `STRIPE_WEBHOOK_SECRET` in `.env.local` matches CLI output

### Issue: "Subscription not found" after checkout
**Solution:** 
- Check webhook is receiving events (Stripe CLI should show activity)
- Check server logs for webhook processing errors
- Verify database migration completed successfully

### Issue: Usage limits not working
**Solution:**
- Verify Prisma Client regenerated: `npx prisma generate`
- Check database has `UsageTracking` table
- Check server logs for usage tracking errors

## Verification Checklist

- [ ] Can view pricing page
- [ ] Can click subscribe button
- [ ] Stripe checkout opens correctly
- [ ] Can complete payment with test card
- [ ] Redirects to success page after payment
- [ ] Subscription appears in settings page
- [ ] Usage tracking works (limits enforced)
- [ ] Can manage billing via portal
- [ ] Can cancel subscription
- [ ] Webhook events processed correctly
- [ ] Database records created (Subscription, Payment tables)

## Next Steps After Testing

1. Test all error scenarios
2. Test edge cases (rapid clicks, network errors, etc.)
3. Add usage meters to dashboard (if not already done)
4. Add upgrade prompts to feature pages
5. Test email notifications (if implemented)
6. Monitor Stripe Dashboard for webhook events

