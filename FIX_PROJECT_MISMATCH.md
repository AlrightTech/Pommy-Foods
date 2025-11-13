# CRITICAL: Project Mismatch Detected!

## The Problem

Your `.env.local` file has a **project mismatch**:

- **URL**: `https://cwtvcfktdqwbdvtpzmzb.supabase.co` (project ID: `cwtvcfktdqwbdvtpzmzb`)
- **Keys**: From a different project (project ID: `fnzfcrrimdkxcxjjdlysr`)

**This is why you're getting "Invalid API key" errors!** The keys must match the project URL.

## How to Fix

### Option 1: Use the Correct Keys for Your Current Project

1. Go to Supabase Dashboard: https://app.supabase.com
2. Select the project that matches your URL: `cwtvcfktdqwbdvtpzmzb`
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Should be `https://cwtvcfktdqwbdvtpzmzb.supabase.co`
   - **anon/public key** → Update `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key (secret)** → Update `SUPABASE_SERVICE_ROLE_KEY`

5. Update your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://cwtvcfktdqwbdvtpzmzb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<new_anon_key_from_cwtvcfktdqwbdvtpzmzb>
SUPABASE_SERVICE_ROLE_KEY=<new_service_role_key_from_cwtvcfktdqwbdvtpzmzb>
```

### Option 2: Use the Correct URL for Your Current Keys

If you want to use the project with ID `fnzfcrrimdkxcxjjdlysr`:

1. Go to Supabase Dashboard: https://app.supabase.com
2. Select the project: `fnzfcrrimdkxcxjjdlysr`
3. Go to **Settings** → **API**
4. Copy the **Project URL** (should be something like `https://fnzfcrrimdkxcxjjdlysr.supabase.co`)

5. Update your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://fnzfcrrimdkxcxjjdlysr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<keep_existing_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<keep_existing_service_role_key>
```

## How to Verify

After updating, check that:
1. The URL matches the project you're using
2. The keys are from the same project (check the project ID in the JWT token)
3. Restart your dev server: `npm run dev`

## Quick Check

You can decode the JWT tokens to see the project ID:
- The `ref` field in the JWT payload shows the project ID
- Both keys should have the same `ref` value
- The URL should match: `https://<ref>.supabase.co`

## After Fixing

1. Stop your dev server (Ctrl+C)
2. Update `.env.local` with matching URL and keys
3. Restart: `npm run dev`
4. Test: Visit `http://localhost:3000/api/admin/test-connection`
5. Try creating a product again

The error should be resolved once the URL and keys match the same Supabase project!

