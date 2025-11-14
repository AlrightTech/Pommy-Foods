-- Admin User Setup and Helper Functions
-- This migration provides SQL functions and instructions for creating admin users
--
-- QUICK START:
-- 1. Create user in Supabase Dashboard → Authentication → Users
-- 2. Copy the User ID (UUID)
-- 3. Run: SELECT create_admin_profile('USER_ID'::UUID, 'email@example.com', 'Admin Name');
--
-- ============================================================================
-- HELPER FUNCTION: Assign Admin Role to Existing User
-- ============================================================================
-- This function can be used to assign admin role to a user that already exists
-- in auth.users. You need the user's UUID from auth.users table.

CREATE OR REPLACE FUNCTION assign_admin_role(user_id UUID, user_email TEXT, user_full_name TEXT DEFAULT 'Admin User')
RETURNS void AS $$
BEGIN
  -- Insert or update user profile with admin role
  INSERT INTO user_profiles (id, email, full_name, role, is_active, created_at, updated_at)
  VALUES (
    user_id,
    user_email,
    user_full_name,
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- HELPER FUNCTION: Create Admin User Profile (for use after creating user in Auth)
-- ============================================================================
-- This function creates a user profile with admin role
-- Use this after creating a user in Supabase Authentication Dashboard

CREATE OR REPLACE FUNCTION create_admin_profile(
  p_user_id UUID,
  p_email TEXT,
  p_full_name TEXT DEFAULT 'Admin User'
)
RETURNS void AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name, role, is_active, created_at, updated_at)
  VALUES (
    p_user_id,
    p_email,
    p_full_name,
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- INSTRUCTIONS FOR CREATING ADMIN USERS IN SUPABASE
-- ============================================================================

-- METHOD 1: Using Supabase Dashboard + SQL Function
-- 
-- Step 1: Create user in Supabase Dashboard
--   1. Go to Authentication → Users
--   2. Click "Add user" → "Create new user"
--   3. Enter email and password
--   4. Enable "Auto Confirm User"
--   5. Copy the User ID (UUID)
--
-- Step 2: Run this SQL (replace USER_ID and email):
--
-- SELECT create_admin_profile(
--   'USER_ID_HERE'::UUID,  -- Replace with actual UUID from Step 1
--   'admin@pommyfoods.com',  -- Replace with user's email
--   'Admin User'  -- Optional: Full name
-- );
--
-- Example:
-- SELECT create_admin_profile(
--   '123e4567-e89b-12d3-a456-426614174000'::UUID,
--   'admin@pommyfoods.com',
--   'Test Admin'
-- );

-- ============================================================================
-- METHOD 2: Direct SQL Insert (if user already exists in auth.users)
-- ============================================================================
-- 
-- If you already have a user in auth.users and want to make them admin:
--
-- Step 1: Get the user ID from auth.users:
-- SELECT id, email FROM auth.users WHERE email = 'admin@pommyfoods.com';
--
-- Step 2: Insert into user_profiles:
--
-- INSERT INTO user_profiles (id, email, full_name, role, is_active, created_at, updated_at)
-- VALUES (
--   'USER_ID_FROM_STEP_1'::UUID,  -- Replace with actual UUID
--   'admin@pommyfoods.com',  -- User's email
--   'Admin User',  -- Full name
--   'admin',  -- Role
--   true,  -- Is active
--   NOW(),  -- Created at
--   NOW()   -- Updated at
-- )
-- ON CONFLICT (id) DO UPDATE 
-- SET 
--   role = 'admin',
--   email = EXCLUDED.email,
--   full_name = EXCLUDED.full_name,
--   is_active = true,
--   updated_at = NOW();
--
-- Example:
-- INSERT INTO user_profiles (id, email, full_name, role, is_active, created_at, updated_at)
-- VALUES (
--   '123e4567-e89b-12d3-a456-426614174000'::UUID,
--   'admin@pommyfoods.com',
--   'Test Admin',
--   'admin',
--   true,
--   NOW(),
--   NOW()
-- )
-- ON CONFLICT (id) DO UPDATE 
-- SET role = 'admin', updated_at = NOW();

-- ============================================================================
-- METHOD 3: Using the Helper Function (Recommended)
-- ============================================================================
--
-- Step 1: Create user in Supabase Dashboard (Authentication → Users)
-- Step 2: Get the user ID:
--   SELECT id, email FROM auth.users WHERE email = 'admin@pommyfoods.com';
--
-- Step 3: Call the function:
--   SELECT assign_admin_role(
--     'USER_ID_HERE'::UUID,
--     'admin@pommyfoods.com',
--     'Admin User'
--   );
--
-- Example:
--   SELECT assign_admin_role(
--     '123e4567-e89b-12d3-a456-426614174000'::UUID,
--     'admin@pommyfoods.com',
--     'Test Admin'
--   );

-- ============================================================================
-- QUERY TO CHECK USER ROLES
-- ============================================================================
-- Use this to verify a user has admin role:
--
-- SELECT 
--   u.id,
--   u.email,
--   up.role,
--   up.full_name,
--   up.is_active
-- FROM auth.users u
-- LEFT JOIN user_profiles up ON u.id = up.id
-- WHERE u.email = 'admin@pommyfoods.com';
--
-- Or to list all admin users:
--
-- SELECT 
--   up.id,
--   up.email,
--   up.full_name,
--   up.role,
--   up.is_active,
--   up.created_at
-- FROM user_profiles up
-- WHERE up.role = 'admin';

-- ============================================================================
-- QUERY TO LIST ALL USER ROLES
-- ============================================================================
-- SELECT 
--   u.id,
--   u.email,
--   u.email_confirmed_at,
--   up.role,
--   up.full_name,
--   up.is_active,
--   up.store_id
-- FROM auth.users u
-- LEFT JOIN user_profiles up ON u.id = up.id
-- ORDER BY up.role, u.email;

-- ============================================================================
-- UPDATE EXISTING USER TO ADMIN ROLE
-- ============================================================================
-- If you need to change an existing user's role to admin:
--
-- UPDATE user_profiles
-- SET 
--   role = 'admin',
--   updated_at = NOW()
-- WHERE id = 'USER_ID_HERE'::UUID;
--
-- Or by email:
--
-- UPDATE user_profiles
-- SET 
--   role = 'admin',
--   updated_at = NOW()
-- WHERE email = 'admin@pommyfoods.com';

-- ============================================================================
-- TEST ADMIN USER CREATION (Uncomment and modify to use)
-- ============================================================================
-- 
-- IMPORTANT: This requires a user to exist in auth.users first!
-- Create the user in Supabase Dashboard → Authentication → Users first,
-- then replace USER_ID_HERE with the actual UUID.
--
-- Example for test admin:
-- 
-- INSERT INTO user_profiles (id, email, full_name, role, is_active, created_at, updated_at)
-- SELECT 
--   id,
--   email,
--   'Test Admin',
--   'admin',
--   true,
--   NOW(),
--   NOW()
-- FROM auth.users
-- WHERE email = 'admin@pommyfoods.com'
-- ON CONFLICT (id) DO UPDATE 
-- SET 
--   role = 'admin',
--   full_name = 'Test Admin',
--   is_active = true,
--   updated_at = NOW();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
-- Ensure the functions can be executed by authenticated users
GRANT EXECUTE ON FUNCTION assign_admin_role(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_admin_profile(UUID, TEXT, TEXT) TO authenticated;

-- ============================================================================
-- SIMPLE ONE-COMMAND ADMIN SETUP (Use this after creating user in Dashboard)
-- ============================================================================
-- 
-- Step 1: Create user in Supabase Dashboard → Authentication → Users
--         (Email: your-email@example.com, Password: your-password, Enable "Auto Confirm")
-- 
-- Step 2: Run this ONE command in SQL Editor (replace email):
--
-- Option A: Using the function (Recommended - works even with RLS):
SELECT create_admin_profile(
  (SELECT id FROM auth.users WHERE email = 'admin@pommyfoods.com' LIMIT 1),
  'admin@pommyfoods.com',
  'Admin'
);

-- Option B: Direct SQL (only works in SQL Editor with elevated privileges):
-- INSERT INTO user_profiles (id, email, full_name, role, is_active, created_at, updated_at)
-- SELECT id, email, 'Admin', 'admin', true, NOW(), NOW()
-- FROM auth.users
-- WHERE email = 'admin@pommyfoods.com'  -- ⚠️ REPLACE WITH YOUR EMAIL
-- ON CONFLICT (id) DO UPDATE 
-- SET 
--   role = 'admin',
--   email = EXCLUDED.email,
--   is_active = true,
--   updated_at = NOW();

-- That's it! Now you can login with your email and password.
-- ============================================================================

-- ============================================================================
-- NOTES
-- ============================================================================
-- 
-- 1. You CANNOT directly INSERT into auth.users via SQL - it's managed by Supabase Auth
-- 2. Always create users via Supabase Dashboard → Authentication → Users first
-- 3. Then use the functions or SQL above to assign admin role
-- 4. The user_role enum includes: 'admin', 'store_owner', 'driver', 'kitchen_staff'
-- 5. Admin users have full access to all data via RLS policies
--
-- ============================================================================

