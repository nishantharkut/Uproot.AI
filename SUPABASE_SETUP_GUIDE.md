# Supabase Database Setup Guide

## Why You Need a Database

Your application requires a PostgreSQL database to store:
- User accounts and profiles
- Subscriptions
- Resumes and cover letters
- Interview assessments
- Call logs
- Usage tracking

## Step-by-Step Supabase Setup

### Step 1: Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign up"
3. Sign up with GitHub (easiest) or email

### Step 2: Create a New Project

1. Click "New Project"
2. Fill in:
   - **Name**: `uproot-db` (or any name you like)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users (India → Southeast Asia)
   - **Pricing Plan**: Free tier is fine to start
3. Click "Create new project"
4. Wait 2-3 minutes for setup

### Step 3: Get Database Connection String

1. In your Supabase project dashboard, look at the left sidebar
2. Click on **Settings** (gear icon at the bottom)
3. Click on **Database** (under Project Settings)
4. Scroll down to find **Connection string** section
5. You'll see different tabs: **URI**, **JDBC**, **Golang**, **Node.js**, etc.
6. Click on the **URI** tab
7. You'll see a connection string that looks like:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
   OR (for direct connection):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

8. **Important**: The connection string will have `[YOUR-PASSWORD]` placeholder - you need to replace this with the actual password you created in Step 2

**Alternative Method (if you still can't find it):**

1. Go to **Project Settings** → **Database**
2. Look for **Connection string** section (it's about halfway down the page)
3. If you see a toggle for "Connection pooling", try both settings:
   - **Transaction mode** (port 6543) - Better for serverless (recommended for Vercel)
   - **Session mode** (port 5432) - Direct connection
4. Copy the connection string from the URI tab
5. Replace `[YOUR-PASSWORD]` with your actual database password

**If you forgot your password:**
- Go to **Project Settings** → **Database** → **Database password**
- Click "Reset database password" to create a new one

### Step 4: Add to Vercel Environment Variables

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add:
   - **Key**: `DATABASE_URL`
   - **Value**: The connection string from Step 3
   - **Environment**: Production, Preview, Development (select all)
3. Click "Save"

### Step 5: Run Database Migrations

You have two options:

#### Option A: Run Locally (Recommended First)

1. **Create `.env.local`** in your project root:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
   ```

2. **Run migrations**:
   ```bash
   npx prisma migrate deploy
   ```
   
   This will create all your tables in Supabase.

#### Option B: Run via Vercel Build Command

Add to `package.json` scripts:
```json
"postinstall": "prisma generate && prisma migrate deploy"
```

Or set in Vercel: **Settings** → **General** → **Build Command**:
```
pnpm install && pnpm prisma generate && pnpm prisma migrate deploy && pnpm build
```

### Step 6: Verify Database

1. Go to Supabase Dashboard → **Table Editor**
2. You should see tables:
   - `User`
   - `Subscription`
   - `Resume`
   - `Assessment`
   - etc.

## Required Vercel Environment Variables

Make sure ALL of these are set in Vercel:

### Database
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

### Clerk Authentication
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

### Stripe (Optional - if using Stripe payments)
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC=price_...
NEXT_PUBLIC_STRIPE_PRICE_ID_PRO=price_...
```

### App URL
```env
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Other Services
```env
OPENAI_API_KEY=sk-...  # If using AI features
CLOUDINARY_URL=cloudinary://...  # If using Cloudinary
```

## Troubleshooting

### Migration Fails
- Check your `DATABASE_URL` is correct
- Make sure password doesn't have special characters (or URL-encode them)
- Ensure Supabase project is fully initialized

### Connection Issues
- Verify database password is correct
- Check if IP restrictions are enabled (disable them for now)
- Ensure `DATABASE_URL` is set in all environments on Vercel

### Tables Not Showing
- Run `npx prisma migrate deploy` again
- Check Supabase logs for errors
- Verify Prisma schema is correct

## Next Steps

After database is set up:
1. ✅ Database migrations complete
2. ✅ All environment variables set in Vercel
3. ✅ Redeploy on Vercel
4. ✅ Test the application

Your middleware error should be fixed once the database is connected!

