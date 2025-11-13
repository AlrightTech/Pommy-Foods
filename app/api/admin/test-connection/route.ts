import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/test-connection
 * Diagnostic endpoint to test Supabase admin connection
 */
export async function GET() {
  try {
    // Test environment variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    const envCheck = {
      hasUrl: !!url,
      hasServiceKey: !!serviceKey,
      urlLength: url.length,
      keyLength: serviceKey.length,
      urlPreview: url ? `${url.substring(0, 30)}...` : 'missing',
      keyStartsWithEyJ: serviceKey.startsWith('eyJ'),
      keyFirstChars: serviceKey ? serviceKey.substring(0, 20) : 'missing',
    };

    // Try to create admin client
    let adminSupabase;
    try {
      adminSupabase = getSupabaseAdmin();
    } catch (adminError: any) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create Supabase admin client',
        details: adminError.message,
        envCheck,
      }, { status: 500 });
    }

    // Try a simple query
    try {
      const { data, error } = await adminSupabase
        .from('products')
        .select('id')
        .limit(1);

      if (error) {
        return NextResponse.json({
          success: false,
          error: 'Supabase query failed',
          details: error.message,
          code: error.code,
          hint: error.hint,
          envCheck,
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Connection successful',
        productsFound: data?.length || 0,
        envCheck,
      });
    } catch (queryError: any) {
      return NextResponse.json({
        success: false,
        error: 'Query execution failed',
        details: queryError.message,
        envCheck,
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}

