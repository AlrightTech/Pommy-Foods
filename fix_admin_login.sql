-- ============================================================================
-- COMPLETE ADMIN LOGIN FIX
-- ============================================================================
-- Run this ENTIRE script in Supabase SQL Editor
-- Replace 'admin@pommyfoods.com' with your email
-- ============================================================================

-- Step 1: Check if user exists in auth.users
SELECT 
  '=== CHECKING USER IN auth.users ===' AS step,
  id AS auth_user_id,
  email AS auth_email,
  email_confirmed_at,
  created_at,
  CASE 
    WHEN id IS NULL THEN '❌ USER DOES NOT EXIST - Create user in Dashboard first!'
    WHEN email_confirmed_at IS NULL THEN '⚠️ User exists but email NOT confirmed'
    ELSE '✅ User exists and email confirmed'
  END AS status
FROM auth.users
WHERE email = 'admin@pommyfoods.com';  -- ⚠️ YOUR EMAIL

-- If the above returns NO ROWS, you need to create the user first:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add user" → "Create new user"
-- 3. Email: admin@pommyfoods.com
-- 4. Password: (your password)
-- 5. Enable "Auto Confirm User"
-- 6. Click "Create user"
-- 7. Then come back and run the rest of this script

-- Step 1b: Check current status (only if user exists)
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
WHERE u.email = 'admin@pommyfoods.com';  -- ⚠️ YOUR EMAIL

-- Step 2: DELETE any incorrect profile entries (by email or wrong ID)
-- This removes profiles that don't match the auth.users ID
DELETE FROM user_profiles 
WHERE email = 'admin@pommyfoods.com'  -- ⚠️ YOUR EMAIL
   OR (id NOT IN (SELECT id FROM auth.users WHERE email = 'admin@pommyfoods.com') 
       AND email = 'admin@pommyfoods.com');

-- Step 3: CREATE/UPDATE the correct profile
-- First check if user exists, then create profile
DO $$
DECLARE
  user_id_val UUID;
BEGIN
  -- Get user ID
  SELECT id INTO user_id_val 
  FROM auth.users 
  WHERE email = 'admin@pommyfoods.com' 
  LIMIT 1;
  
  -- Check if user exists
  IF user_id_val IS NULL THEN
    RAISE EXCEPTION 'User with email admin@pommyfoods.com does NOT exist in auth.users! 

Please create the user first:
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user" → "Create new user"
3. Email: admin@pommyfoods.com
4. Password: (your password)
5. Enable "Auto Confirm User"
6. Click "Create user"
7. Then run this script again';
  END IF;
  
  -- Create/update profile directly (function may not exist)
  INSERT INTO user_profiles (id, email, full_name, role, is_active, created_at, updated_at)
  VALUES (
    user_id_val,
    'admin@pommyfoods.com',
    'Admin',
    'admin',
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE 
  SET 
    role = 'admin',
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    is_active = true,
    updated_at = NOW();
  
  RAISE NOTICE '✅ Profile created/updated successfully for user ID: %', user_id_val;
END $$;

-- Step 4: Verify the fix
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
    ELSE '❌ STILL HAS ISSUES'
  END AS final_status
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'admin@pommyfoods.com';  -- ⚠️ YOUR EMAIL

