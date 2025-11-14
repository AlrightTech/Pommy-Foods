-- ============================================================================
-- FIX ADMIN PROFILE - RUN THIS ENTIRE SCRIPT
-- ============================================================================
-- This script will:
-- 1. Verify the user exists
-- 2. Create/update the profile with the EXACT user ID
-- 3. Verify everything is correct
-- ============================================================================

-- Step 1: Show current state
SELECT 
  'BEFORE FIX' AS status,
  u.id AS auth_user_id,
  u.email AS auth_email,
  u.email_confirmed_at IS NOT NULL AS email_confirmed,
  up.id AS profile_id,
  up.role AS profile_role,
  up.is_active
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'admin@test.com';

-- Step 2: Delete any incorrect profile entries (cleanup)
DELETE FROM user_profiles 
WHERE email = 'admin@test.com' 
AND id NOT IN (SELECT id FROM auth.users WHERE email = 'admin@test.com');

-- Step 3: Create/Update profile with EXACT user ID from auth.users
INSERT INTO user_profiles (id, email, full_name, role, is_active, created_at, updated_at)
SELECT 
  u.id,  -- CRITICAL: Use the exact ID from auth.users
  u.email,
  'Admin User',
  'admin',
  true,
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'admin@test.com'
ON CONFLICT (id) DO UPDATE 
SET 
  email = EXCLUDED.email,
  full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
  role = 'admin',  -- Force admin role
  is_active = true,  -- Force active
  updated_at = NOW();

-- Step 4: Verify the fix
SELECT 
  'AFTER FIX' AS status,
  u.id AS auth_user_id,
  u.email AS auth_email,
  u.email_confirmed_at IS NOT NULL AS email_confirmed,
  up.id AS profile_id,
  up.email AS profile_email,
  up.role AS profile_role,
  up.is_active,
  up.full_name,
  CASE 
    WHEN u.id IS NULL THEN '❌ USER DOES NOT EXIST - Create in Dashboard first!'
    WHEN u.email_confirmed_at IS NULL THEN '❌ EMAIL NOT CONFIRMED - Enable Auto Confirm in Dashboard!'
    WHEN up.id IS NULL THEN '❌ PROFILE STILL MISSING - Check RLS policies!'
    WHEN up.id != u.id THEN '❌ IDS DO NOT MATCH'
    WHEN up.role != 'admin' THEN '❌ ROLE IS "' || up.role || '" NOT "admin"'
    WHEN up.is_active = false THEN '❌ ACCOUNT INACTIVE'
    ELSE '✅ EVERYTHING IS CORRECT - TRY LOGGING IN NOW!'
  END AS final_status
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'admin@test.com';

-- Step 5: Test query (simulates what the app does)
-- This shows if RLS would block the query
DO $$
DECLARE
  _user_id UUID;
  _profile_role TEXT;
  _profile_active BOOLEAN;
BEGIN
  SELECT id INTO _user_id FROM auth.users WHERE email = 'admin@test.com' LIMIT 1;
  
  IF _user_id IS NULL THEN
    RAISE NOTICE '❌ ERROR: User admin@test.com does NOT exist in auth.users';
    RAISE NOTICE '   → Go to Dashboard → Authentication → Users → Create user';
    RETURN;
  END IF;
  
  RAISE NOTICE '✅ User found: %', _user_id;
  
  SELECT role, is_active INTO _profile_role, _profile_active
  FROM user_profiles
  WHERE id = _user_id;
  
  IF _profile_role IS NULL THEN
    RAISE NOTICE '❌ ERROR: Profile does NOT exist for user ID: %', _user_id;
    RAISE NOTICE '   → The INSERT above should have created it. Check RLS policies.';
  ELSIF _profile_role != 'admin' THEN
    RAISE NOTICE '❌ ERROR: Profile role is "%" not "admin"', _profile_role;
  ELSIF _profile_active = false THEN
    RAISE NOTICE '❌ ERROR: Profile is inactive';
  ELSE
    RAISE NOTICE '✅ Profile is correct: role=%, active=%', _profile_role, _profile_active;
    RAISE NOTICE '✅ You should be able to login now!';
  END IF;
END $$;

