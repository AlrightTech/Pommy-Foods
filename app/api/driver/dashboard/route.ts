import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/driver/dashboard
 * Get assigned deliveries for driver
 * 
 * Query params:
 * - driver_id: string (required)
 * - status: 'assigned' | 'in_transit' (optional, filters by status)
 */
export async function GET(request: NextRequest) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const searchParams = request.nextUrl.searchParams;

    const driverId = searchParams.get('driver_id');
    const status = searchParams.get('status');

    if (!driverId) {
      return NextResponse.json(
        { error: 'driver_id is required' },
        { status: 400 }
      );
    }

    let query = adminSupabase
      .from('deliveries')
      .select(`
        *,
        orders (
          id,
          order_number,
          final_amount,
          status,
          stores (
            id,
            name,
            address,
            city,
            state,
            zip_code,
            phone,
            contact_person
          ),
          order_items (
            id,
            quantity,
            products (
              id,
              name,
              sku,
              unit
            )
          )
        ),
        delivery_signatures (
          *
        )
      `)
      .eq('driver_id', driverId)
      .order('scheduled_date', { ascending: true });

    // Filter by status if provided
    if (status) {
      if (status === 'assigned' || status === 'in_transit') {
        query = query.eq('status', status);
      } else {
        return NextResponse.json(
          { error: 'status must be "assigned" or "in_transit"' },
          { status: 400 }
        );
      }
    } else {
      // Default: only show assigned and in_transit deliveries
      query = query.in('status', ['assigned', 'in_transit']);
    }

    const { data: deliveries, error } = await query;

    if (error) {
      throw error;
    }

    // Get statistics
    const { data: allDeliveries } = await adminSupabase
      .from('deliveries')
      .select('status')
      .eq('driver_id', driverId);

    const stats = {
      total: allDeliveries?.length || 0,
      assigned: allDeliveries?.filter(d => d.status === 'assigned').length || 0,
      in_transit: allDeliveries?.filter(d => d.status === 'in_transit').length || 0,
      delivered: allDeliveries?.filter(d => d.status === 'delivered').length || 0,
    };

    return NextResponse.json({
      deliveries: deliveries || [],
      count: deliveries?.length || 0,
      statistics: stats,
    });
  } catch (error: any) {
    console.error('Error fetching driver dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch driver dashboard', details: error.message },
      { status: 500 }
    );
  }
}

