-- ============================================================================
-- SIMPLE ADMIN ACCOUNT CREATION - GUARANTEED TO WORK
-- ============================================================================
-- Run this ENTIRE script in Supabase SQL Editor
-- This will create an admin account that you can login with
-- ============================================================================

-- Step 1: Check if user exists in auth.users
SELECT 
  id,
  email,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NULL THEN 'Email not confirmed'
    ELSE 'Ready'
  END AS status
FROM auth.users
WHERE email = 'admin@test.com';

-- If the above returns NO ROWS, you MUST create the user first:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add user" → "Create new user"
-- 3. Email: admin@test.com
-- 4. Password: Admin123456
-- 5. ✅ Enable "Auto Confirm User"
-- 6. Click "Create user"
-- 7. Then run Step 2 below

-- Step 2: Create/Update admin profile (run this AFTER creating user in Dashboard)
INSERT INTO user_profiles (id, email, full_name, role, is_active, created_at, updated_at)
SELECT 
  id,
  email,
  'Admin User',
  'admin',
  true,
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'admin@test.com'
ON CONFLICT (id) DO UPDATE 
SET 
  role = 'admin',
  email = EXCLUDED.email,
  full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
  is_active = true,
  updated_at = NOW();

-- Step 3: Verify everything is correct
SELECT 
  'VERIFICATION' AS step,
  u.id AS user_id,
  u.email,
  u.email_confirmed_at,
  up.role,
  up.is_active,
  CASE 
    WHEN u.id IS NULL THEN '❌ User does NOT exist - Create in Dashboard first!'
    WHEN u.email_confirmed_at IS NULL THEN '❌ Email not confirmed - Enable Auto Confirm'
    WHEN up.id IS NULL THEN '❌ Profile missing - Run Step 2 again'
    WHEN up.role != 'admin' THEN '❌ Role is wrong'
    WHEN up.is_active = false THEN '❌ Account inactive'
    ELSE '✅ READY TO LOGIN!'
  END AS status
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'admin@test.com';

-- ============================================================================
-- LOGIN CREDENTIALS:
-- Email: admin@test.com
-- Password: Admin123456 (or whatever you set in Dashboard)
-- ============================================================================

