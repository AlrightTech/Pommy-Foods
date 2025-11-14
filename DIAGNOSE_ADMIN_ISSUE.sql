-- ============================================================================
-- DIAGNOSE ADMIN LOGIN ISSUE - RUN THIS TO FIND THE PROBLEM
-- ============================================================================

-- Step 1: Check if user exists in auth.users
SELECT 
  'STEP 1: Check auth.users' AS step,
  id,
  email,
  email_confirmed_at IS NOT NULL AS email_confirmed,
  created_at
FROM auth.users
WHERE email = 'admin@test.com';

-- Step 2: Check if profile exists (bypassing RLS with service role)
SELECT 
  'STEP 2: Check user_profiles (direct query)' AS step,
  id,
  email,
  role,
  is_active,
  full_name,
  created_at
FROM user_profiles
WHERE email = 'admin@test.com';

-- Step 3: Check if IDs match
SELECT 
  'STEP 3: Check ID matching' AS step,
  u.id AS auth_user_id,
  up.id AS profile_id,
  u.id = up.id AS ids_match,
  u.email AS auth_email,
  up.email AS profile_email,
  up.role,
  up.is_active
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'admin@test.com';

-- Step 4: Check RLS policies on user_profiles
SELECT 
  'STEP 4: Check RLS policies' AS step,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_profiles';

-- Step 5: Test query as authenticated user (simulate what the app does)
-- This will show if RLS is blocking the query
DO $$
DECLARE
  _user_id UUID;
  _profile_count INTEGER;
BEGIN
  -- Get the user ID
  SELECT id INTO _user_id FROM auth.users WHERE email = 'admin@test.com' LIMIT 1;
  
  IF _user_id IS NULL THEN
    RAISE NOTICE '❌ User does not exist in auth.users';
    RETURN;
  END IF;
  
  RAISE NOTICE 'User ID: %', _user_id;
  
  -- Count profiles (this simulates what the app query does)
  SELECT COUNT(*) INTO _profile_count
  FROM user_profiles
  WHERE id = _user_id;
  
  IF _profile_count = 0 THEN
    RAISE NOTICE '❌ No profile found for user ID: %', _user_id;
    RAISE NOTICE 'This means the profile was not created or the ID does not match';
  ELSE
    RAISE NOTICE '✅ Profile found! Count: %', _profile_count;
  END IF;
END $$;

-- Step 6: FIX - Create/Update profile with correct user ID
-- This will ensure the profile exists with the correct ID
INSERT INTO user_profiles (id, email, full_name, role, is_active, created_at, updated_at)
SELECT 
  u.id,  -- Use the exact ID from auth.users
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
  role = 'admin',
  is_active = true,
  updated_at = NOW();

-- Step 7: Final verification
SELECT 
  'STEP 7: FINAL VERIFICATION' AS step,
  u.id AS auth_user_id,
  u.email AS auth_email,
  u.email_confirmed_at IS NOT NULL AS email_confirmed,
  up.id AS profile_id,
  up.email AS profile_email,
  up.role AS profile_role,
  up.is_active,
  CASE 
    WHEN u.id IS NULL THEN '❌ USER DOES NOT EXIST'
    WHEN u.email_confirmed_at IS NULL THEN '❌ EMAIL NOT CONFIRMED'
    WHEN up.id IS NULL THEN '❌ PROFILE DOES NOT EXIST'
    WHEN up.id != u.id THEN '❌ IDS DO NOT MATCH'
    WHEN up.role != 'admin' THEN '❌ ROLE IS NOT ADMIN'
    WHEN up.is_active = false THEN '❌ ACCOUNT INACTIVE'
    ELSE '✅ EVERYTHING LOOKS GOOD - TRY LOGGING IN'
  END AS final_status
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'admin@test.com';

