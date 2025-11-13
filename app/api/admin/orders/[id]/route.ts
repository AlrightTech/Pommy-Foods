import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { canTransitionStatus } from '@/lib/utils/order-validation';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/orders/[id]
 * Get order details with full relationships
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSupabase = getSupabaseAdmin();

    const { data: order, error } = await adminSupabase
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
          zip_code,
          credit_limit,
          current_balance
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
            unit,
            category
          )
        ),
        kitchen_sheets (
          id,
          prepared_at,
          completed_at,
          notes
        ),
        deliveries (
          id,
          status,
          scheduled_date,
          delivered_at,
          driver_id
        ),
        invoices (
          id,
          invoice_number,
          total_amount,
          payment_status,
          due_date
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
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/orders/[id]
 * Update order (status, notes, etc.)
 * For modifying items, use the modify endpoint
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const body = await request.json();

    const { status, notes, discount_amount } = body;

    // Get current order to check status transition
    const { data: currentOrder, error: fetchError } = await adminSupabase
      .from('orders')
      .select('id, status')
      .eq('id', params.id)
      .single();

    if (fetchError || !currentOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};

    // Validate status transition
    if (status && status !== currentOrder.status) {
      const transition = canTransitionStatus(currentOrder.status, status);
      if (!transition.canTransition) {
        return NextResponse.json(
          { error: transition.reason || 'Invalid status transition' },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (discount_amount !== undefined) {
      updateData.discount_amount = discount_amount;
      // Recalculate final_amount if discount changes
      const { data: orderWithTotal } = await adminSupabase
        .from('orders')
        .select('total_amount')
        .eq('id', params.id)
        .single();

      if (orderWithTotal) {
        updateData.final_amount = (orderWithTotal.total_amount || 0) - (discount_amount || 0);
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const { data: order, error } = await adminSupabase
      .from('orders')
      .update(updateData)
      .eq('id', params.id)
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
      `)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/orders/[id]
 * Cancel/delete order (soft delete by setting status to cancelled)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSupabase = getSupabaseAdmin();

    // Get current order
    const { data: currentOrder, error: fetchError } = await adminSupabase
      .from('orders')
      .select('id, status')
      .eq('id', params.id)
      .single();

    if (fetchError || !currentOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order can be cancelled
    if (currentOrder.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot cancel completed orders' },
        { status: 400 }
      );
    }

    // Soft delete by setting status to cancelled
    const { data: order, error } = await adminSupabase
      .from('orders')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true,
      message: 'Order cancelled successfully',
      order 
    });
  } catch (error: any) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { error: 'Failed to cancel order', details: error.message },
      { status: 500 }
    );
  }
}

