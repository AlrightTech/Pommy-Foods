-- ============================================================================
-- DIAGNOSTIC QUERIES - Check User Status
-- ============================================================================
-- Run these in Supabase SQL Editor to diagnose login issues
-- ============================================================================

-- 1. Check if user exists in auth.users
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at,
  CASE 
    WHEN email_confirmed_at IS NULL THEN '❌ Email NOT confirmed'
    ELSE '✅ Email confirmed'
  END AS email_status
FROM auth.users
WHERE email = 'admin@pommyfoods.com';  -- ⚠️ REPLACE WITH YOUR EMAIL

-- 2. Check if user profile exists
SELECT 
  up.id,
  up.email,
  up.role,
  up.is_active,
  up.full_name,
  CASE 
    WHEN up.id IS NULL THEN '❌ Profile does NOT exist'
    WHEN up.role != 'admin' THEN '❌ Role is "' || up.role || '" (should be "admin")'
    WHEN up.is_active = false THEN '❌ Account is INACTIVE'
    ELSE '✅ Profile is OK'
  END AS profile_status
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'admin@pommyfoods.com';  -- ⚠️ REPLACE WITH YOUR EMAIL

-- 3. Complete status check
SELECT 
  u.email,
  CASE 
    WHEN u.id IS NULL THEN '❌ User does NOT exist in auth.users'
    WHEN u.email_confirmed_at IS NULL THEN '❌ Email NOT confirmed'
    WHEN up.id IS NULL THEN '❌ Profile does NOT exist'
    WHEN up.role != 'admin' THEN '❌ Role is "' || up.role || '"'
    WHEN up.is_active = false THEN '❌ Account INACTIVE'
    ELSE '✅ Account is ready for login'
  END AS status,
  u.email_confirmed_at,
  up.role,
  up.is_active
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'admin@pommyfoods.com';  -- ⚠️ REPLACE WITH YOUR EMAIL

-- ============================================================================
-- FIX: Create/Update Admin Profile (if user exists but profile doesn't)
-- ============================================================================
-- Run this if user exists but profile is missing or wrong role:
SELECT create_admin_profile(
  (SELECT id FROM auth.users WHERE email = 'admin@pommyfoods.com' LIMIT 1),
  'admin@pommyfoods.com',
  'Admin'
);

-- ============================================================================
-- FIX: Reset Password (Must be done in Dashboard, not SQL)
-- ============================================================================
-- You CANNOT reset password via SQL. Do this:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Find your user by email
-- 3. Click "..." → "Reset Password"
-- 4. Or delete the user and create a new one with the correct password

