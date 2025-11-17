import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/health
 * Health check endpoint for admin API
 * Returns status of Supabase connection and environment variables
 */
export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    checks: {
      environment: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        urlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
        keyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
        keyFormat: process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith('eyJ') || false,
      },
      supabase: {
        connected: false,
        error: null as string | null,
      },
    },
  };

  // Test Supabase connection
  try {
    const supabase = getSupabaseAdmin();
    
    // Try a simple query
    const { error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);

    if (error) {
      health.status = 'error';
      health.checks.supabase.error = error.message;
    } else {
      health.checks.supabase.connected = true;
    }
  } catch (error: any) {
    health.status = 'error';
    health.checks.supabase.error = error.message || 'Unknown error';
  }

  const statusCode = health.status === 'ok' ? 200 : 500;
  return NextResponse.json(health, { status: statusCode });
}


