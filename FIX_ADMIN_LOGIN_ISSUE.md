# Fix "Access denied. Admin account required." Error

## Problem
You're getting "Access denied. Admin account required." when trying to log in. This means:
- ✅ Your user exists in `auth.users` (authentication works)
- ❌ Your user doesn't have an admin profile in `user_profiles` table

## Quick Fix: Use the API Endpoint

The easiest way to fix this is to use the admin creation API endpoint:

### Step 1: Create/Update Admin Account via API

Open your browser console or use curl:

```bash
curl -X POST http://localhost:3000/api/admin/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "YOUR_EMAIL_HERE",
    "password": "YOUR_PASSWORD_HERE",
    "full_name": "Admin User"
  }'
```

**Or use JavaScript in browser console:**
```javascript
fetch('http://localhost:3000/api/admin/create-admin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'YOUR_EMAIL_HERE',
    password: 'YOUR_PASSWORD_HERE',
    full_name: 'Admin User'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

**Replace:**
- `YOUR_EMAIL_HERE` with the email you're trying to log in with
- `YOUR_PASSWORD_HERE` with your password (or a new password if user already exists)

This will:
- Create the user if they don't exist
- Update existing user to have admin role
- Create/update the `user_profiles` entry with `role = 'admin'`

### Step 2: Try Logging In Again

After running the API call, try logging in again at `/admin/login`.

## Alternative: Manual Fix via Supabase Dashboard

### Step 1: Get Your User ID

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Find your user by email
3. **Copy the User ID** (UUID)

### Step 2: Run SQL in Supabase SQL Editor

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this SQL (replace `USER_ID_HERE` with your actual User ID):

```sql
-- Option 1: If user profile doesn't exist
INSERT INTO user_profiles (id, email, full_name, role, is_active, created_at, updated_at)
VALUES (
  'USER_ID_HERE'::UUID,  -- Replace with your User ID
  'YOUR_EMAIL_HERE',     -- Replace with your email
  'Admin User',
  'admin',
  true,
  NOW(),
  NOW()
);

-- Option 2: If user profile exists but role is wrong
UPDATE user_profiles
SET 
  role = 'admin',
  is_active = true,
  updated_at = NOW()
WHERE id = 'USER_ID_HERE'::UUID;  -- Replace with your User ID

-- Option 3: Use the helper function (if migration was run)
SELECT assign_admin_role(
  'USER_ID_HERE'::UUID,  -- Replace with your User ID
  'YOUR_EMAIL_HERE',     -- Replace with your email
  'Admin User'
);
```

### Step 3: Verify Admin Role

Run this to check:

```sql
SELECT 
  u.id,
  u.email,
  up.role,
  up.full_name,
  up.is_active
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'YOUR_EMAIL_HERE';  -- Replace with your email
```

You should see `role = 'admin'` and `is_active = true`.

## Check What's Wrong

### Check 1: Does user exist in auth.users?
```sql
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'YOUR_EMAIL_HERE';
```

### Check 2: Does user have a profile?
```sql
SELECT * 
FROM user_profiles 
WHERE email = 'YOUR_EMAIL_HERE';
```

### Check 3: What role does the user have?
```sql
SELECT 
  u.email,
  up.role,
  up.is_active,
  up.full_name
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'YOUR_EMAIL_HERE';
```

## Common Issues

### Issue 1: Profile doesn't exist
**Solution**: Run the INSERT SQL from Step 2 above, or use the API endpoint.

### Issue 2: Profile exists but role is not 'admin'
**Solution**: Run the UPDATE SQL from Step 2 above, or use the API endpoint.

### Issue 3: Profile exists but is_active = false
**Solution**: 
```sql
UPDATE user_profiles
SET is_active = true, updated_at = NOW()
WHERE email = 'YOUR_EMAIL_HERE';
```

### Issue 4: RLS (Row Level Security) blocking query
**Solution**: Check RLS policies. The migration should have set up proper policies. If not, you may need to temporarily disable RLS or use the service role key.

## After Fixing

1. ✅ Clear browser cache/cookies
2. ✅ Try logging in again
3. ✅ Check browser console for any errors
4. ✅ Verify you can access `/admin/dashboard`

## Still Having Issues?

1. **Check browser console** - Look for any JavaScript errors
2. **Check network tab** - See what API calls are being made
3. **Check Supabase logs** - Go to Supabase Dashboard → Logs
4. **Verify environment variables** - Make sure `.env.local` has correct Supabase credentials

## Test Admin Account

If you want to create a fresh test admin account:

```bash
curl -X POST http://localhost:3000/api/admin/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pommyfoods.com",
    "password": "Admin123456",
    "full_name": "Test Admin"
  }'
```

Then login with:
- Email: `admin@pommyfoods.com`
- Password: `Admin123456`


