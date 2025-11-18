# Admin Account Setup Guide

This guide explains how to create an admin account for the Pommy Foods admin panel.

## Prerequisites

1. Ensure your `.env.local` file is configured with:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. Database migrations should be run (see `supabase/README.md`)

## Method 1: Using the Script (Recommended)

### Step 1: Run the script

```bash
npm run create-admin <email> <password> [full_name]
```

### Example:

```bash
npm run create-admin admin@pommyfoods.com SecurePassword123 "Admin User"
```

Or directly with node:

```bash
node scripts/create-admin.js admin@pommyfoods.com SecurePassword123 "Admin User"
```

### What the script does:

1. ✅ Creates a user in Supabase Authentication
2. ✅ Auto-confirms the email (no email verification needed)
3. ✅ Creates a user profile with `role = 'admin'`
4. ✅ Displays the credentials for you to save

### Output Example:

```
🔐 Creating admin account...
   Email: admin@pommyfoods.com
   Name: Admin User

📝 Step 1: Creating user in Supabase Auth...
✅ User created successfully!
   User ID: 123e4567-e89b-12d3-a456-426614174000

📝 Step 2: Creating admin profile...
✅ Admin profile created successfully!

✅ Admin account created successfully!

📋 Admin Account Details:
   User ID: 123e4567-e89b-12d3-a456-426614174000
   Email: admin@pommyfoods.com
   Password: SecurePassword123
   Role: admin
   Full Name: Admin User

🔗 Login URL: http://localhost:3000/admin/login

⚠️  Please save these credentials securely!
```

## Method 2: Using the API Endpoint

### Step 1: Make a POST request

```bash
curl -X POST http://localhost:3000/api/admin/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pommyfoods.com",
    "password": "SecurePassword123",
    "full_name": "Admin User"
  }'
```

### Using JavaScript/Fetch:

```javascript
const response = await fetch('http://localhost:3000/api/admin/create-admin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@pommyfoods.com',
    password: 'SecurePassword123',
    full_name: 'Admin User'
  })
});

const data = await response.json();
console.log(data);
```

## Method 3: Using Supabase Dashboard (Manual)

### Step 1: Create User in Supabase Auth

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **Authentication** → **Users**
4. Click **"Add user"** → **"Create new user"**
5. Enter:
   - **Email**: `admin@pommyfoods.com`
   - **Password**: `SecurePassword123`
   - **Auto Confirm User**: ✅ Enable
6. Click **"Create user"**
7. **Copy the User ID** (UUID) - you'll need this for the next step

### Step 2: Create Admin Profile

1. Go to **SQL Editor** in Supabase Dashboard
2. Run this SQL (replace `USER_ID_HERE` with the actual User ID):

```sql
INSERT INTO user_profiles (id, email, full_name, role, is_active, created_at, updated_at)
VALUES (
  'USER_ID_HERE',  -- Replace with the actual user UUID from Step 1
  'admin@pommyfoods.com',
  'Admin User',
  'admin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', updated_at = NOW();
```

## Login

After creating the admin account, you can login at:

**URL**: `http://localhost:3000/admin/login`

**Credentials**:
- Email: The email you used when creating the account
- Password: The password you set

## Troubleshooting

### Error: "Missing Supabase credentials"

**Solution**: Ensure your `.env.local` file exists and contains:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Error: "User already exists"

**Solution**: The script will automatically update the existing user to admin role. If you want to use a different email, choose a unique email address.

### Error: "Invalid API key"

**Solution**: 
1. Verify your `SUPABASE_SERVICE_ROLE_KEY` is correct
2. Make sure you're using the **service_role** key (not the anon key)
3. Check for any extra spaces or line breaks in the key

### Error: "Failed to create user profile"

**Solution**:
1. Ensure database migrations have been run
2. Check that the `user_profiles` table exists
3. Verify the user was created in `auth.users` table

### Can't login after creating account

**Check**:
1. User exists in `auth.users` table
2. User profile exists in `user_profiles` table with `role = 'admin'`
3. Email and password are correct
4. User is confirmed (email_confirm = true)

## Security Notes

⚠️ **Important**: 
- The API endpoint (`/api/admin/create-admin`) should be **disabled or protected** in production
- Consider removing it after initial setup or adding authentication
- Never commit `.env.local` to version control
- Store admin credentials securely
- Use strong passwords (minimum 12 characters recommended for production)

## Verification

To verify the admin account was created correctly:

1. Check `auth.users` table in Supabase:
   ```sql
   SELECT id, email, email_confirmed_at FROM auth.users WHERE email = 'admin@pommyfoods.com';
   ```

2. Check `user_profiles` table:
   ```sql
   SELECT * FROM user_profiles WHERE email = 'admin@pommyfoods.com' AND role = 'admin';
   ```

3. Try logging in at `/admin/login`

## Next Steps

After creating the admin account:
1. ✅ Login to the admin panel
2. ✅ Create stores, products, and manage orders
3. ✅ Set up additional admin accounts if needed
4. ✅ Consider disabling the create-admin endpoint in production



