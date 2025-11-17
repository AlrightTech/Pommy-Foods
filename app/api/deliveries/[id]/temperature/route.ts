import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * POST /api/deliveries/[id]/temperature
 * Record temperature reading
 * 
 * Body:
 * {
 *   temperature: number,
 *   product_id?: string,
 *   location?: string,
 *   notes?: string,
 *   recorded_by: string (driver_id),
 *   source?: 'manual' | 'sensor'
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const body = await request.json();

    const { temperature, product_id, location, notes, recorded_by, source = 'manual' } = body;

    // Validation
    if (temperature === undefined || temperature === null) {
      return NextResponse.json(
        { error: 'Temperature is required' },
        { status: 400 }
      );
    }

    if (!recorded_by) {
      return NextResponse.json(
        { error: 'recorded_by (driver_id) is required' },
        { status: 400 }
      );
    }

    // Validate delivery exists
    const { data: delivery, error: deliveryError } = await adminSupabase
      .from('deliveries')
      .select('id')
      .eq('id', params.id)
      .single();

    if (deliveryError || !delivery) {
      return NextResponse.json(
        { error: 'Delivery not found' },
        { status: 404 }
      );
    }

    // Create temperature log
    const { data: temperatureLog, error: logError } = await adminSupabase
      .from('temperature_logs')
      .insert({
        delivery_id: params.id,
        product_id: product_id || null,
        temperature,
        location: location || null,
        notes: notes || null,
        recorded_by,
        source,
        recorded_at: new Date().toISOString(),
      })
      .select(`
        *,
        products (
          id,
          name,
          sku
        )
      `)
      .single();

    if (logError) {
      throw logError;
    }

    return NextResponse.json({
      success: true,
      temperatureLog,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error recording temperature:', error);
    return NextResponse.json(
      { error: 'Failed to record temperature', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/deliveries/[id]/temperature
 * Get temperature logs for a delivery
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const searchParams = request.nextUrl.searchParams;

    const productId = searchParams.get('product_id');
    const location = searchParams.get('location');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    let query = adminSupabase
      .from('temperature_logs')
      .select(`
        *,
        products (
          id,
          name,
          sku
        )
      `)
      .eq('delivery_id', params.id)
      .order('recorded_at', { ascending: false });

    if (productId) {
      query = query.eq('product_id', productId);
    }

    if (location) {
      query = query.eq('location', location);
    }

    if (startDate) {
      query = query.gte('recorded_at', startDate);
    }

    if (endDate) {
      query = query.lte('recorded_at', endDate);
    }

    const { data: temperatureLogs, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      temperatureLogs: temperatureLogs || [],
      count: temperatureLogs?.length || 0,
    });
  } catch (error: any) {
    console.error('Error fetching temperature logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch temperature logs', details: error.message },
      { status: 500 }
    );
  }
}

