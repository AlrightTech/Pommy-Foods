-- ============================================================================
-- ADMIN LOGIN SQL COMMANDS
-- ============================================================================
-- This file contains SQL commands for managing and verifying admin login
-- Use these commands in Supabase Dashboard → SQL Editor
-- ============================================================================
--
-- ⚠️ IMPORTANT WARNINGS:
-- 1. Queries with '00000000-0000-0000-0000-000000000000' are PLACEHOLDERS
--    - You MUST replace them with actual UUIDs before running
--    - Run the "Get UUID" query first to find the correct UUID
-- 2. Prefer email-based queries when possible (they're safer and easier)
-- 3. Always test queries on non-production data first
-- ============================================================================

-- ============================================================================
-- DATABASE STRUCTURE OVERVIEW
-- ============================================================================
-- 
-- IMPORTANT: Passwords are NOT stored in user_profiles table!
--
-- Database Structure:
-- 
-- 1. auth.users (System table managed by Supabase Auth)
--    - id (UUID) - Primary key
--    - email (TEXT) - User email
--    - encrypted_password (TEXT) - Password hash (NOT accessible via SQL)
--    - email_confirmed_at (TIMESTAMP) - Email confirmation status
--    - created_at, updated_at, etc.
--    - NOTE: You CANNOT directly INSERT/UPDATE passwords via SQL
--    - Passwords must be set via Supabase Dashboard or Auth API
--
-- 2. user_profiles (Application table - extends auth.users)
--    - id (UUID) - References auth.users(id)
--    - email (VARCHAR) - User email (duplicated for convenience)
--    - full_name (VARCHAR) - User's full name
--    - role (user_role) - User role: 'admin', 'store_owner', 'driver', 'kitchen_staff'
--    - store_id (UUID) - Optional: Associated store (NULL for admins)
--    - phone (VARCHAR) - Optional phone number
--    - is_active (BOOLEAN) - Account active status
--    - created_at, updated_at - Timestamps
--    - NOTE: NO password field - passwords are in auth.users only
--
-- Admin Login Process:
-- 1. User authenticates with email/password → Supabase Auth checks auth.users
-- 2. If authentication succeeds, check user_profiles for role = 'admin'
-- 3. If role is 'admin' and is_active = true, allow access
--
-- ============================================================================

-- ============================================================================
-- 0. GET USER UUID (Use this before queries that need UUID)
-- ============================================================================
-- If you need a user's UUID, run this query first:
-- (Most queries below use email instead, which is easier)

SELECT id, email, email_confirmed_at, created_at
FROM auth.users 
WHERE email = 'admin@pommyfoods.com';  -- Replace with your email

-- Copy the 'id' value from the result and use it in queries that require UUID
-- ============================================================================

-- ============================================================================
-- 0. VIEW TABLE STRUCTURES (Verify database schema)
-- ============================================================================
-- Use these queries to see the actual structure of the tables

-- View user_profiles table structure:
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- View auth.users table structure (readable columns only):
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'auth' 
  AND table_name = 'users'
  AND column_name IN ('id', 'email', 'email_confirmed_at', 'created_at', 'last_sign_in_at', 'updated_at')
ORDER BY ordinal_position;

-- Note: encrypted_password exists in auth.users but is not directly accessible via SQL

-- ============================================================================
-- 1. VERIFY ADMIN LOGIN STATUS (Check if user can login as admin)
-- ============================================================================
-- Use this to check if a user has admin role and can login to admin panel
-- 
-- RECOMMENDED: Use the email-based query below (easier and safer)

-- By Email (RECOMMENDED - No UUID needed):
SELECT 
  u.id AS user_id,
  u.email,
  u.email_confirmed_at,
  u.created_at AS auth_created_at,
  up.role,
  up.full_name,
  up.is_active,
  up.created_at AS profile_created_at,
  CASE 
    WHEN u.id IS NULL THEN 'User does not exist in auth.users'
    WHEN up.id IS NULL THEN 'User exists but no profile found - cannot login'
    WHEN up.role != 'admin' THEN 'User exists but role is not admin'
    WHEN up.is_active = false THEN 'User exists but account is inactive'
    WHEN u.email_confirmed_at IS NULL THEN 'User exists but email not confirmed'
    ELSE 'User can login as admin'
  END AS login_status
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'admin@pommyfoods.com';  -- Replace with your email

-- By User ID (REPLACE '00000000-0000-0000-0000-000000000000' WITH ACTUAL UUID):
-- First, get the UUID from this query:
-- SELECT id, email FROM auth.users WHERE email = 'admin@pommyfoods.com';
--
-- Then use it in the query below:
SELECT 
  u.id AS user_id,
  u.email,
  u.email_confirmed_at,
  up.role,
  up.full_name,
  up.is_active,
  CASE 
    WHEN up.role = 'admin' AND up.is_active = true AND u.email_confirmed_at IS NOT NULL 
    THEN 'Can login as admin'
    ELSE 'Cannot login as admin'
  END AS login_status
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.id = '00000000-0000-0000-0000-000000000000'::UUID;  -- ⚠️ REPLACE WITH ACTUAL UUID FROM ABOVE QUERY

-- ============================================================================
-- 2. CREATE ADMIN PROFILE FOR LOGIN (After creating user in Auth Dashboard)
-- ============================================================================
-- Step 1: First create user in Supabase Dashboard → Authentication → Users
-- Step 2: Get the User ID from auth.users
-- Step 3: Run this command (replace USER_ID and email):

-- Option A: Using the helper function (Recommended)
-- ⚠️ IMPORTANT: First get the UUID, then replace '00000000-0000-0000-0000-000000000000' below
-- Step 1: Get UUID: SELECT id, email FROM auth.users WHERE email = 'admin@pommyfoods.com';
-- Step 2: Copy the UUID and use it in the query below:
SELECT create_admin_profile(
  '00000000-0000-0000-0000-000000000000'::UUID,  -- ⚠️ REPLACE WITH ACTUAL UUID FROM STEP 1
  'admin@pommyfoods.com',  -- User's email
  'Admin User'  -- Full name
);

-- Option B: Direct SQL insert
-- ⚠️ IMPORTANT: First get the UUID, then replace '00000000-0000-0000-0000-000000000000' below
-- Step 1: Get UUID: SELECT id, email FROM auth.users WHERE email = 'admin@pommyfoods.com';
-- Step 2: Copy the UUID and use it in the query below:
INSERT INTO user_profiles (id, email, full_name, role, is_active, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000000'::UUID,  -- ⚠️ REPLACE WITH ACTUAL UUID FROM STEP 1
  'admin@pommyfoods.com',  -- User's email
  'Admin User',  -- Full name
  'admin',  -- Role
  true,  -- Is active
  NOW(),  -- Created at
  NOW()   -- Updated at
)
ON CONFLICT (id) DO UPDATE 
SET 
  role = 'admin',
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  is_active = true,
  updated_at = NOW();

-- ============================================================================
-- 3. UPDATE EXISTING USER TO ADMIN ROLE (Enable admin login)
-- ============================================================================

-- By Email:
UPDATE user_profiles
SET 
  role = 'admin',
  is_active = true,
  updated_at = NOW()
WHERE email = 'admin@pommyfoods.com';  -- Replace with your email

-- By User ID (REPLACE '00000000-0000-0000-0000-000000000000' WITH ACTUAL UUID):
-- First, get the UUID: SELECT id, email FROM auth.users WHERE email = 'admin@pommyfoods.com';
UPDATE user_profiles
SET 
  role = 'admin',
  is_active = true,
  updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000000'::UUID;  -- ⚠️ REPLACE WITH ACTUAL UUID FROM ABOVE QUERY

-- ============================================================================
-- 4. LIST ALL ADMIN USERS (Who can login as admin)
-- ============================================================================

SELECT 
  up.id,
  up.email,
  up.full_name,
  up.role,
  up.is_active,
  u.email_confirmed_at,
  up.created_at,
  up.updated_at,
  CASE 
    WHEN u.email_confirmed_at IS NULL THEN 'Email not confirmed'
    WHEN up.is_active = false THEN 'Account inactive'
    ELSE 'Can login'
  END AS login_status
FROM user_profiles up
LEFT JOIN auth.users u ON up.id = u.id
WHERE up.role = 'admin'
ORDER BY up.created_at DESC;

-- ============================================================================
-- 5. CHECK IF USER EXISTS IN AUTH AND HAS ADMIN PROFILE
-- ============================================================================

-- Complete check for a specific email:
SELECT 
  CASE 
    WHEN u.id IS NULL THEN 'User does not exist in auth.users - Create user first in Dashboard'
    WHEN up.id IS NULL THEN 'User exists in auth but no profile - Run create_admin_profile()'
    WHEN up.role != 'admin' THEN 'User exists but role is ' || up.role || ' - Update role to admin'
    WHEN up.is_active = false THEN 'User exists but account is inactive - Set is_active = true'
    WHEN u.email_confirmed_at IS NULL THEN 'User exists but email not confirmed'
    ELSE 'User is ready to login as admin'
  END AS status,
  u.id AS auth_user_id,
  u.email AS auth_email,
  u.email_confirmed_at,
  up.role AS profile_role,
  up.is_active AS profile_is_active,
  up.full_name
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'admin@pommyfoods.com';  -- Replace with your email

-- ============================================================================
-- 6. QUICK ADMIN SETUP (Complete setup in one query)
-- ============================================================================
-- This assumes the user already exists in auth.users
-- Replace USER_ID_HERE with the actual UUID from auth.users

-- Step 1: Get user ID (if you don't have it)
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'admin@pommyfoods.com';

-- Step 2: Create/Update admin profile
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
WHERE email = 'admin@pommyfoods.com'
ON CONFLICT (id) DO UPDATE 
SET 
  role = 'admin',
  email = EXCLUDED.email,
  full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
  is_active = true,
  updated_at = NOW();

-- ============================================================================
-- 7. TROUBLESHOOTING: Find why admin login is failing
-- ============================================================================

SELECT 
  'Auth User Check' AS check_type,
  CASE 
    WHEN COUNT(*) = 0 THEN 'FAIL: User does not exist in auth.users'
    WHEN COUNT(*) > 0 THEN 'PASS: User exists in auth.users'
  END AS result
FROM auth.users 
WHERE email = 'admin@pommyfoods.com'

UNION ALL

SELECT 
  'Email Confirmation Check' AS check_type,
  CASE 
    WHEN email_confirmed_at IS NULL THEN 'FAIL: Email not confirmed'
    ELSE 'PASS: Email confirmed'
  END AS result
FROM auth.users 
WHERE email = 'admin@pommyfoods.com'

UNION ALL

SELECT 
  'Profile Exists Check' AS check_type,
  CASE 
    WHEN COUNT(*) = 0 THEN 'FAIL: No profile found in user_profiles'
    WHEN COUNT(*) > 0 THEN 'PASS: Profile exists'
  END AS result
FROM user_profiles up
INNER JOIN auth.users u ON up.id = u.id
WHERE u.email = 'admin@pommyfoods.com'

UNION ALL

SELECT 
  'Admin Role Check' AS check_type,
  CASE 
    WHEN up.role != 'admin' THEN 'FAIL: Role is ' || up.role || ' (should be admin)'
    ELSE 'PASS: Role is admin'
  END AS result
FROM user_profiles up
INNER JOIN auth.users u ON up.id = u.id
WHERE u.email = 'admin@pommyfoods.com'

UNION ALL

SELECT 
  'Active Status Check' AS check_type,
  CASE 
    WHEN up.is_active = false THEN 'FAIL: Account is inactive'
    ELSE 'PASS: Account is active'
  END AS result
FROM user_profiles up
INNER JOIN auth.users u ON up.id = u.id
WHERE u.email = 'admin@pommyfoods.com';

-- ============================================================================
-- 8. VIEW USER AUTHENTICATION INFO (Read-only from auth.users)
-- ============================================================================
-- Note: You can only READ from auth.users, not modify passwords
-- Passwords are encrypted and stored in auth.users.encrypted_password (not accessible)
-- 
-- View user authentication status:
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at,
  updated_at
FROM auth.users
WHERE email = 'admin@pommyfoods.com';  -- Replace with your email

-- ============================================================================
-- 9. PASSWORD MANAGEMENT (Cannot be done via SQL)
-- ============================================================================
-- IMPORTANT: Passwords are stored in auth.users.encrypted_password
-- You CANNOT set or reset passwords via SQL commands!
--
-- To set/reset passwords, use one of these methods:
--
-- Method 1: Supabase Dashboard
--   1. Go to Supabase Dashboard → Authentication → Users
--   2. Find the user by email
--   3. Click "..." → "Reset Password" or "Change Password"
--
-- Method 2: Supabase Auth API (Server-side only)
--   Use the Admin API with service_role key:
--   - auth.admin.updateUserById() - Update user including password
--   - auth.admin.generateLink() - Generate password reset link
--
-- Method 3: User Self-Service
--   - Send password reset email via Supabase Auth
--   - User clicks link and sets new password
--
-- ============================================================================

-- ============================================================================
-- EXAMPLE USAGE
-- ============================================================================

-- Example 1: Check if admin@pommyfoods.com can login
-- SELECT * FROM (query in section 1) WHERE email = 'admin@pommyfoods.com';

-- Example 2: Create admin profile for existing user
-- First get UUID: SELECT id FROM auth.users WHERE email = 'admin@pommyfoods.com';
-- Then run: SELECT create_admin_profile('123e4567-e89b-12d3-a456-426614174000'::UUID, 'admin@pommyfoods.com', 'Test Admin');

-- Example 3: List all admins
-- SELECT * FROM (query in section 4);

-- ============================================================================
-- NOTES
-- ============================================================================
-- 
-- 1. Admin login requires:
--    - User exists in auth.users (created via Dashboard or API)
--    - User has profile in user_profiles with role = 'admin'
--    - User profile has is_active = true
--    - User email is confirmed (email_confirmed_at IS NOT NULL)
--
-- 2. You CANNOT create users directly in auth.users via SQL
--    - Must use Supabase Dashboard → Authentication → Users
--    - Or use Supabase Auth API (auth.admin.createUser())
--
-- 3. After creating user in auth.users, use create_admin_profile() function
--    or direct INSERT into user_profiles to assign admin role
--
-- 4. Password management:
--    - Passwords are stored in auth.users.encrypted_password (system table)
--    - You CANNOT read or modify passwords via SQL
--    - Must use Supabase Dashboard or Auth API to set/reset passwords
--    - user_profiles table does NOT contain password field
--
-- 5. Database Tables:
--    - auth.users: System table (managed by Supabase Auth)
--      * Contains: id, email, encrypted_password, email_confirmed_at, etc.
--      * Cannot INSERT/UPDATE via SQL (except in special cases with service_role)
--    - user_profiles: Application table (your custom table)
--      * Contains: id, email, full_name, role, is_active, store_id, phone
--      * NO password field - passwords are only in auth.users
--      * Can INSERT/UPDATE via SQL (with proper permissions)
--
-- ============================================================================

