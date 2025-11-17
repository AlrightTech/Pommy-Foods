import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/returns
 * List all returns with filtering and wastage analytics
 */
export async function GET(request: NextRequest) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const searchParams = request.nextUrl.searchParams;
    
    const storeId = searchParams.get('store_id');
    const productId = searchParams.get('product_id');
    const reason = searchParams.get('reason');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = adminSupabase
      .from('returns')
      .select(`
        *,
        products (
          id,
          name,
          sku,
          category,
          price
        ),
        deliveries (
          id,
          order_id,
          orders (
            id,
            order_number,
            store_id,
            stores (
              id,
              name
            )
          )
        )
      `, { count: 'exact' })
      .order('returned_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (storeId) {
      // Filter by store through delivery -> order -> store
      const { data: orders } = await adminSupabase
        .from('orders')
        .select('id')
        .eq('store_id', storeId);

      if (orders && orders.length > 0) {
        const orderIds = orders.map(o => o.id);
        const { data: deliveries } = await adminSupabase
          .from('deliveries')
          .select('id')
          .in('order_id', orderIds);

        if (deliveries && deliveries.length > 0) {
          const deliveryIds = deliveries.map(d => d.id);
          query = query.in('delivery_id', deliveryIds);
        } else {
          // No deliveries for this store, return empty
          return NextResponse.json({
            returns: [],
            pagination: {
              page,
              limit,
              total: 0,
              totalPages: 0,
            },
            analytics: {
              totalReturns: 0,
              totalWastageValue: 0,
              returnsByReason: {},
              returnsByProduct: [],
            },
          });
        }
      } else {
        return NextResponse.json({
          returns: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
          analytics: {
            totalReturns: 0,
            totalWastageValue: 0,
            returnsByReason: {},
            returnsByProduct: [],
          },
        });
      }
    }

    if (productId) {
      query = query.eq('product_id', productId);
    }

    if (reason) {
      query = query.eq('reason', reason);
    }

    if (startDate) {
      query = query.gte('returned_at', startDate);
    }

    if (endDate) {
      query = query.lte('returned_at', endDate);
    }

    const { data: returns, error, count } = await query;

    if (error) {
      throw error;
    }

    // Calculate wastage analytics
    const analyticsQuery = adminSupabase
      .from('returns')
      .select(`
        quantity,
        reason,
        products (
          id,
          name,
          price
        )
      `);

    if (startDate) {
      analyticsQuery.gte('returned_at', startDate);
    }
    if (endDate) {
      analyticsQuery.lte('returned_at', endDate);
    }

    const { data: allReturns } = await analyticsQuery;

    // Calculate analytics
    let totalWastageValue = 0;
    const returnsByReason: Record<string, number> = {};
    const returnsByProduct: Record<string, { name: string; quantity: number; value: number }> = {};

    (allReturns || []).forEach((ret: any) => {
      const product = ret.products;
      const quantity = ret.quantity || 0;
      const price = parseFloat(product?.price?.toString() || '0');
      const value = quantity * price;
      totalWastageValue += value;

      // By reason
      const reason = ret.reason || 'expired';
      returnsByReason[reason] = (returnsByReason[reason] || 0) + quantity;

      // By product
      const productId = product?.id || 'unknown';
      const productName = product?.name || 'Unknown';
      if (!returnsByProduct[productId]) {
        returnsByProduct[productId] = {
          name: productName,
          quantity: 0,
          value: 0,
        };
      }
      returnsByProduct[productId].quantity += quantity;
      returnsByProduct[productId].value += value;
    });

    const returnsByProductArray = Object.entries(returnsByProduct)
      .map(([id, data]) => ({ product_id: id, ...data }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    return NextResponse.json({
      returns: returns || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      analytics: {
        totalReturns: allReturns?.length || 0,
        totalWastageValue,
        returnsByReason,
        returnsByProduct: returnsByProductArray,
      },
    });
  } catch (error: any) {
    console.error('Error fetching returns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch returns', details: error.message },
      { status: 500 }
    );
  }
}

