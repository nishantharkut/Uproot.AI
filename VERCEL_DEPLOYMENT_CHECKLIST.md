# Vercel Deployment Checklist - Fix Middleware Error

## The Problem

You're getting: `500: INTERNAL_SERVER_ERROR Code: MIDDLEWARE_INVOCATION_FAILED`

This happens when **Clerk environment variables are missing** in Vercel.

## ✅ Fix Steps (Do This Now!)

### Step 1: Add Clerk Environment Variables to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project: **team-potato-coders**
3. Go to **Settings** → **Environment Variables**
4. **Add these TWO variables** (CRITICAL):

   **Variable 1:**
   - Key: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Value: `pk_test_...` (from Clerk Dashboard)
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click "Save"

   **Variable 2:**
   - Key: `CLERK_SECRET_KEY`
   - Value: `sk_test_...` (from Clerk Dashboard - different from publishable key!)
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click "Save"

### Step 2: Get Clerk Keys

**If you don't have Clerk keys:**

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Sign in or create account
3. **Create Application** (if you don't have one):
   - Name: `UPROOT` or any name
   - Authentication methods: Email/Password (or others)
   - Click "Create application"
4. **Get API Keys**:
   - In your Clerk app dashboard
   - Go to **API Keys** section (left sidebar)
   - You'll see:
     - **Publishable key**: `pk_test_...` → This goes to `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
     - **Secret key**: `sk_test_...` → This goes to `CLERK_SECRET_KEY`
   - Click "Copy" for each and paste into Vercel

### Step 3: Verify All Required Variables

Make sure these are ALL set in Vercel:

#### ✅ Required (Minimum):
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
DATABASE_URL=postgresql://postgres:...@db....supabase.co:5432/postgres
```

#### ✅ Recommended:
```
NEXT_PUBLIC_APP_URL=https://team-potato-coders.vercel.app
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

### Step 4: REDEPLOY (Important!)

**Environment variables don't apply to existing deployments!**

1. In Vercel Dashboard → **Deployments** tab
2. Click the **three dots** (⋮) on your latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

**OR** push a new commit to trigger redeploy:
```bash
git commit --allow-empty -m "Redeploy with environment variables"
git push
```

## ✅ Verification

After redeploying, check:

1. Go to your site: https://team-potato-coders.vercel.app
2. Should load without middleware error
3. Check Vercel logs:
   - **Deployments** → Click deployment → **Functions** tab
   - Look for any errors

## Common Mistakes

❌ **Mistake 1**: Adding variables but not redeploying
✅ **Fix**: Must redeploy after adding variables

❌ **Mistake 2**: Wrong variable name (typos)
✅ **Fix**: Double-check spelling: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (exact)

❌ **Mistake 3**: Using publishable key for secret key
✅ **Fix**: They're different! `pk_test_` vs `sk_test_`

❌ **Mistake 4**: Variables only set for Development, not Production
✅ **Fix**: Enable for all environments (Production, Preview, Development)

## Still Not Working?

If error persists after adding Clerk keys:

1. **Check Vercel Logs**:
   - Go to Deployments → Latest → Functions tab
   - Look for specific error messages

2. **Test Middleware Locally**:
   ```bash
   # Make sure .env.local has Clerk keys
   pnpm dev
   # Visit http://localhost:3000
   ```

3. **Verify Clerk Keys Work**:
   - Go to Clerk Dashboard
   - Make sure application is active
   - Copy keys again (they might have changed)

## Quick Reference: Where to Find Clerk Keys

1. **Clerk Dashboard**: https://dashboard.clerk.com
2. **Select your application**
3. **API Keys** (left sidebar)
4. Copy both:
   - Publishable key (`pk_test_...`)
   - Secret key (`sk_test_...`)

