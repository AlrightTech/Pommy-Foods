import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient();
    const adminSupabase = getSupabaseAdmin();
    const body = await request.json();
    const { approved_by } = body;

    // Get order with items
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
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
      `)
      .eq('id', params.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.status !== 'pending' && order.status !== 'draft') {
      return NextResponse.json(
        { error: 'Order cannot be approved in current status' },
        { status: 400 }
      );
    }

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'approved',
        approved_by,
        approved_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (updateError) {
      throw updateError;
    }

    // Create kitchen sheet
    const { data: kitchenSheet, error: kitchenError } = await adminSupabase
      .from('kitchen_sheets')
      .insert({
        order_id: params.id,
      })
      .select()
      .single();

    if (kitchenError) {
      console.error('Error creating kitchen sheet:', kitchenError);
      // Continue even if kitchen sheet creation fails
    } else {
      // Create kitchen sheet items
      const kitchenItems = order.order_items.map((item: any) => ({
        kitchen_sheet_id: kitchenSheet.id,
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      await adminSupabase
        .from('kitchen_sheet_items')
        .insert(kitchenItems);
    }

    // Create delivery
    const { data: delivery, error: deliveryError } = await adminSupabase
      .from('deliveries')
      .insert({
        order_id: params.id,
        status: 'pending',
      })
      .select()
      .single();

    if (deliveryError) {
      console.error('Error creating delivery:', deliveryError);
      // Continue even if delivery creation fails
    }

    return NextResponse.json({ 
      success: true,
      order: { ...order, status: 'approved' },
      kitchenSheet,
      delivery,
    });
  } catch (error) {
    console.error('Error approving order:', error);
    return NextResponse.json(
      { error: 'Failed to approve order' },
      { status: 500 }
    );
  }
}

