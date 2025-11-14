-- ============================================================================
-- SIMPLEST POSSIBLE ADMIN ACCOUNT CREATION
-- ============================================================================
-- Copy and paste this ENTIRE block into Supabase SQL Editor and run it
-- ============================================================================

-- Step 1: Create user in Dashboard first (if not exists)
-- Go to: Supabase Dashboard → Authentication → Users → Add user
-- Email: admin@test.com
-- Password: Admin123456
-- ✅ Enable "Auto Confirm User"
-- Click "Create user"

-- Step 2: Run this SQL (it will work even if profile already exists)
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
  email = 'admin@test.com',
  is_active = true,
  updated_at = NOW();

-- Step 3: Verify it worked
SELECT 
  u.email,
  up.role,
  up.is_active,
  CASE 
    WHEN up.role = 'admin' AND up.is_active = true 
    THEN '✅ READY - You can login now!'
    ELSE '❌ Something is wrong'
  END AS status
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'admin@test.com';

-- ============================================================================
-- LOGIN CREDENTIALS:
-- Email: admin@test.com
-- Password: Admin123456 (or whatever you set in Dashboard)
-- ============================================================================

