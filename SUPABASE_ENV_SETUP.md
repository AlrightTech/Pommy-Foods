# Environment Variables for Supabase - Quick Reference

## Required Variables for .env.local

Copy these into your `.env.local` file and replace the placeholder values:

```env
# ============================================
# SUPABASE DATABASE CONFIGURATION
# ============================================
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# ============================================
# AUTHENTICATION SECRETS
# ============================================
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters-change-this"
NEXTAUTH_SECRET="your-nextauth-secret-minimum-32-characters-change-this"
NEXTAUTH_URL="http://localhost:3000"

# ============================================
# APPLICATION CONFIGURATION
# ============================================
NODE_ENV="development"
UPLOAD_MAX_SIZE="10485760"
```

## How to Get Supabase DATABASE_URL

1. **Go to Supabase Dashboard**: https://app.supabase.com
2. **Select your project** (or create a new one)
3. **Go to Settings** → **Database**
4. **Scroll to "Connection string"** section
5. **Select "URI" tab**
6. **Copy the connection string**
7. **Replace `[YOUR-PASSWORD]`** with your actual database password

**Example Supabase Connection String:**
```
postgresql://postgres:MySecurePassword123@db.abcdefghijklmnop.supabase.co:5432/postgres
```

## Variable Descriptions

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ Yes | Supabase PostgreSQL connection string | `postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres` |
| `JWT_SECRET` | ✅ Yes | Secret for JWT token (min 32 chars) | Generate with: `openssl rand -base64 32` |
| `NEXTAUTH_SECRET` | ✅ Yes | Secret for NextAuth (min 32 chars) | Generate with: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | ✅ Yes | Your app URL | `http://localhost:3000` (dev) |
| `NODE_ENV` | ✅ Yes | Environment type | `development` or `production` |
| `UPLOAD_MAX_SIZE` | ⚠️ Optional | Max file size in bytes | `10485760` (10MB) |

## Generate Secure Secrets

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate NEXTAUTH_SECRET (different value)
openssl rand -base64 32
```

## Complete Setup Steps

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Save database password

2. **Get DATABASE_URL**
   - Settings → Database → Connection string → URI
   - Copy and replace password

3. **Generate Secrets**
   ```bash
   openssl rand -base64 32  # For JWT_SECRET
   openssl rand -base64 32  # For NEXTAUTH_SECRET (different value)
   ```

4. **Create .env.local**
   - Copy the template above
   - Fill in all values
   - Save file in project root

5. **Test Connection**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma studio  # Should open successfully
   ```

## Production (Vercel)

Add the same variables in Vercel Dashboard → Project Settings → Environment Variables, but:
- Use production Supabase connection string (pooling recommended)
- Use different secrets (generate new ones)
- Set `NEXTAUTH_URL` to your production domain

For detailed instructions, see [ENV_VARIABLES.md](./ENV_VARIABLES.md)

