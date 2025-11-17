import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { UserRole } from '@/types/database.types';

export const dynamic = 'force-dynamic';

interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  store_id?: string;
}

/**
 * POST /api/auth/register
 * Register a new user account
 * 
 * Body:
 * {
 *   email: string (required)
 *   password: string (required, min 6 characters)
 *   full_name: string (required)
 *   role: 'admin' | 'store_owner' | 'driver' | 'kitchen_staff' (required)
 *   phone?: string (optional)
 *   store_id?: string (optional, required for store_owner)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();

    let body: RegisterRequest;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { email, password, full_name, role, phone, store_id } = body;

    // Validation
    if (!email || !password || !full_name || !role) {
      return NextResponse.json(
        { error: 'Email, password, full_name, and role are required' },
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

    const validRoles: UserRole[] = ['admin', 'store_owner', 'driver', 'kitchen_staff'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }

    // Store owner must have a store_id
    if (role === 'store_owner' && !store_id) {
      return NextResponse.json(
        { error: 'store_id is required for store_owner role' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Verify store exists if store_id is provided
    if (store_id) {
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('id', store_id)
        .single();

      if (storeError || !store) {
        return NextResponse.json(
          { error: 'Invalid store_id. Store does not exist.' },
          { status: 400 }
        );
      }
    }

    // Create new user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: full_name,
        role: role,
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

    const userId = authData.user.id;

    // Create user profile
    const profileData: any = {
      id: userId,
      email: email,
      full_name: full_name,
      role: role,
      is_active: true,
    };

    if (phone) {
      profileData.phone = phone;
    }

    if (store_id) {
      profileData.store_id = store_id;
    }

    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert(profileData);

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
      message: 'Account created successfully',
      user: {
        id: userId,
        email: email,
        full_name: full_name,
        role: role,
      },
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to register user',
        details: error.details || null
      },
      { status: 500 }
    );
  }
}

