# How to Get Stripe Price IDs (Not Product IDs)

## ⚠️ Important: Price ID vs Product ID

You currently have **Product IDs** (`prod_...`), but you need **Price IDs** (`price_...`).

### What You Have:
```
prod_TLR4VHmF7q9qpN  ← This is a PRODUCT ID
prod_TLR5Id5YtmP87H  ← This is a PRODUCT ID
```

### What You Need:
```
price_XXXXXXXXXXXXX  ← This is a PRICE ID
price_YYYYYYYYYYYYY  ← This is a PRICE ID
```

---

## 🔍 How to Find Your Price IDs

### Method 1: From Stripe Dashboard (Easiest)

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com/test/products

2. **Click on your "Basic Plan" product**

3. **Look for "Pricing" section** - You'll see the price listed
   - Price: $9.99/month
   - **Price ID**: `price_xxxxx` ← **Copy this!**

4. **Click on the Price ID** - It will copy to clipboard
   - OR click the "..." menu next to the price and select "View price details"

5. **Repeat for Pro Plan**

### Method 2: From Product Details Page

1. Go to: **Products** → Click your product
2. Scroll down to **"Pricing"** section
3. You'll see the price with a **Price ID** next to it
4. Click the Price ID to copy it

### Method 3: Using Stripe API (Advanced)

If you want to programmatically get price IDs:

```bash
# Get all prices for a product
curl https://api.stripe.com/v1/prices?product=prod_TLR4VHmF7q9qpN \
  -u sk_test_YOUR_SECRET_KEY:
```

---

## ✅ Correct Format in .env.local

Your `.env.local` should look like:

```env
# ✅ CORRECT - Price IDs (start with price_)
NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC=price_1ABC123...
NEXT_PUBLIC_STRIPE_PRICE_ID_PRO=price_1XYZ789...

# ❌ WRONG - Product IDs (start with prod_)
# NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC=prod_TLR4VHmF7q9qpN
# NEXT_PUBLIC_STRIPE_PRICE_ID_PRO=prod_TLR5Id5YtmP87H
```

---

## 🎯 Visual Guide: Stripe Dashboard

When you're in the Stripe Dashboard product page, you'll see something like:

```
Product: Basic Plan
├─ Pricing
│  └─ $9.99 / month
│     └─ Price ID: price_1ABC123... ← THIS is what you need!
└─ ...
```

---

## 🔍 Quick Check: What Type of ID Do I Have?

- **Product ID**: Starts with `prod_` → ❌ Wrong for checkout
- **Price ID**: Starts with `price_` → ✅ Correct for checkout

---

## 📝 Once You Have the Price IDs

1. Update your `.env.local`:
   ```env
   NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC=price_1ABC123...
   NEXT_PUBLIC_STRIPE_PRICE_ID_PRO=price_1XYZ789...
   ```

2. **Restart your dev server** (important!)

3. Test again - checkout should work now!

---

## 💡 Why Price IDs, Not Product IDs?

Stripe Products can have multiple prices (e.g., monthly vs annual).
When creating a checkout session, Stripe needs to know:
- **Which product?** (Product ID)
- **Which price/plan?** (Price ID) ← We use this

Since you're doing subscriptions, each product has one recurring price, so you need that specific Price ID.

