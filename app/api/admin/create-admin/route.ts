import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/create-admin
 * Create an admin user account
 * 
 * Body:
 * {
 *   email: string (required)
 *   password: string (required, min 6 characters)
 *   full_name?: string (optional)
 * }
 * 
 * Note: This endpoint should be protected in production or removed after initial setup
 */
export async function POST(request: NextRequest) {
  try {
    // Get Supabase admin client with proper error handling
    let supabase;
    try {
      supabase = getSupabaseAdmin();
    } catch (adminError: any) {
      console.error('Failed to create Supabase admin client:', adminError);
      return NextResponse.json(
        { 
          error: 'Configuration error',
          details: adminError.message || 'Failed to initialize Supabase admin client. Please check your environment variables.',
          hint: 'Ensure SUPABASE_SERVICE_ROLE_KEY is set in .env.local'
        },
        { status: 500 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { email, password, full_name = 'Admin User' } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    let existingUsers;
    let existingUser;
    try {
      const { data, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        console.error('Error listing users:', listError);
        return NextResponse.json(
          { 
            error: 'Failed to check existing users',
            details: listError.message 
          },
          { status: 500 }
        );
      }
      existingUsers = data;
      existingUser = existingUsers?.users?.find(u => u.email === email);
    } catch (listError: any) {
      console.error('Error checking existing users:', listError);
      return NextResponse.json(
        { 
          error: 'Failed to check existing users',
          details: listError.message 
        },
        { status: 500 }
      );
    }

    let userId: string;

    if (existingUser) {
      // User exists, update profile to admin
      userId = existingUser.id;

      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          email: email,
          full_name: full_name,
          role: 'admin',
          is_active: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id',
        });

      if (profileError) {
        console.error('Error updating profile:', profileError);
        return NextResponse.json(
          { error: 'Failed to update user profile', details: profileError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'Admin role assigned to existing user',
        user: {
          id: userId,
          email: email,
          full_name: full_name,
          role: 'admin',
        },
        note: 'User already existed. Admin role has been assigned.',
      });
    }

    // Create new user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: full_name,
      },
    });

    if (authError) {
      console.error('Error creating user:', authError);
      return NextResponse.json(
        { error: 'Failed to create user', details: authError.message },
        { status: 500 }
      );
    }

    if (!authData?.user) {
      return NextResponse.json(
        { error: 'Failed to create user - no user data returned' },
        { status: 500 }
      );
    }

    userId = authData.user.id;

    // Create user profile with admin role
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        email: email,
        full_name: full_name,
        role: 'admin',
        is_active: true,
      });

    if (profileError) {
      // Cleanup: delete the auth user if profile creation fails
      console.error('Error creating profile, cleaning up...');
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: 'Failed to create user profile', details: profileError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Admin account created successfully',
      user: {
        id: userId,
        email: email,
        full_name: full_name,
        role: 'admin',
      },
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating admin account:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create admin account',
        details: error.details || null
      },
      { status: 500 }
    );
  }
}

