# Migration Troubleshooting - Stuck/Hanging Issue

## Problem: Migration Command Hangs

If `npx prisma migrate deploy` or `npx prisma migrate status` hangs/stops responding, it's usually a connection issue with Supabase.

## Solution 1: Use Direct Connection (Port 5432)

The pooler connection (port 6543) can sometimes timeout. Try using direct connection:

1. **Get Direct Connection String from Supabase**:
   - Go to **Settings** → **Database**
   - Find **Connection string** section
   - Look for toggle: **Connection pooling**
   - Switch to **Session mode** (port 5432) - NOT Transaction mode
   - Copy the connection string

2. **Update your `.env.local`**:
   ```env
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connect_timeout=15"
   ```
   
   Note: Use port **5432** for direct connection, not 6543

3. **Try migration again**:
   ```bash
   npx prisma migrate deploy
   ```

## Solution 2: Use `prisma db push` (Quick Alternative)

If migrations are stuck, use `db push` which is faster for initial setup:

```bash
npx prisma db push
```

This will:
- Push your schema directly to the database
- Skip migration history (fine for new databases)
- Much faster than migrate deploy

## Solution 3: Add Connection Timeout

Update your `.env.local` connection string to include timeout:

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?connect_timeout=30&pool_timeout=30"
```

Or for direct connection:
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?connect_timeout=30"
```

## Solution 4: Check Supabase Connection

1. **Test connection manually**:
   ```bash
   npx prisma db execute --stdin
   ```
   
   Then type: `SELECT 1;` and press Enter
   
   If this also hangs, it's a connection issue

2. **Check Supabase Dashboard**:
   - Go to **Database** → **Connection Pooler**
   - Make sure it's enabled
   - Check if there are any connection limits

3. **Try from Supabase SQL Editor**:
   - Go to **SQL Editor** in Supabase
   - Run: `SELECT version();`
   - If this works, database is fine - it's a connection string issue

## Solution 5: Reset and Start Fresh

If nothing works:

1. **Use db push instead** (fastest):
   ```bash
   npx prisma db push --skip-generate
   npx prisma generate
   ```

2. **Or reset migrations**:
   ```bash
   # WARNING: This deletes all data!
   npx prisma migrate reset
   npx prisma migrate deploy
   ```

## Recommended: Use Direct Connection for First Migration

For the first migration, use direct connection (port 5432):

**In Supabase**:
- Settings → Database → Connection string
- Toggle to **Session mode** (NOT Transaction mode)
- Copy URI

**Connection string format**:
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

After migrations are done, you can switch back to pooler (port 6543) for Vercel deployment.

