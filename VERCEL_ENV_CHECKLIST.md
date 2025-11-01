# Vercel Environment Variables Checklist

## ⚠️ CRITICAL: These MUST be set in Vercel

Go to: **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

### Required for Middleware (Clerk)

Without these, middleware will fail:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_... or pk_live_...
CLERK_SECRET_KEY=sk_test_... or sk_live_...
```

**How to get these:**
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **API Keys** section
4. Copy:
   - **Publishable key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - **Secret key** → `CLERK_SECRET_KEY`

### Required for Database

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**How to get this:**
1. Go to Supabase Dashboard → Settings → Database
2. Copy connection string (Session mode, port 5432)
3. Replace `[YOUR-PASSWORD]` with your actual password

### Optional but Recommended

```env
NEXT_PUBLIC_APP_URL=https://team-potato-coders.vercel.app
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

## Quick Check

After adding variables, make sure:
- ✅ All variables are set for **Production**, **Preview**, and **Development** environments
- ✅ No typos in variable names
- ✅ No extra spaces before/after values
- ✅ Clicked "Save" after adding each variable

## Verify Variables are Set

1. Go to Vercel → Your Project → Settings → Environment Variables
2. You should see all required variables listed
3. Make sure they're enabled for Production (green toggle)

## After Adding Variables

1. **Redeploy** your application:
   - Go to **Deployments** tab
   - Click the **three dots** on latest deployment
   - Click **Redeploy**
   - OR push a new commit to trigger redeploy

2. **Check logs**:
   - Go to **Deployments** → Click on deployment → **Functions** tab
   - Look for any error messages

## Common Issues

### Issue: Middleware still failing after adding variables
**Solution**: 
- Make sure you **Redeploy** after adding variables (they don't apply to existing deployments)
- Check variable names are exact (case-sensitive)
- Verify Clerk keys are correct in Clerk Dashboard

### Issue: "Missing publishableKey" error
**Solution**: 
- Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set
- Make sure it starts with `pk_test_` or `pk_live_`
- Check it's enabled for Production environment

### Issue: "CLERK_SECRET_KEY" error
**Solution**: 
- Verify `CLERK_SECRET_KEY` is set (without `NEXT_PUBLIC_` prefix)
- Make sure it starts with `sk_test_` or `sk_live_`
- This is different from publishable key!

## Minimum Required for App to Work

At minimum, you need:
1. ✅ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
2. ✅ `CLERK_SECRET_KEY`
3. ✅ `DATABASE_URL`

Without these three, the app will fail to start.

