import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { recalculateOrderTotals } from '@/lib/services/pricing';

export const dynamic = 'force-dynamic';

/**
 * POST /api/customer/orders
 * Allow stores to place manual orders
 * 
 * Body:
 * {
 *   store_id: string,
 *   items: Array<{
 *     product_id: string,
 *     quantity: number,
 *     unit_price?: number (optional, will use product price if not provided)
 *   }>,
 *   discount_amount?: number
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const body = await request.json();

    const { store_id, items, discount_amount = 0 } = body;

    // Validation
    if (!store_id) {
      return NextResponse.json(
        { error: 'store_id is required' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'items array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Validate store exists
    const { data: store, error: storeError } = await adminSupabase
      .from('stores')
      .select('id, name')
      .eq('id', store_id)
      .single();

    if (storeError || !store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // Get product prices
    const productIds = items.map(item => item.product_id);
    const { data: products, error: productsError } = await adminSupabase
      .from('products')
      .select('id, name, price')
      .in('id', productIds);

    if (productsError) {
      throw productsError;
    }

    const productMap = new Map((products || []).map((p: any) => [p.id, p]));

    // Generate order number
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `ORD-${timestamp}-${random}`;

    // Create order
    const { data: order, error: orderError } = await adminSupabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        store_id,
        status: 'pending',
        discount_amount: discount_amount || 0,
      })
      .select()
      .single();

    if (orderError) {
      throw orderError;
    }

    // Create order items
    const orderItems = items.map((item: any) => {
      const product = productMap.get(item.product_id);
      const unitPrice = item.unit_price || parseFloat(product?.price?.toString() || '0');
      const quantity = item.quantity || 0;
      const totalPrice = unitPrice * quantity;

      return {
        order_id: order.id,
        product_id: item.product_id,
        quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
      };
    });

    const { error: itemsError } = await adminSupabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      throw itemsError;
    }

    // Recalculate totals
    const totals = await recalculateOrderTotals(order.id, discount_amount);

    // Update order with calculated totals
    await adminSupabase
      .from('orders')
      .update({
        total_amount: totals.total_amount,
        final_amount: totals.final_amount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    // Fetch complete order
    const { data: completeOrder, error: fetchError } = await adminSupabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name,
            sku,
            price
          )
        )
      `)
      .eq('id', order.id)
      .single();

    if (fetchError) {
      console.error('Error fetching complete order:', fetchError);
    }

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      order: completeOrder || order,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/customer/orders
 * Get orders for current store
 * 
 * Query params:
 * - store_id: string (required)
 * - status: string (optional)
 * - start_date: string (optional)
 * - end_date: string (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const searchParams = request.nextUrl.searchParams;

    const storeId = searchParams.get('store_id');
    const status = searchParams.get('status');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!storeId) {
      return NextResponse.json(
        { error: 'store_id is required' },
        { status: 400 }
      );
    }

    let query = adminSupabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name,
            sku,
            price
          )
        )
      `)
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: orders, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      orders: orders || [],
      count: orders?.length || 0,
    });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: error.message },
      { status: 500 }
    );
  }
}

