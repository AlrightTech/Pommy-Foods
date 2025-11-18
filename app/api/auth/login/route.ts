import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface LoginRequest {
  email: string;
  password: string;
}

/**
 * POST /api/auth/login
 * Login a user
 * 
 * Body:
 * {
 *   email: string (required)
 *   password: string (required)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    let body: LoginRequest;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Sign in user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json(
        { error: 'Invalid email or password', details: authError.message },
        { status: 401 }
      );
    }

    if (!authData?.user) {
      return NextResponse.json(
        { error: 'Failed to authenticate user' },
        { status: 500 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    if (!profile.is_active) {
      return NextResponse.json(
        { error: 'Account is inactive. Please contact support.' },
        { status: 403 }
      );
    }

    // Create response with user data
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role,
        store_id: profile.store_id,
      },
    });

    // Set auth cookies (Supabase handles this automatically via the client)
    return response;

  } catch (error: any) {
    console.error('Error logging in user:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to login',
        details: error.details || null
      },
      { status: 500 }
    );
  }
}


