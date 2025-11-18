# Quick Admin Setup Guide - Supabase SQL

## Fastest Method: Using SQL Functions

### Step 1: Create User in Supabase Dashboard

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Enter:
   - **Email**: `admin@pommyfoods.com`
   - **Password**: `Admin123456`
   - **Auto Confirm User**: ✅ Enable
4. Click **"Create user"**
5. **Copy the User ID** (UUID) - you'll see it in the user list

### Step 2: Run SQL in Supabase SQL Editor

Open **SQL Editor** in Supabase Dashboard and run:

```sql
-- Replace USER_ID_HERE with the UUID from Step 1
SELECT create_admin_profile(
  'USER_ID_HERE'::UUID,
  'admin@pommyfoods.com',
  'Test Admin'
);
```

**Example:**
```sql
SELECT create_admin_profile(
  '123e4567-e89b-12d3-a456-426614174000'::UUID,
  'admin@pommyfoods.com',
  'Test Admin'
);
```

### Step 3: Verify Admin Role

```sql
SELECT 
  id,
  email,
  full_name,
  role,
  is_active
FROM user_profiles
WHERE email = 'admin@pommyfoods.com';
```

You should see `role = 'admin'`.

## Alternative: Direct SQL Insert

If you prefer direct SQL:

```sql
-- Step 1: Get user ID
SELECT id, email FROM auth.users WHERE email = 'admin@pommyfoods.com';

-- Step 2: Insert admin profile (replace USER_ID with actual UUID)
INSERT INTO user_profiles (id, email, full_name, role, is_active, created_at, updated_at)
VALUES (
  'USER_ID_HERE'::UUID,
  'admin@pommyfoods.com',
  'Test Admin',
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
```

## Test Credentials

After setup, login with:
- **Email**: `admin@pommyfoods.com`
- **Password**: `Admin123456`
- **URL**: `http://localhost:3000/admin/login`

## Available User Roles

The system supports these roles (defined in `user_role` enum):
- `admin` - Full system access
- `store_owner` - Store management access
- `driver` - Delivery management access
- `kitchen_staff` - Kitchen operations access

## Helper Functions Available

After running the migration, these functions are available:

1. **`assign_admin_role(user_id, email, full_name)`**
   - Assigns admin role to existing user

2. **`create_admin_profile(user_id, email, full_name)`**
   - Creates admin profile (recommended)

## Troubleshooting

### Function not found
- Make sure you've run the migration: `supabase/migrations/20240315000002_admin_user_setup.sql`

### User not found
- Verify the user exists in `auth.users`:
  ```sql
  SELECT id, email FROM auth.users WHERE email = 'admin@pommyfoods.com';
  ```

### Permission denied
- The service role bypasses RLS, so this should work from SQL Editor
- If using authenticated user, ensure you have admin role first



