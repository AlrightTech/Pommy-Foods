# Test Admin Credentials

## Default Test Admin Account

Use these credentials to create a test admin account for development/testing:

### Credentials:
- **Email**: `admin@pommyfoods.com`
- **Password**: `Admin123456`
- **Full Name**: `Test Admin`
- **Role**: `admin`

## Quick Setup

### Option 1: Using the Script (Once Supabase is configured)

```bash
npm run create-admin admin@pommyfoods.com Admin123456 "Test Admin"
```

### Option 2: Using the API Endpoint

```bash
curl -X POST http://localhost:3000/api/admin/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pommyfoods.com",
    "password": "Admin123456",
    "full_name": "Test Admin"
  }'
```

### Option 3: Manual Setup via Supabase Dashboard

1. Go to Supabase Dashboard → Authentication → Users
2. Create user:
   - Email: `admin@pommyfoods.com`
   - Password: `Admin123456`
   - Auto Confirm: ✅ Enabled
3. Copy the User ID
4. Run this SQL in SQL Editor:

```sql
INSERT INTO user_profiles (id, email, full_name, role, is_active, created_at, updated_at)
VALUES (
  'USER_ID_FROM_STEP_3',  -- Replace with actual UUID
  'admin@pommyfoods.com',
  'Test Admin',
  'admin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', updated_at = NOW();
```

## Login

After creating the account:
- **URL**: `http://localhost:3000/admin/login`
- **Email**: `admin@pommyfoods.com`
- **Password**: `Admin123456`

## Alternative Test Credentials

If you prefer different credentials, you can use:

### Option A:
- Email: `test@admin.com`
- Password: `Test123456`

### Option B:
- Email: `admin@test.com`
- Password: `password123`

### Option C:
- Email: `pommy.admin@test.com`
- Password: `PommyAdmin123`

## Security Note

⚠️ **These are TEST credentials only!**

- Do NOT use these in production
- Change passwords immediately after setup
- Use strong, unique passwords for production accounts
- Never commit credentials to version control

## After Setup

Once you've created the admin account:
1. ✅ Login at `/admin/login`
2. ✅ Verify you can access the admin dashboard
3. ✅ Test creating stores, products, and orders
4. ✅ Create additional admin accounts if needed



