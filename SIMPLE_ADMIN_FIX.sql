-- ============================================================================
-- SIMPLE ADMIN FIX - COPY AND PASTE THIS ENTIRE SCRIPT
-- ============================================================================
-- This will create the admin profile using the function (bypasses RLS)
-- ============================================================================

-- First, verify user exists
DO $$
DECLARE
  _user_id UUID;
BEGIN
  SELECT id INTO _user_id FROM auth.users WHERE email = 'admin@test.com' LIMIT 1;
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION '❌ User admin@test.com does NOT exist in auth.users!
    
    Please create the user first:
    1. Go to Supabase Dashboard → Authentication → Users
    2. Click "Add user" → "Create new user"
    3. Email: admin@test.com
    4. Password: Admin123456
    5. ✅ Enable "Auto Confirm User"
    6. Click "Create user"
    7. Then run this script again';
  END IF;
  
  RAISE NOTICE '✅ User found: %', _user_id;
  
  -- Create/update profile using the function (bypasses RLS)
  PERFORM create_admin_profile(_user_id, 'admin@test.com', 'Admin User');
  
  RAISE NOTICE '✅ Profile created/updated successfully!';
END $$;

-- Verify it worked
SELECT 
  'VERIFICATION' AS step,
  u.id AS user_id,
  u.email,
  u.email_confirmed_at IS NOT NULL AS email_confirmed,
  up.role,
  up.is_active,
  CASE 
    WHEN up.role = 'admin' AND up.is_active = true AND u.email_confirmed_at IS NOT NULL
    THEN '✅ READY TO LOGIN!'
    ELSE '❌ STILL HAS ISSUES'
  END AS status
FROM auth.users u
INNER JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'admin@test.com';

