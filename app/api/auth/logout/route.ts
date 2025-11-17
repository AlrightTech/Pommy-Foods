import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/logout
 * Logout the current user
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Sign out user
    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to logout', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Logout successful',
    });

  } catch (error: any) {
    console.error('Error logging out user:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to logout',
        details: error.details || null
      },
      { status: 500 }
    );
  }
}

