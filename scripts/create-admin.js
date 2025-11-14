/**
 * Script to create an admin user account
 * 
 * Usage:
 *   node scripts/create-admin.js <email> <password> [full_name]
 * 
 * Example:
 *   node scripts/create-admin.js admin@pommyfoods.com SecurePassword123 "Admin User"
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.local if it exists
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please ensure .env.local contains:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createAdminAccount(email, password, fullName = 'Admin User') {
  try {
    console.log('🔐 Creating admin account...');
    console.log(`   Email: ${email}`);
    console.log(`   Name: ${fullName}`);

    // Step 1: Create user in Supabase Auth
    console.log('\n📝 Step 1: Creating user in Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName,
      },
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('⚠️  User already exists. Updating to admin role...');
        // Get existing user
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === email);
        
        if (!existingUser) {
          throw new Error('User exists but could not be found');
        }

        // Update user profile to admin
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            id: existingUser.id,
            email: email,
            full_name: fullName,
            role: 'admin',
            is_active: true,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'id',
          });

        if (profileError) {
          throw profileError;
        }

        console.log('✅ Admin role assigned to existing user!');
        console.log(`\n📋 Admin Account Details:`);
        console.log(`   User ID: ${existingUser.id}`);
        console.log(`   Email: ${email}`);
        console.log(`   Role: admin`);
        console.log(`\n✅ You can now login with these credentials!`);
        return;
      }
      throw authError;
    }

    if (!authData?.user) {
      throw new Error('Failed to create user - no user data returned');
    }

    console.log('✅ User created successfully!');
    console.log(`   User ID: ${authData.user.id}`);

    // Step 2: Create user profile with admin role
    console.log('\n📝 Step 2: Creating admin profile...');
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: email,
        full_name: fullName,
        role: 'admin',
        is_active: true,
      });

    if (profileError) {
      // If profile creation fails, try to delete the auth user
      console.error('❌ Error creating profile, cleaning up...');
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    console.log('✅ Admin profile created successfully!');

    // Success summary
    console.log('\n✅ Admin account created successfully!');
    console.log(`\n📋 Admin Account Details:`);
    console.log(`   User ID: ${authData.user.id}`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: admin`);
    console.log(`   Full Name: ${fullName}`);
    console.log(`\n🔗 Login URL: http://localhost:3000/admin/login`);
    console.log(`\n⚠️  Please save these credentials securely!`);

  } catch (error) {
    console.error('\n❌ Error creating admin account:');
    console.error(`   ${error.message}`);
    
    if (error.details) {
      console.error(`   Details: ${error.details}`);
    }
    
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('❌ Error: Missing required arguments');
  console.error('\nUsage:');
  console.error('  node scripts/create-admin.js <email> <password> [full_name]');
  console.error('\nExample:');
  console.error('  node scripts/create-admin.js admin@pommyfoods.com SecurePassword123 "Admin User"');
  process.exit(1);
}

const [email, password, fullName] = args;

// Validate email format
if (!email.includes('@')) {
  console.error('❌ Error: Invalid email format');
  process.exit(1);
}

// Validate password length
if (password.length < 6) {
  console.error('❌ Error: Password must be at least 6 characters long');
  process.exit(1);
}

// Run the script
createAdminAccount(email, password, fullName || 'Admin User')
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });

