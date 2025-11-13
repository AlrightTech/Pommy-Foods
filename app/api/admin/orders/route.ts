import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { validateOrderItems } from '@/lib/utils/order-validation';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/orders
 * List orders with advanced filtering for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const searchParams = request.nextUrl.searchParams;
    
    const status = searchParams.get('status');
    const storeId = searchParams.get('store_id');
    const search = searchParams.get('search');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = adminSupabase
      .from('orders')
      .select(`
        *,
        stores (
          id,
          name,
          email,
          phone
        ),
        order_items (
          id,
          product_id,
          quantity,
          unit_price,
          total_price,
          products (
            id,
            name,
            sku
          )
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (storeId) {
      query = query.eq('store_id', storeId);
    }

    if (search) {
      query = query.or(`order_number.ilike.%${search}%,stores.name.ilike.%${search}%`);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      orders: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/orders
 * Create a new order (admin-initiated)
 */
export async function POST(request: NextRequest) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const body = await request.json();

    const { store_id, items, notes, created_by } = body;

    if (!store_id) {
      return NextResponse.json(
        { error: 'Store ID is required' },
        { status: 400 }
      );
    }

    // Validate order items
    const validation = validateOrderItems(items || []);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid order items', details: validation.errors },
        { status: 400 }
      );
    }

    // Verify store exists
    const { data: store, error: storeError } = await adminSupabase
      .from('stores')
      .select('id, name, is_active')
      .eq('id', store_id)
      .single();

    if (storeError || !store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    if (!store.is_active) {
      return NextResponse.json(
        { error: 'Store is not active' },
        { status: 400 }
      );
    }

    // Get product prices if not provided
    const productIds = items.map((item: any) => item.product_id);
    const { data: products, error: productsError } = await adminSupabase
      .from('products')
      .select('id, price, is_active')
      .in('id', productIds);

    if (productsError) {
      throw new Error(`Failed to fetch products: ${productsError.message}`);
    }

    const productMap = new Map(
      (products || []).map((p: any) => [p.id, p])
    );

    // Verify all products exist and are active
    for (const item of items) {
      const product = productMap.get(item.product_id);
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.product_id} not found` },
          { status: 400 }
        );
      }
      if (!product.is_active) {
        return NextResponse.json(
          { error: `Product ${item.product_id} is not active` },
          { status: 400 }
        );
      }
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${store_id.substring(0, 8)}`;

    // Calculate totals
    let totalAmount = 0;
    const orderItems = items.map((item: any) => {
      const product = productMap.get(item.product_id);
      const unitPrice = item.unit_price ?? product?.price ?? 0;
      const quantity = item.quantity;
      const totalPrice = quantity * unitPrice;
      totalAmount += totalPrice;

      return {
        product_id: item.product_id,
        quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
      };
    });

    // Create order
    const { data: order, error: orderError } = await adminSupabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        store_id,
        status: 'draft',
        total_amount: totalAmount,
        final_amount: totalAmount,
        notes: notes || null,
        created_by: created_by || null,
      })
      .select()
      .single();

    if (orderError) {
      throw orderError;
    }

    // Create order items
    const orderItemsWithOrderId = orderItems.map((item: any) => ({
      order_id: order.id,
      ...item,
    }));

    const { error: itemsError } = await adminSupabase
      .from('order_items')
      .insert(orderItemsWithOrderId);

    if (itemsError) {
      // Rollback: delete the order if items insertion fails
      await adminSupabase.from('orders').delete().eq('id', order.id);
      throw itemsError;
    }

    // Fetch complete order with relationships
    const { data: completeOrder, error: fetchError } = await adminSupabase
      .from('orders')
      .select(`
        *,
        stores (
          id,
          name,
          email,
          phone
        ),
        order_items (
          id,
          product_id,
          quantity,
          unit_price,
          total_price,
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
      throw fetchError;
    }

    return NextResponse.json({ order: completeOrder }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order', details: error.message },
      { status: 500 }
    );
  }
}

