import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient();

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        stores (
          id,
          name,
          email,
          phone,
          address,
          city,
          state,
          zip_code
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
            price,
            unit
          )
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      throw error;
    }

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient();
    const body = await request.json();

    const { status, items, notes, approved_by } = body;

    const updateData: any = {};

    if (status) {
      updateData.status = status;
      if (status === 'approved') {
        updateData.approved_by = approved_by;
        updateData.approved_at = new Date().toISOString();
      }
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // If items are provided, update order items
    if (items && Array.isArray(items)) {
      // Delete existing items
      await supabase
        .from('order_items')
        .delete()
        .eq('order_id', params.id);

      // Insert new items
      const orderItems = items.map((item: { product_id: string; quantity: number; unit_price: number }) => ({
        order_id: params.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
      }));

      await supabase
        .from('order_items')
        .insert(orderItems);

      // Recalculate totals
      const totalAmount = items.reduce((sum: number, item: { quantity: number; unit_price: number }) => {
        return sum + (item.quantity * item.unit_price);
      }, 0);

      updateData.total_amount = totalAmount;
      updateData.final_amount = totalAmount;
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

