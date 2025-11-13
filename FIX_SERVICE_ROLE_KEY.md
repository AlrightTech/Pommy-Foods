# Fix: Invalid API Key Error

## Problem
Even though both ANON_KEY and SERVICE_ROLE_KEY are set, you're getting "Invalid API key" errors.

## Common Causes

### 1. Wrong Key Copied
**Most Common Issue**: You might have copied the **anon key** instead of the **service_role key**.

**How to Fix**:
1. Go to Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. Look for **service_role key (secret)** - this is different from the anon key
5. The service_role key is much longer and should start with `eyJ`
6. Copy the **entire** service_role key (it's very long, ~200+ characters)
7. Paste it into `.env.local` as `SUPABASE_SERVICE_ROLE_KEY=...`

### 2. Key Truncated or Incomplete
**Issue**: The key might be cut off or missing characters.

**How to Fix**:
- Make sure you copied the **entire** key
- Service role keys are typically 200-300 characters long
- Check for any line breaks or spaces
- The key should be on a single line

### 3. Extra Spaces or Quotes
**Issue**: The key might have extra spaces or quotes around it.

**How to Fix**:
- In `.env.local`, make sure there are NO spaces around the `=`
- Don't use quotes around the key value
- Correct: `SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Wrong: `SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
- Wrong: `SUPABASE_SERVICE_ROLE_KEY= eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 4. Server Not Restarted
**Issue**: Environment variables are only loaded when the server starts.

**How to Fix**:
1. Stop your dev server (Ctrl+C)
2. Start it again: `npm run dev`
3. Try again

### 5. Wrong Project Key
**Issue**: You might be using a service_role key from a different Supabase project.

**How to Fix**:
- Verify the `NEXT_PUBLIC_SUPABASE_URL` matches the project
- Make sure the service_role key is from the same project

## How to Verify

### Step 1: Check Your .env.local File
Open `.env.local` and verify:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (shorter, ~150 chars)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (longer, ~200+ chars)
```

### Step 2: Test the Connection
Visit: `http://localhost:3000/api/admin/test-connection`

This will show you:
- If the key is detected
- Key length
- If it starts with `eyJ` (correct format)
- Actual error details

### Step 3: Check Server Logs
Look at your terminal where `npm run dev` is running. The new error handling will show:
- "Invalid SUPABASE_SERVICE_ROLE_KEY format" - if key doesn't start with eyJ
- "SUPABASE_SERVICE_ROLE_KEY appears to be too short" - if key is incomplete
- "Invalid Supabase service role key" - if key is wrong

## Quick Fix Checklist

- [ ] Opened Supabase Dashboard → Settings → API
- [ ] Copied the **service_role key (secret)**, NOT the anon key
- [ ] Key is complete (200+ characters)
- [ ] Key starts with `eyJ`
- [ ] No spaces around `=` in `.env.local`
- [ ] No quotes around the key value
- [ ] Key is on a single line
- [ ] Restarted the dev server after updating `.env.local`
- [ ] Verified key matches the project URL

## Still Not Working?

1. **Delete and recreate the key** (if possible in Supabase)
2. **Check Supabase project settings** - make sure API access is enabled
3. **Verify the key in Supabase Dashboard** - click "Reveal" to see the full key
4. **Try copying the key again** - sometimes copy/paste can introduce issues

