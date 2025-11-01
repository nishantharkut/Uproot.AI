# Complete Stripe Integration & Testing Guide

## Overview
This guide will walk you through integrating Stripe payment processing with your UPROOT platform step-by-step.

---

## STEP 1: Stripe Account Setup

### 1.1 Create/Login to Stripe Account
1. Go to https://stripe.com
2. Sign up for a new account OR login to existing account
3. **Important**: Start with **Test Mode** (toggle in top right of dashboard)

### 1.2 Get API Keys
1. In Stripe Dashboard, go to: **Developers → API keys**
2. You'll see two keys:
   - **Publishable key** (starts with `pk_test_`) - for frontend
   - **Secret key** (starts with `sk_test_`) - for backend (click "Reveal test key")
3. **Copy both keys** - you'll need them later

---

## STEP 2: Create Products & Prices in Stripe

### 2.1 Create Basic Plan
1. Go to: **Stripe Dashboard → Products**
2. Click **"+ Add product"**
3. Fill in:
   - **Name**: `Basic Plan`
   - **Description**: `For active job seekers - 10 cover letters/month, unlimited quizzes`
   - **Pricing model**: `Standard pricing`
   - **Price**: `9.99`
   - **Billing period**: `Monthly`
   - **Recurring**: ✅ Enable (subscription)
4. Click **"Save product"**
5. **Copy the Price ID** (starts with `price_xxxxx`) - this is the **BASIC PRICE ID**

### 2.2 Create Pro Plan
1. Click **"+ Add product"** again
2. Fill in:
   - **Name**: `Pro Plan`
   - **Description**: `For serious career growth - Unlimited everything`
   - **Pricing model**: `Standard pricing`
   - **Price**: `19.99`
   - **Billing period**: `Monthly`
   - **Recurring**: ✅ Enable (subscription)
3. Click **"Save product"**
4. **Copy the Price ID** (starts with `price_xxxxx`) - this is the **PRO PRICE ID**

---

## STEP 3: Database Schema Setup

### 3.1 Update Prisma Schema
We need to add Subscription and UsageTracking models. Add these to your `prisma/schema.prisma`:

```prisma
model User {
  // ... existing fields ...
  
  // Subscription fields (ADD THESE)
  stripeCustomerId String?  @unique
  subscription     Subscription?
  usageTracking    UsageTracking[]
}

model Subscription {
  id                String   @id @default(uuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tier              String   @default("Free") // Free, Basic, Pro
  status            String   // active, canceled, past_due, trialing
  stripeSubscriptionId String?  @unique
  stripeCustomerId  String?
  currentPeriodStart DateTime?
  currentPeriodEnd   DateTime?
  cancelAtPeriodEnd  Boolean  @default(false)
  canceledAt         DateTime?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  @@index([userId])
  @@index([stripeSubscriptionId])
}

model UsageTracking {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  feature   String   // coverLetter, quiz, resume, chatbot, scheduledCall
  month     DateTime // First day of the month
  count     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, feature, month])
  @@index([userId])
  @@index([month])
}
```

### 3.2 Run Database Migration
```bash
# Generate Prisma client
npx prisma generate

# Create and run migration
npx prisma migrate dev --name add_subscription_models

# This will:
# - Create Subscription table
# - Create UsageTracking table
# - Add stripeCustomerId to User table
# - Set up indexes
```

---

## STEP 4: Environment Variables Setup

### 4.1 Create/Update .env.local
Create or update your `.env.local` file in the root directory:

```env
# Stripe API Keys (from Step 1.2)
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Stripe Price IDs (from Step 2.1 and 2.2)
NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC=price_YOUR_BASIC_PRICE_ID_HERE
NEXT_PUBLIC_STRIPE_PRICE_ID_PRO=price_YOUR_PRO_PRICE_ID_HERE

# Base URL for redirects
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Your existing env variables
DATABASE_URL=your_database_url
CLERK_SECRET_KEY=your_clerk_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
# ... other existing vars
```

**Replace all placeholders with actual values from Stripe Dashboard!**

---

## STEP 5: Create Missing Stripe API Routes

### 5.1 Create Webhook Route
Create file: `src/app/api/stripe/webhook/route.js`

```javascript
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session) {
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier;

  if (!userId || !tier) {
    console.error("Missing userId or tier in checkout session metadata");
    return;
  }

  // Update or create subscription
  await db.subscription.upsert({
    where: { userId },
    create: {
      userId,
      tier,
      status: "active",
      stripeSubscriptionId: session.subscription,
      stripeCustomerId: session.customer,
    },
    update: {
      tier,
      status: "active",
      stripeSubscriptionId: session.subscription,
      stripeCustomerId: session.customer,
    },
  });

  // Update user's stripeCustomerId if not set
  await db.user.update({
    where: { id: userId },
    data: { stripeCustomerId: session.customer },
  });
}

async function handleSubscriptionUpdate(subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  const tier = subscription.metadata?.tier || "Free";

  await db.subscription.upsert({
    where: { userId },
    create: {
      userId,
      tier,
      status: subscription.status,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    update: {
      tier,
      status: subscription.status,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
    },
  });
}

async function handleSubscriptionDeleted(subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  await db.subscription.update({
    where: { userId },
    data: {
      status: "canceled",
      canceledAt: new Date(),
      cancelAtPeriodEnd: false,
    },
  });
}

async function handlePaymentSucceeded(invoice) {
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await handleSubscriptionUpdate(subscription);
}

async function handlePaymentFailed(invoice) {
  const subscriptionId = invoice.subscription;
  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await handleSubscriptionUpdate(subscription);
}
```

### 5.2 Create Customer Portal Route
Create file: `src/app/api/stripe/customer-portal/route.js`

```javascript
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      include: { subscription: true },
    });

    if (!user || !user.stripeCustomerId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.VERCEL_URL ||
      "http://localhost:3000";

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${baseUrl}/settings/subscription`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Customer portal error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create portal session" },
      { status: 500 }
    );
  }
}
```

### 5.3 Create Verify Subscription Route (Optional - for success page)
Create file: `src/app/api/stripe/verify-subscription/route.js`

```javascript
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      subscription: user.subscription,
      hasSubscription: !!user.subscription && user.subscription.status === "active",
    });
  } catch (error) {
    console.error("Verify subscription error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

---

## STEP 6: Setup Stripe Webhook (Local Testing)

### 6.1 Install Stripe CLI
**Windows (Git Bash/PowerShell):**
```bash
# Download from: https://github.com/stripe/stripe-cli/releases
# Or use scoop: scoop install stripe
```

**Mac:**
```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**
```bash
# Download from: https://github.com/stripe/stripe-cli/releases
```

### 6.2 Login to Stripe CLI
```bash
stripe login
```
This will open your browser to authenticate.

### 6.3 Forward Webhooks to Local Server
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Important**: This command will output a webhook signing secret that starts with `whsec_`
- **Copy this secret immediately**
- Add it to your `.env.local` as `STRIPE_WEBHOOK_SECRET`
- **Keep this terminal running** while testing!

---

## STEP 7: Update Subscription Actions

Update `src/actions/subscription.js` to connect to real database:

```javascript
// Update getUserSubscription function (around line 11)
export async function getUserSubscription() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { subscription: true },
  });

  if (!user) throw new Error("User not found");

  // Return subscription or create default Free tier
  if (!user.subscription) {
    return await db.subscription.create({
      data: {
        userId: user.id,
        tier: "Free",
        status: "active",
      },
    });
  }

  return user.subscription;
}
```

---

## STEP 8: Start Your Development Server

```bash
# Make sure all environment variables are set
# Start the dev server
pnpm dev
# or
npm run dev
```

---

## STEP 9: Testing the Complete Flow

### 9.1 Test Pricing Page
1. Go to: `http://localhost:3000/pricing`
2. Verify all 3 tiers are displayed
3. Check that buttons are styled correctly

### 9.2 Test Checkout Flow
1. **Make sure Stripe CLI is running** (from Step 6.3)
2. Click "Subscribe to Basic" or "Subscribe to Pro"
3. You should be redirected to Stripe Checkout
4. Use **test card**: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/25`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)
5. Fill in email (can be fake)
6. Click "Subscribe"

### 9.3 Verify Webhook Processing
1. Check your **Stripe CLI terminal** - you should see webhook events
2. Check your **server console** for any errors
3. Check your **database** - subscription should be created

### 9.4 Test Success Page
1. After checkout, you should be redirected to `/subscription/success`
2. Verify success message is displayed
3. Check that "Go to Dashboard" button works

### 9.5 Verify Subscription Status
1. Go to: `http://localhost:3000/settings/subscription`
2. You should see:
   - Your subscription tier (Basic or Pro)
   - Status: "active"
   - Current plan details
   - Usage meters

### 9.6 Test Usage Limits
1. Try creating cover letters/interview quizzes
2. Check that usage is being tracked
3. Try exceeding limits (if on Free tier) - should show upgrade prompt

### 9.7 Test Customer Portal
1. Go to subscription settings page
2. Click "Manage Billing"
3. Should redirect to Stripe Customer Portal
4. You can:
   - Update payment method
   - View invoices
   - Cancel subscription

---

## STEP 10: Production Setup (When Ready)

### 10.1 Switch to Live Mode
1. In Stripe Dashboard, toggle to **Live Mode**
2. Get your **live API keys** (pk_live_ and sk_live_)
3. Create products in **Live Mode**
4. Get live price IDs

### 10.2 Update Environment Variables
```env
# Production Stripe Keys
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC=price_LIVE_BASIC_ID
NEXT_PUBLIC_STRIPE_PRICE_ID_PRO=price_LIVE_PRO_ID
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 10.3 Setup Production Webhook
1. In Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events (same as Step 2.2)
4. Copy webhook signing secret
5. Add to production environment variables

---

## Troubleshooting

### Issue: "Stripe is not configured"
- **Solution**: Check that `STRIPE_SECRET_KEY` is in `.env.local`
- Restart dev server after adding env variables

### Issue: "Price ID not configured"
- **Solution**: Check that `NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC` and `NEXT_PUBLIC_STRIPE_PRICE_ID_PRO` are set
- Make sure price IDs are correct from Stripe Dashboard

### Issue: Webhooks not working
- **Solution**: 
  - Make sure Stripe CLI is running
  - Check webhook secret in `.env.local`
  - Verify endpoint URL matches: `localhost:3000/api/stripe/webhook`

### Issue: Subscription not created in database
- **Solution**:
  - Check webhook is receiving events (Stripe CLI terminal)
  - Check server console for errors
  - Verify database migration ran successfully
  - Check that userId is in checkout session metadata

### Issue: Customer portal not working
- **Solution**:
  - Verify user has `stripeCustomerId` in database
  - Check subscription status is "active"
  - Verify Stripe Customer Portal is enabled in Stripe Dashboard

---

## Testing Checklist

- [ ] Stripe account created and test mode active
- [ ] API keys added to `.env.local`
- [ ] Products created in Stripe (Basic & Pro)
- [ ] Price IDs added to `.env.local`
- [ ] Database migration completed
- [ ] Webhook route created
- [ ] Customer portal route created
- [ ] Stripe CLI installed and running
- [ ] Webhook secret added to `.env.local`
- [ ] Dev server running
- [ ] Pricing page loads correctly
- [ ] Checkout flow works
- [ ] Test payment succeeds
- [ ] Success page displays
- [ ] Subscription saved to database
- [ ] Subscription settings page shows correct tier
- [ ] Usage tracking works
- [ ] Customer portal accessible
- [ ] Cancel subscription works

---

## Next Steps After Integration

1. **Add email notifications** when subscription changes
2. **Implement usage reset** cron job (monthly)
3. **Add analytics** for subscription metrics
4. **Test edge cases** (payment failures, renewals, etc.)
5. **Set up monitoring** for webhook failures
6. **Add subscription management UI** improvements

---

## Support Resources

- Stripe Docs: https://stripe.com/docs
- Stripe Testing: https://stripe.com/docs/testing
- Stripe CLI: https://stripe.com/docs/stripe-cli
- Stripe Webhooks: https://stripe.com/docs/webhooks

