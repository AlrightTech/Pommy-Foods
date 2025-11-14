# Create Admin Account - Step by Step

## ✅ Step 1: Create User in Supabase Dashboard

1. Open your Supabase Dashboard (or local Supabase Studio)
   - If local: Usually `http://localhost:54323` (check your Supabase status)
   - If cloud: Your Supabase project dashboard

2. Go to **Authentication** → **Users**

3. Click **"Add user"** → **"Create new user"**

4. Fill in:
   - **Email**: `admin@test.com`
   - **Password**: `Admin123456`
   - ✅ **Enable "Auto Confirm User"** (IMPORTANT!)
   - ✅ **Enable "Send invitation email"** (optional, can uncheck)

5. Click **"Create user"**

6. **Copy the User ID** (UUID) - you'll see it in the user list

---

## ✅ Step 2: Create Admin Profile (SQL)

After creating the user, run this SQL in **Supabase SQL Editor**:

```sql
-- Replace USER_ID_HERE with the UUID from Step 1
INSERT INTO user_profiles (id, email, full_name, role, is_active, created_at, updated_at)
VALUES (
  'USER_ID_HERE'::UUID,  -- ⚠️ PASTE YOUR USER ID HERE
  'admin@test.com',
  'Admin User',
  'admin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE 
SET 
  role = 'admin',
  email = 'admin@test.com',
  is_active = true,
  updated_at = NOW();
```

**OR** if you don't want to copy the UUID, use this (it will find the user by email):

```sql
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
```

---

## ✅ Step 3: Verify

Run this to verify everything is correct:

```sql
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at IS NOT NULL AS email_confirmed,
  up.role,
  up.is_active,
  CASE 
    WHEN u.email_confirmed_at IS NULL THEN '❌ Email not confirmed'
    WHEN up.role != 'admin' THEN '❌ Role is wrong'
    WHEN up.is_active = false THEN '❌ Account inactive'
    ELSE '✅ READY TO LOGIN!'
  END AS status
FROM auth.users u
INNER JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'admin@test.com';
```

---

## ✅ Step 4: Login

Go to: `http://localhost:3000/admin/login`

- **Email**: `admin@test.com`
- **Password**: `Admin123456`

---

## 🔧 If Still Not Working

If you still get "invalid credentials":

1. **Check password**: In Dashboard → Authentication → Users → Find `admin@test.com` → Click "..." → "Reset Password" → Set to `Admin123456`

2. **Check email confirmation**: Make sure "Auto Confirm User" was enabled when creating the user

3. **Verify user exists**: Run `SELECT * FROM auth.users WHERE email = 'admin@test.com';` - should return 1 row

4. **Verify profile exists**: Run `SELECT * FROM user_profiles WHERE email = 'admin@test.com';` - should return 1 row with `role = 'admin'`

