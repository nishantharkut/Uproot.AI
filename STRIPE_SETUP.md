# Stripe Subscription Setup Guide

## Environment Variables Required

Add these to your `.env.local` file:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Price IDs (from Stripe Dashboard)
STRIPE_PRICE_ID_BASIC=price_...
STRIPE_PRICE_ID_PRO=price_...

# Base URL (for webhooks and redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Or in production:
# NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Stripe Dashboard Setup

1. **Create Products & Prices:**
   - Go to Stripe Dashboard → Products
   - Create "Basic Plan" product with $9.99/month recurring price
   - Create "Pro Plan" product with $19.99/month recurring price
   - Copy the Price IDs and add them to your `.env.local`

2. **Configure Webhooks:**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Select events to listen to:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

3. **Configure Customer Portal:**
   - Go to Stripe Dashboard → Settings → Billing → Customer Portal
   - Enable portal and customize settings
   - Allow customers to:
     - Update payment methods
     - Cancel subscriptions
     - View invoice history

## Database Migration

Run the migration to create the new tables:

```bash
npx prisma migrate dev --name add_subscription_models
```

Or in production:

```bash
npx prisma migrate deploy
```

## Testing

1. **Test Checkout Flow:**
   - Go to `/pricing`
   - Click "Subscribe Now" on Basic or Pro plan
   - Complete checkout with test card: `4242 4242 4242 4242`
   - Any future expiry date, any CVC

2. **Test Webhook (Local):**
   - Use Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
   - Copy the webhook secret to `.env.local`

3. **Verify Subscription:**
   - After checkout, check `/settings/subscription`
   - Verify usage tracking at `/dashboard`

## Features Implemented

✅ Subscription tiers (Free, Basic, Pro)
✅ Usage tracking and limits
✅ Stripe checkout integration
✅ Webhook handling for subscription lifecycle
✅ Customer portal for billing management
✅ Usage meters and upgrade prompts
✅ Feature gating based on subscription tier

## Next Steps

- [ ] Add email notifications for subscription events
- [ ] Implement usage reset cron job (monthly)
- [ ] Add analytics dashboard
- [ ] Test cancellation flow
- [ ] Add upgrade/downgrade flows
- [ ] Implement trial periods (optional)

