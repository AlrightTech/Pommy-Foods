import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * POST /api/deliveries/[id]/gps
 * Record GPS coordinates
 * 
 * Body:
 * {
 *   latitude: number,
 *   longitude: number,
 *   accuracy?: number,
 *   speed?: number,
 *   heading?: number,
 *   driver_id: string
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const body = await request.json();

    const { latitude, longitude, accuracy, speed, heading, driver_id } = body;

    // Validation
    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'latitude and longitude are required' },
        { status: 400 }
      );
    }

    if (latitude < -90 || latitude > 90) {
      return NextResponse.json(
        { error: 'latitude must be between -90 and 90' },
        { status: 400 }
      );
    }

    if (longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'longitude must be between -180 and 180' },
        { status: 400 }
      );
    }

    if (!driver_id) {
      return NextResponse.json(
        { error: 'driver_id is required' },
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

    // Create GPS tracking record
    const { data: gpsRecord, error: gpsError } = await adminSupabase
      .from('gps_tracking')
      .insert({
        delivery_id: params.id,
        driver_id,
        latitude,
        longitude,
        accuracy: accuracy || null,
        speed: speed || null,
        heading: heading || null,
        recorded_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (gpsError) {
      throw gpsError;
    }

    return NextResponse.json({
      success: true,
      gpsRecord,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error recording GPS:', error);
    return NextResponse.json(
      { error: 'Failed to record GPS coordinates', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/deliveries/[id]/gps
 * Get GPS tracking history for delivery
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const searchParams = request.nextUrl.searchParams;

    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '100');

    let query = adminSupabase
      .from('gps_tracking')
      .select('*')
      .eq('delivery_id', params.id)
      .order('recorded_at', { ascending: true })
      .limit(limit);

    if (startDate) {
      query = query.gte('recorded_at', startDate);
    }

    if (endDate) {
      query = query.lte('recorded_at', endDate);
    }

    const { data: gpsRecords, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      gpsRecords: gpsRecords || [],
      count: gpsRecords?.length || 0,
      route: gpsRecords?.map((record: any) => ({
        latitude: record.latitude,
        longitude: record.longitude,
        timestamp: record.recorded_at,
        accuracy: record.accuracy,
        speed: record.speed,
        heading: record.heading,
      })) || [],
    });
  } catch (error: any) {
    console.error('Error fetching GPS records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GPS records', details: error.message },
      { status: 500 }
    );
  }
}

