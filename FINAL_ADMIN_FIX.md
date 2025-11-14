# FINAL ADMIN LOGIN FIX - GUARANTEED TO WORK

## Method 1: Use API Endpoint (RECOMMENDED - Easiest)

**Step 1:** Make sure your dev server is running:
```bash
npm run dev
```

**Step 2:** Open browser console (F12) and run:
```javascript
fetch('http://localhost:3000/api/admin/create-admin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@test.com',
    password: 'Admin123456',
    full_name: 'Admin User'
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Success:', data);
  alert('Admin account created! Login with:\nEmail: admin@test.com\nPassword: Admin123456');
})
.catch(err => {
  console.error('❌ Error:', err);
  alert('Error: ' + err.message);
});
```

**Step 3:** Login with:
- Email: `admin@test.com`
- Password: `Admin123456`

---

## Method 2: Manual SQL (If API doesn't work)

**Step 1:** Create user in Supabase Dashboard:
1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Email: `admin@test.com`
4. Password: `Admin123456`
5. ✅ **Enable "Auto Confirm User"**
6. Click **"Create user"**
7. **Copy the User ID** (UUID) from the user list

**Step 2:** Run this SQL in Supabase SQL Editor:
```sql
-- Replace USER_ID_HERE with the UUID from Step 1
INSERT INTO user_profiles (id, email, full_name, role, is_active, created_at, updated_at)
VALUES (
  'USER_ID_HERE'::UUID,  -- Replace with actual UUID
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

**Step 3:** Login with:
- Email: `admin@test.com`
- Password: `Admin123456`

---

## Method 3: One-Line SQL (If user already exists)

If you already created the user in Dashboard, just run this:

```sql
INSERT INTO user_profiles (id, email, full_name, role, is_active, created_at, updated_at)
SELECT id, email, 'Admin User', 'admin', true, NOW(), NOW()
FROM auth.users
WHERE email = 'admin@test.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', is_active = true, updated_at = NOW();
```

Then login with the password you set in Dashboard.

---

## Troubleshooting

If you still get errors:
1. Check browser console (F12) for exact error message
2. Verify user exists: Run `SELECT id, email FROM auth.users WHERE email = 'admin@test.com';`
3. Verify profile exists: Run `SELECT * FROM user_profiles WHERE email = 'admin@test.com';`
4. Make sure RLS policies are applied (run the RLS migration if needed)

