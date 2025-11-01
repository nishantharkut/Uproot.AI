# Testing Stripe Integration Without Webhooks

This guide shows you how to test the Stripe subscription flow **without setting up webhooks**.

---

## ✅ Prerequisites (You've Already Done These!)

- [x] Stripe account created
- [x] Test mode enabled
- [x] API keys added to `.env.local`
- [x] Basic and Pro plans created in Stripe
- [x] Price IDs added to `.env.local`
- [x] Database migration completed

---

## Quick Start - Test Right Now!

### Step 1: Start Your Dev Server
```bash
pnpm dev
# or
npm run dev
```

### Step 2: Test the Checkout Flow

1. **Navigate to Pricing Page**
   - Go to: `http://localhost:3000/pricing`
   - You should see all 3 tiers (Free, Basic, Pro)

2. **Click Subscribe Button**
   - Click "Subscribe to Basic" or "Subscribe to Pro"
   - You should be redirected to Stripe Checkout

3. **Complete Test Payment**
   Use Stripe's test card:
   - **Card Number**: `4242 4242 4242 4242`
   - **Expiry**: Any future date (e.g., `12/25`)
   - **CVC**: Any 3 digits (e.g., `123`)
   - **ZIP**: Any 5 digits (e.g., `12345`)
   - **Email**: Any email (can be fake like `test@example.com`)
   - Click **"Subscribe"**

4. **Verify Success Page**
   - After payment, you'll be redirected to `/subscription/success`
   - The page will automatically verify your subscription
   - You should see: "Your subscription has been successfully activated"

5. **Check Subscription Status**
   - Go to: `http://localhost:3000/settings/subscription`
   - You should see:
     - Your subscription tier (Basic or Pro)
     - Status: "active"
     - Current period end date

6. **Verify Usage Meters**
   - Go to: `http://localhost:3000/dashboard`
   - Check usage meters are displayed
   - Try using a feature (create cover letter, take quiz)
   - Verify usage is tracked

---

## How It Works (Without Webhooks)

Instead of relying on webhooks, the system:

1. **On Success Page Load**:
   - Retrieves `session_id` from URL
   - Calls `/api/stripe/verify-session` endpoint
   - This endpoint:
     - Retrieves checkout session from Stripe
     - Verifies payment status
     - Creates/updates subscription in database
     - Returns success/error

2. **Immediate Verification**:
   - No waiting for webhooks
   - Subscription created instantly after checkout
   - Works perfectly for testing

---

## Environment Variables You Need

Make sure your `.env.local` has:

```env
# Stripe Keys (REQUIRED)
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY

# Stripe Price IDs (REQUIRED)
NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC=price_YOUR_BASIC_PRICE_ID
NEXT_PUBLIC_STRIPE_PRICE_ID_PRO=price_YOUR_PRO_PRICE_ID

# Base URL (REQUIRED)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Webhook Secret (OPTIONAL - Only if you set up webhooks later)
# STRIPE_WEBHOOK_SECRET=whsec_...
```

**Note**: You don't need `STRIPE_WEBHOOK_SECRET` for this testing method!

---

## Testing Checklist

### ✅ Basic Flow
- [ ] Pricing page loads correctly
- [ ] Subscribe button redirects to Stripe Checkout
- [ ] Test payment completes successfully
- [ ] Redirected to success page
- [ ] Success page shows "activated" message

### ✅ Database Verification
- [ ] Check database: `Subscription` table has new record
- [ ] User has `stripeCustomerId` set
- [ ] Subscription tier is correct (Basic or Pro)
- [ ] Status is "active"

### ✅ UI Verification
- [ ] Subscription settings page shows correct tier
- [ ] Usage meters display on dashboard
- [ ] Upgrade banners appear for Free tier users

### ✅ Feature Testing
- [ ] Create a cover letter (should work if on Pro, or count usage if on Basic/Free)
- [ ] Take an interview quiz (should work if on Basic/Pro)
- [ ] Check usage meters update after using features

---

## Troubleshooting

### Issue: "Stripe is not configured"
**Solution**: 
- Check that `STRIPE_SECRET_KEY` is in `.env.local`
- Restart your dev server after adding env variables

### Issue: "Price ID not configured"
**Solution**:
- Verify `NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC` and `NEXT_PUBLIC_STRIPE_PRICE_ID_PRO` are set
- Make sure price IDs match exactly from Stripe Dashboard
- Price IDs should start with `price_`

### Issue: Subscription not appearing in database
**Solution**:
- Check browser console for errors
- Check server console for errors
- Verify the session was completed (payment_status = "paid" in Stripe Dashboard)
- Manually check database:
  ```sql
  SELECT * FROM "Subscription" ORDER BY "createdAt" DESC LIMIT 5;
  ```

### Issue: "Payment not completed" error
**Solution**:
- Make sure you completed the checkout in Stripe
- Check Stripe Dashboard → Payments to verify payment succeeded
- Try the checkout flow again

### Issue: Success page shows error
**Solution**:
- Check the error message shown on success page
- Check server console for detailed error logs
- Verify you're using the correct test card numbers
- If payment succeeded in Stripe but verification fails, subscription might still work - check `/settings/subscription`

---

## Manual Database Check

If you want to verify the subscription was created, you can query the database:

```sql
-- Check subscriptions
SELECT 
  s.id,
  s.tier,
  s.status,
  s."stripeSubscriptionId",
  u.email,
  s."currentPeriodEnd"
FROM "Subscription" s
JOIN "User" u ON s."userId" = u.id
ORDER BY s."createdAt" DESC;

-- Check specific user's subscription
SELECT * FROM "Subscription" 
WHERE "userId" = 'USER_ID_HERE';
```

---

## When to Use Webhooks (Later)

Webhooks are useful for:
- **Production**: Reliable subscription updates in real-time
- **Payment failures**: Automatic handling when payment fails
- **Renewals**: Automatic updates when subscription renews
- **Cancellations**: Immediate cancellation processing

For now, the session verification method works perfectly for testing and small-scale usage!

---

## Next Steps After Successful Testing

1. **Test Different Scenarios**:
   - Try both Basic and Pro plans
   - Test usage limits on Free tier
   - Verify upgrade prompts appear

2. **Test Edge Cases**:
   - Cancel checkout (should redirect to cancel page)
   - Try with expired/invalid card (use `4000 0000 0000 0002`)

3. **Set Up Webhooks (Optional Later)**:
   - Only if you want real-time updates
   - Follow `STRIPE_INTEGRATION_GUIDE.md` Step 6 for webhook setup

---

## Quick Reference: Test Cards

Stripe provides several test cards for different scenarios:

| Card Number | Scenario |
|------------|----------|
| `4242 4242 4242 4242` | Success (default) |
| `4000 0000 0000 9995` | Declined card |
| `4000 0000 0000 0002` | Card declined (insufficient funds) |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |

For more test cards: https://stripe.com/docs/testing

---

**You're all set! Start testing now with `pnpm dev` and go to `/pricing`!** 🚀

