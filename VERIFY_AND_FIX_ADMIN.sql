-- ============================================================================
-- VERIFY AND FIX ADMIN ACCOUNT - RUN THIS FIRST
-- ============================================================================

-- Step 1: Check if user exists in auth.users
SELECT 
  'CHECKING USER' AS step,
  id,
  email,
  email_confirmed_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NULL THEN '❌ Email NOT confirmed'
    ELSE '✅ Email confirmed'
  END AS email_status
FROM auth.users
WHERE email = 'admin@test.com';

-- If the above returns NO ROWS, the user does NOT exist!
-- You MUST create it in Dashboard first:
-- 1. Supabase Dashboard → Authentication → Users
-- 2. Click "Add user" → "Create new user"
-- 3. Email: admin@test.com
-- 4. Password: Admin123456
-- 5. ✅ Enable "Auto Confirm User" (IMPORTANT!)
-- 6. Click "Create user"

-- Step 2: Check if profile exists
SELECT 
  'CHECKING PROFILE' AS step,
  up.id,
  up.email,
  up.role,
  up.is_active,
  CASE 
    WHEN up.id IS NULL THEN '❌ Profile does NOT exist'
    WHEN up.role != 'admin' THEN '❌ Role is "' || up.role || '"'
    WHEN up.is_active = false THEN '❌ Account inactive'
    ELSE '✅ Profile is OK'
  END AS profile_status
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'admin@test.com';

-- Step 3: Create/Update profile (only if user exists)
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
  is_active = true,
  updated_at = NOW();

-- Step 4: Final verification
SELECT 
  'FINAL STATUS' AS step,
  u.email,
  u.email_confirmed_at IS NOT NULL AS email_confirmed,
  up.role,
  up.is_active,
  CASE 
    WHEN u.id IS NULL THEN '❌ USER DOES NOT EXIST - Create in Dashboard!'
    WHEN u.email_confirmed_at IS NULL THEN '❌ EMAIL NOT CONFIRMED - Enable Auto Confirm!'
    WHEN up.id IS NULL THEN '❌ PROFILE MISSING - Run Step 3 again!'
    WHEN up.role != 'admin' THEN '❌ ROLE IS WRONG'
    WHEN up.is_active = false THEN '❌ ACCOUNT INACTIVE'
    ELSE '✅ READY TO LOGIN!'
  END AS final_status
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'admin@test.com';

