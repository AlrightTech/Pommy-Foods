# Fix 406 Error - Missing API Key

## The Problem
The error `"No API key found in request"` means the Supabase client isn't sending the `apikey` header.

## Solution

### Step 1: Restart Your Next.js Dev Server

The Supabase client should automatically add the `apikey` header, but Next.js might be caching the old client configuration.

1. **Stop your dev server** (Ctrl+C in the terminal where it's running)
2. **Restart it**: `npm run dev` or `yarn dev`

### Step 2: Verify Environment Variables

Make sure your `.env.local` file has:

```env
NEXT_PUBLIC_SUPABASE_URL=https://cwtvcfktdqwbdvtpzmzb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Clear Browser Cache

1. Open browser DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Step 4: Check Browser Console

After restarting, check the browser console. You should see:
```
✅ Supabase client initialized
URL: https://cwtvcfktdqwbdvtpzmzb.supabase...
Key: eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

If you see errors about missing environment variables, the `.env.local` file isn't being read correctly.

### Step 5: Try Login Again

After restarting the server and clearing cache, try logging in again:
- Email: `admin@test.com`
- Password: `Admin123456`

---

## If It Still Doesn't Work

1. **Check Network Tab**: Open DevTools → Network tab → Look for the request to `user_profiles`
   - Check the Request Headers
   - You should see `apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6...`

2. **Verify the profile exists**: Run the SQL script `SIMPLE_ADMIN_FIX.sql` in Supabase SQL Editor

3. **Check Supabase client initialization**: Look in browser console for the initialization messages

