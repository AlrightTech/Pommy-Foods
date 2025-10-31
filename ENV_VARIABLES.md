# Environment Variables Guide - Supabase Setup

This document lists all required and optional environment variables for the Pommy Foods application using Supabase as the database.

## Required Environment Variables

### Database Configuration

#### `DATABASE_URL`
**Required** - PostgreSQL connection string for Supabase

**How to get it:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **Database**
4. Scroll to **Connection string**
5. Select **URI** format
6. Copy the connection string

**Connection String Formats:**

**Direct Connection (Development):**
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

**Connection Pooling (Recommended for Production):**
```env
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
```

**Example:**
```env
DATABASE_URL="postgresql://postgres:your-password@db.abcdefghijklmnop.supabase.co:5432/postgres"
```

> **Note:** Replace `[YOUR-PASSWORD]` with your actual database password. You can find or reset it in Supabase Dashboard → Settings → Database → Database password.

### Authentication Secrets

#### `JWT_SECRET`
**Required** - Secret key for JWT token generation and verification

**Requirements:**
- Minimum 32 characters
- Use strong random string
- Never commit to version control
- Different values for development and production

**Generate a secure secret:**
```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Example:**
```env
JWT_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"
```

#### `NEXTAUTH_SECRET`
**Required** - Secret for NextAuth.js session encryption

**Requirements:**
- Minimum 32 characters
- Use strong random string
- Different from JWT_SECRET
- Different values for development and production

**Generate a secure secret:**
```bash
openssl rand -base64 32
```

**Example:**
```env
NEXTAUTH_SECRET="z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4"
```

#### `NEXTAUTH_URL`
**Required** - Base URL of your application

**Development:**
```env
NEXTAUTH_URL="http://localhost:3000"
```

**Production:**
```env
NEXTAUTH_URL="https://your-domain.vercel.app"
```

### Application Configuration

#### `NODE_ENV`
**Required** - Application environment

**Values:**
- `development` - For local development
- `production` - For production deployment

**Example:**
```env
NODE_ENV="development"
```

#### `UPLOAD_MAX_SIZE`
**Optional** - Maximum file upload size in bytes

**Default:** `10485760` (10MB)

**Example:**
```env
UPLOAD_MAX_SIZE="10485760"  # 10MB
```

## Optional Environment Variables

### Supabase Additional Services

These are optional and only needed if you plan to use Supabase features beyond the database:

#### `SUPABASE_URL`
**Optional** - Supabase project URL

**How to get it:**
- Supabase Dashboard → Settings → API → Project URL

**Example:**
```env
SUPABASE_URL="https://abcdefghijklmnop.supabase.co"
```

#### `SUPABASE_ANON_KEY`
**Optional** - Supabase anonymous/public key (for client-side)

**How to get it:**
- Supabase Dashboard → Settings → API → Project API keys → `anon` `public`

**Example:**
```env
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### `SUPABASE_SERVICE_ROLE_KEY`
**Optional** - Supabase service role key (for server-side, keep secret!)

**How to get it:**
- Supabase Dashboard → Settings → API → Project API keys → `service_role` `secret`

**Warning:** Never expose this key in client-side code!

**Example:**
```env
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Complete .env.local Template

Create a `.env.local` file in the root directory with the following:

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

## Setting Up Supabase Database

### Step 1: Create Supabase Project
1. Go to [Supabase](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - **Name:** Pommy Foods
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Choose closest to your users
5. Wait for project to be created (2-3 minutes)

### Step 2: Get Connection String
1. Go to **Settings** → **Database**
2. Find **Connection string** section
3. Select **URI** tab
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your database password

### Step 3: Configure Prisma
1. Paste connection string into `.env.local` as `DATABASE_URL`
2. Run migrations:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
   Or for migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

### Step 4: Verify Connection
```bash
# Test database connection
npx prisma studio
```

## Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Use different secrets** for development and production
3. **Generate strong random secrets** (32+ characters)
4. **Rotate secrets** periodically
5. **Use connection pooling** in production
6. **Enable SSL** for database connections (Supabase does this by default)
7. **Store production secrets** in Vercel environment variables, not in code

## Vercel Environment Variables

For production deployment, add these variables in Vercel Dashboard:

1. Go to **Project Settings** → **Environment Variables**
2. Add all variables from `.env.local`:
   - `DATABASE_URL` - Your Supabase connection string
   - `JWT_SECRET` - Production JWT secret
   - `NEXTAUTH_SECRET` - Production NextAuth secret
   - `NEXTAUTH_URL` - Your production URL
   - `NODE_ENV` - Set to `production`
   - `UPLOAD_MAX_SIZE` - Optional

## Troubleshooting

### Connection Issues
- Verify database password is correct
- Check if your IP is allowed (if using IP restrictions)
- Ensure connection string format is correct
- Try connection pooling URL if direct connection fails

### Authentication Errors
- Verify `JWT_SECRET` and `NEXTAUTH_SECRET` are set
- Ensure secrets are at least 32 characters
- Check `NEXTAUTH_URL` matches your application URL

### Migration Errors
- Ensure `DATABASE_URL` is correct
- Check database permissions
- Verify Prisma schema is valid
- Try resetting: `npx prisma migrate reset` (⚠️ deletes all data)

## Quick Start Checklist

- [ ] Created Supabase project
- [ ] Copied database connection string
- [ ] Created `.env.local` file
- [ ] Added `DATABASE_URL` with Supabase connection string
- [ ] Generated and added `JWT_SECRET`
- [ ] Generated and added `NEXTAUTH_SECRET`
- [ ] Set `NEXTAUTH_URL` to `http://localhost:3000`
- [ ] Set `NODE_ENV` to `development`
- [ ] Ran `npx prisma generate`
- [ ] Ran `npx prisma db push` or `npx prisma migrate dev`
- [ ] Verified connection with `npx prisma studio`

