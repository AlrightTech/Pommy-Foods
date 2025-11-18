# Fix for 406 Error on Admin Login

## Problem
Getting 406 "Not Acceptable" errors when trying to fetch user profiles during admin login.

## Root Cause
The Supabase client was configured with explicit `Accept: application/json` headers in the global configuration. However, Supabase's PostgREST API requires different Accept headers depending on the query type:
- For `.single()` or `.maybeSingle()` queries: `application/vnd.pgjson.object+json`
- For array queries: `application/json`

By forcing `application/json` for all requests, single-object queries were getting rejected with 406 errors.

## Solution
Removed the explicit header configuration and let the Supabase client handle headers automatically. The Supabase JS client automatically sets the correct Accept headers based on the query type.

## Changes Made

### `lib/supabase/client.ts`
- Removed explicit `Accept` and `Content-Type` headers from global configuration
- Let Supabase client handle headers automatically
- Added comment explaining why headers shouldn't be overridden

### `components/auth/LoginForm.tsx`
- Added better error logging for non-PGRST116 errors
- Improved comments explaining header handling

## About Browser Extension Warnings
The "Host is not valid or supported" and "Host is not in insights whitelist" warnings are from browser extensions (likely Supabase Insights) and can be safely ignored. They don't affect functionality.

## Testing
After this fix:
1. Restart your dev server: `npm run dev`
2. Clear browser cache (hard refresh: Ctrl+Shift+R)
3. Try logging in as admin
4. The 406 errors should be gone
5. Profile queries should work correctly

## If Issues Persist
1. Check browser console for actual errors (ignore extension warnings)
2. Verify `.env.local` has correct Supabase credentials
3. Check Network tab to see if requests are being made with correct headers
4. Ensure the user profile exists in the database (or let auto-creation handle it)

