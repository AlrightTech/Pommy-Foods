# Vercel Environment Variables Setup

## The Problem
Your Vercel deployment is getting 406 errors because the environment variables aren't set in Vercel.

## Solution: Add Environment Variables to Vercel

### Step 1: Go to Vercel Dashboard
1. Go to https://vercel.com
2. Select your project: **Pommy Foods**
3. Go to **Settings** → **Environment Variables**

### Step 2: Add These Variables

Add these three environment variables:

1. **`NEXT_PUBLIC_SUPABASE_URL`**
   - Value: `https://cwtvcfktdqwbdvtpzmzb.supabase.co`
   - Environment: Select **Production**, **Preview**, and **Development**

2. **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**
   - Value: Your anon key from `.env.local` (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - Environment: Select **Production**, **Preview**, and **Development**

3. **`SUPABASE_SERVICE_ROLE_KEY`** (for admin operations)
   - Value: Your service role key from `.env.local` (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - Environment: Select **Production**, **Preview**, and **Development**
   - ⚠️ **Keep this secret!** Never expose it in client-side code.

### Step 3: Redeploy

After adding the variables:
1. Go to **Deployments** tab
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**
   - Or push a new commit to trigger a new deployment

### Step 4: Verify

After redeploying, check:
1. The 406 errors should be gone
2. You should be able to login
3. Check the browser console - you should see `✅ Supabase client initialized`

---

## Quick Copy from .env.local

Your `.env.local` file should have these values. Copy them to Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=https://cwtvcfktdqwbdvtpzmzb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Important Notes

- Environment variables in Vercel are **separate** from your local `.env.local`
- Changes to Vercel environment variables require a **redeploy** to take effect
- The `NEXT_PUBLIC_` prefix makes variables available to the browser
- Never commit `.env.local` to git (it's in `.gitignore`)

