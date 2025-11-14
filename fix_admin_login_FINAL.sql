-- ============================================================================
-- COMPLETE ADMIN LOGIN FIX FOR admin@pommyfooods.com
-- ============================================================================
-- Run this ENTIRE script in Supabase SQL Editor
-- This will fix the admin login issue
-- ============================================================================

-- Step 1: Check current status
SELECT 
  '=== CURRENT STATUS ===' AS step,
  u.id AS auth_user_id,
  u.email AS auth_email,
  u.email_confirmed_at,
  up.id AS profile_id,
  up.role AS profile_role,
  up.is_active,
  CASE 
    WHEN u.id IS NULL THEN '❌ User does NOT exist in auth.users'
    WHEN u.email_confirmed_at IS NULL THEN '❌ Email NOT confirmed'
    WHEN up.id IS NULL THEN '❌ Profile does NOT exist'
    WHEN up.id != u.id THEN '❌ Profile ID does NOT match auth user ID'
    WHEN up.role != 'admin' THEN '❌ Role is "' || up.role || '" (should be admin)'
    WHEN up.is_active = false THEN '❌ Account is INACTIVE'
    ELSE '✅ Everything looks OK'
  END AS status
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'admin@pommyfooods.com';

-- Step 2: DELETE any incorrect profile entries
-- This removes profiles that don't match the auth.users ID
DELETE FROM user_profiles 
WHERE email = 'admin@pommyfooods.com'
   OR (id NOT IN (SELECT id FROM auth.users WHERE email = 'admin@pommyfooods.com') 
       AND email = 'admin@pommyfooods.com');

-- Step 3: CREATE/UPDATE the correct profile with EXACT matching ID
-- Using the create_admin_profile function which has SECURITY DEFINER (bypasses RLS)
SELECT create_admin_profile(
  (SELECT id FROM auth.users WHERE email = 'admin@pommyfooods.com' LIMIT 1),
  'admin@pommyfooods.com',
  'Admin'
);

-- Step 4: If function doesn't work, use direct insert (run in SQL Editor which has elevated privileges)
-- Uncomment this if Step 3 doesn't work:
/*
INSERT INTO user_profiles (id, email, full_name, role, is_active, created_at, updated_at)
SELECT 
  id,
  email,
  'Admin',
  'admin',
  true,
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'admin@pommyfooods.com'
ON CONFLICT (id) DO UPDATE 
SET 
  role = 'admin',
  email = EXCLUDED.email,
  full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
  is_active = true,
  updated_at = NOW();
*/

-- Step 5: Verify the fix
SELECT 
  '=== AFTER FIX ===' AS step,
  u.id AS auth_user_id,
  u.email AS auth_email,
  u.email_confirmed_at,
  up.id AS profile_id,
  up.role AS profile_role,
  up.is_active,
  up.full_name,
  CASE 
    WHEN up.id = u.id AND up.role = 'admin' AND up.is_active = true AND u.email_confirmed_at IS NOT NULL
    THEN '✅ READY TO LOGIN'
    ELSE '❌ STILL HAS ISSUES - Check the values above'
  END AS final_status
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'admin@pommyfooods.com';

-- Step 6: Test RLS access (this should return the profile)
-- This simulates what happens when the user logs in
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claim.sub TO (SELECT id::text FROM auth.users WHERE email = 'admin@pommyfooods.com' LIMIT 1);
SELECT id, email, role, is_active FROM user_profiles WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@pommyfooods.com' LIMIT 1);
RESET role;

