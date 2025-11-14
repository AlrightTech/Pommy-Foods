-- ============================================================================
-- QUICK ADMIN FIX - COPY AND PASTE THIS ENTIRE SCRIPT
-- ============================================================================

-- FIRST: Make sure user exists in Dashboard
-- If not, create it: Dashboard → Authentication → Users → Add user
-- Email: admin@test.com, Password: Admin123456, Enable "Auto Confirm"

-- THEN: Run this entire script below

-- Create admin profile (works even if it already exists)
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

-- Verify
SELECT 
  '✅ SUCCESS!' AS message,
  u.email,
  up.role,
  up.is_active,
  'Login with: admin@test.com / Admin123456' AS credentials
FROM auth.users u
INNER JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'admin@test.com' AND up.role = 'admin' AND up.is_active = true;

