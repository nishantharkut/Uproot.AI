# 🚀 Quick Testing Guide - No Webhooks Needed!

You've already set up:
- ✅ Stripe account with test mode
- ✅ API keys in `.env.local`
- ✅ Basic & Pro plans created
- ✅ Price IDs in `.env.local`

**Now let's test!**

---

## ⚡ 3-Step Test (Takes 2 minutes!)

### Step 1: Start Server
```bash
pnpm dev
```

### Step 2: Go to Pricing & Subscribe
1. Open: `http://localhost:3000/pricing`
2. Click **"Subscribe to Basic"** (or Pro)
3. You'll be redirected to Stripe Checkout

### Step 3: Complete Payment
Use Stripe test card:
- **Card**: `4242 4242 4242 4242`
- **Expiry**: `12/25` (any future date)
- **CVC**: `123` (any 3 digits)
- **ZIP**: `12345` (any 5 digits)
- Click **"Subscribe"**

---

## ✅ Verify It Worked

### Check Success Page
After payment, you should see:
- ✅ "Welcome to Your New Plan!" message
- ✅ "Subscription verified and activated successfully"
- ✅ Links to dashboard and subscription settings

### Check Subscription Settings
Go to: `http://localhost:3000/settings/subscription`
- ✅ Should show your tier (Basic or Pro)
- ✅ Status: "active"
- ✅ Usage meters displayed

### Check Dashboard
Go to: `http://localhost:3000/dashboard`
- ✅ Usage meters at the top
- ✅ Shows your usage limits based on tier

---

## 🔍 Verify in Database (Optional)

If you want to check the database directly:

```sql
-- See all subscriptions
SELECT s.tier, s.status, u.email, s."currentPeriodEnd"
FROM "Subscription" s
JOIN "User" u ON s."userId" = u.id
ORDER BY s."createdAt" DESC;
```

---

## ❌ Troubleshooting

### "Stripe is not configured"
→ Check `.env.local` has `STRIPE_SECRET_KEY`

### "Price ID not configured"  
→ Check `.env.local` has `NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC` and `NEXT_PUBLIC_STRIPE_PRICE_ID_PRO`

### Subscription not appearing
→ Check browser console for errors
→ Check server terminal for errors
→ Try the checkout flow again

### Payment succeeded but verification failed
→ Subscription might still work! Check `/settings/subscription`
→ If subscription exists in Stripe but not in database, it will sync on next page load

---

## 🎯 Test Different Scenarios

### Test Free Tier Limits
1. Stay on Free tier (or cancel subscription)
2. Try creating 4 cover letters
3. Should show upgrade prompt on 4th attempt

### Test Upgrade Flow
1. Go to `/pricing`
2. Click upgrade to higher tier
3. Complete checkout
4. Verify tier changed in settings

### Test Cancel Flow
1. Go to `/settings/subscription`
2. Click "Cancel Subscription"
3. Should open Stripe Customer Portal
4. Cancel there (or just close - it's just testing!)

---

## 📋 Environment Variables Checklist

Your `.env.local` should have:

```env
# REQUIRED
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC=price_...
NEXT_PUBLIC_STRIPE_PRICE_ID_PRO=price_...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# NOT NEEDED (for testing without webhooks)
# STRIPE_WEBHOOK_SECRET=whsec_...
```

---

**That's it! You're ready to test. Start with `pnpm dev` and go to `/pricing`!** 🎉

