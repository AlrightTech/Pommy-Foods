import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { canTransitionStatus } from '@/lib/utils/order-validation';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/orders/[id]/reject
 * Reject an order with a reason
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const body = await request.json();
    const { reason, rejected_by } = body;

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

    // Validate status transition
    const transition = canTransitionStatus(currentOrder.status, 'rejected');
    if (!transition.canTransition) {
      return NextResponse.json(
        { error: transition.reason || 'Order cannot be rejected in current status' },
        { status: 400 }
      );
    }

    // Update order status to rejected
    const updateData: any = {
      status: 'rejected',
      updated_at: new Date().toISOString(),
    };

    // Add rejection reason to notes
    if (reason) {
      const rejectionNote = `[REJECTED] ${reason}${rejected_by ? ` (by: ${rejected_by})` : ''}`;
      updateData.notes = currentOrder.notes 
        ? `${currentOrder.notes}\n${rejectionNote}`
        : rejectionNote;
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

    // TODO: Send notification to store owner
    // This would be implemented with email/push notification service

    return NextResponse.json({
      success: true,
      message: 'Order rejected successfully',
      order,
    });
  } catch (error: any) {
    console.error('Error rejecting order:', error);
    return NextResponse.json(
      { error: 'Failed to reject order', details: error.message },
      { status: 500 }
    );
  }
}

