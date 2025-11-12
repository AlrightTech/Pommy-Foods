import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const searchParams = request.nextUrl.searchParams;
    
    const status = searchParams.get('status');
    const storeId = searchParams.get('store_id');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('orders')
      .select(`
        *,
        stores (
          id,
          name,
          email
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
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const body = await request.json();

    const { store_id, items, notes } = body;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    // Calculate totals
    let totalAmount = 0;
    items.forEach((item: { quantity: number; unit_price: number }) => {
      totalAmount += item.quantity * item.unit_price;
    });

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        store_id,
        status: 'draft',
        total_amount: totalAmount,
        final_amount: totalAmount,
        notes,
      })
      .select()
      .single();

    if (orderError) {
      throw orderError;
    }

    // Create order items
    const orderItems = items.map((item: { product_id: string; quantity: number; unit_price: number }) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      throw itemsError;
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

