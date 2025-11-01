# Quick Fix: Migration Hanging Issue

## The Problem
`prisma migrate deploy` is hanging because the connection pooler (port 6543) can be slow for migrations.

## Quick Solution: Use `prisma db push` Instead

For initial database setup, use `db push` - it's much faster:

```bash
npx prisma db push
```

This will:
- ✅ Push your schema directly to Supabase
- ✅ Create all tables instantly
- ✅ Skip migration history (perfect for new databases)
- ✅ Much faster than `migrate deploy`

## Alternative: Use Direct Connection

If you want to use `migrate deploy`, switch to direct connection:

1. **In Supabase Dashboard**:
   - Settings → Database → Connection string
   - Switch to **Session mode** (port 5432) - NOT Transaction mode
   - Copy the connection string

2. **Update `.env.local`**:
   ```env
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```
   
   Note: Use port **5432**, not 6543

3. **Run migration**:
   ```bash
   npx prisma migrate deploy
   ```

## Recommended Approach

**For now, just use `db push`** - it's the easiest and fastest:

```bash
npx prisma db push
```

After this works, you can:
- Switch back to pooler connection (6543) for Vercel
- Use `migrate deploy` for future migrations

