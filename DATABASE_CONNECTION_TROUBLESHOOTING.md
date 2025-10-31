# Database Connection Troubleshooting

## Current Status

✅ Environment variables are loaded correctly  
✅ Prisma can read DATABASE_URL  
❌ Cannot reach Supabase database server

## Common Issues & Solutions

### 1. Supabase Project is Paused (Free Tier)

Free tier Supabase projects pause after 7 days of inactivity.

**Solution:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Find your project
3. If it shows "Paused", click "Restore" or "Resume"
4. Wait 2-3 minutes for the project to wake up
5. Try connecting again

### 2. Connection String Format

Make sure your DATABASE_URL uses the correct format:

**Direct Connection (Port 5432):**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Connection Pooling (Port 6543 - Recommended):**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**How to get the pooling URL:**
1. Supabase Dashboard → Settings → Database
2. Connection string → Connection pooling → Session mode
3. Copy the URI format

### 3. Password with Special Characters

If your password contains special characters, they need to be URL-encoded.

**Special characters that need encoding:**
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `/` → `%2F`
- `?` → `%3F`
- `=` → `%3D`
- ` ` (space) → `%20`

**Example:**
```
Password: MyP@ssw0rd#123
Encoded: MyP%40ssw0rd%23123
```

**Or better:** Reset your database password in Supabase to use only alphanumeric characters.

### 4. Check Database Password

1. Go to Supabase Dashboard → Settings → Database
2. Verify or reset your database password
3. Update DATABASE_URL in .env.local with the correct password

### 5. Network/Firewall Issues

**Windows Firewall:**
- Temporarily disable Windows Firewall to test
- Or add exception for PostgreSQL (port 5432 or 6543)

**Corporate Network:**
- Some corporate networks block database connections
- Try from a different network (mobile hotspot)
- Use Supabase connection pooling (port 6543) instead

### 6. Test Connection Directly

**Using psql (if installed):**
```bash
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

**Using Supabase Dashboard:**
1. Go to Supabase Dashboard → SQL Editor
2. Try running: `SELECT 1;`
3. If this works, database is accessible

## Recommended Next Steps

### Step 1: Verify Supabase Project Status

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Check if project shows "Active" or "Paused"
3. If paused, click "Resume" and wait 2-3 minutes

### Step 2: Use Connection Pooling URL

1. Supabase Dashboard → Settings → Database
2. Connection string → Connection pooling → Session mode
3. Copy the URI (should have port 6543 and `pgbouncer=true`)
4. Update DATABASE_URL in .env.local
5. Try again: `npm run db:push`

### Step 3: Reset Database Password (if needed)

If password has special characters:

1. Supabase Dashboard → Settings → Database
2. Click "Reset database password"
3. Copy new password
4. Update .env.local with new password
5. Use only alphanumeric characters for easier setup

### Step 4: Test Connection

After updating connection string:

```bash
# Check environment variables
npm run db:check

# Try pushing schema
npm run db:push
```

## Alternative: Use Supabase SQL Editor

If connection issues persist, you can manually create tables:

1. Go to Supabase Dashboard → SQL Editor
2. Run the SQL generated from Prisma schema
3. Or use `npx prisma migrate diff` to generate SQL

## Quick Test Commands

```bash
# Verify env vars are loaded
npm run db:check

# Test database connection
npm run db:push

# Open Prisma Studio (if connection works)
npm run db:studio
```

## Still Having Issues?

1. **Check Supabase Status:** https://status.supabase.com
2. **Verify Project Settings:** Make sure project is in correct region
3. **Check Supabase Logs:** Dashboard → Logs → Database
4. **Contact Support:** Supabase Discord or GitHub Issues

## Connection String Examples

### Direct Connection
```env
DATABASE_URL="postgresql://postgres:YourPassword123@db.abcdefghijklmnop.supabase.co:5432/postgres"
```

### Connection Pooling (Recommended)
```env
DATABASE_URL="postgresql://postgres.abcdefghijklmnop:YourPassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

Make sure to:
- Replace `[PASSWORD]` with actual password
- Replace `[PROJECT-REF]` with your project reference
- Replace `[REGION]` with your region (e.g., `us-east-1`)

