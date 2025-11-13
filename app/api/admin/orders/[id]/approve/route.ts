import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { validateOrderForApproval } from '@/lib/utils/order-validation';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/orders/[id]/approve
 * Approve an order with validation and auto-generate kitchen sheet & delivery note
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const body = await request.json();
    const { approved_by } = body;

    // Validate order for approval
    const validation = await validateOrderForApproval(params.id);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Order validation failed', 
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    // Get order with items
    const { data: order, error: orderError } = await adminSupabase
      .from('orders')
      .select(`
        *,
        stores (
          id,
          name,
          email,
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

    // Update order status to approved
    const { error: updateError } = await adminSupabase
      .from('orders')
      .update({
        status: 'approved',
        approved_by: approved_by || null,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (updateError) {
      throw updateError;
    }

    // Update store balance (add order amount to current balance)
    const store = order.stores as any;
    if (store) {
      const currentBalance = parseFloat(store.current_balance || '0');
      const orderAmount = parseFloat(order.final_amount || '0');
      const newBalance = currentBalance + orderAmount;

      await adminSupabase
        .from('stores')
        .update({
          current_balance: newBalance,
          updated_at: new Date().toISOString(),
        })
        .eq('id', store.id);
    }

    // Create kitchen sheet
    let kitchenSheet: { id: string } | null = null;
    const { data: newKitchenSheet, error: kitchenError } = await adminSupabase
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
      kitchenSheet = newKitchenSheet;

      // Create kitchen sheet items
      const orderItems = order.order_items as any[];
      if (orderItems && orderItems.length > 0 && kitchenSheet) {
        const kitchenSheetId = kitchenSheet.id;
        const kitchenItems = orderItems.map((item: any) => ({
          kitchen_sheet_id: kitchenSheetId,
          product_id: item.product_id,
          quantity: item.quantity,
        }));

        const { error: itemsError } = await adminSupabase
          .from('kitchen_sheet_items')
          .insert(kitchenItems);

        if (itemsError) {
          console.error('Error creating kitchen sheet items:', itemsError);
        }
      }
    }

    // Create delivery note
    let delivery = null;
    const { data: newDelivery, error: deliveryError } = await adminSupabase
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
    } else {
      delivery = newDelivery;
    }

    // Fetch updated order
    const { data: updatedOrder, error: fetchError } = await adminSupabase
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
      `)
      .eq('id', params.id)
      .single();

    if (fetchError) {
      console.error('Error fetching updated order:', fetchError);
    }

    // TODO: Send notification to store owner
    // This would be implemented with email/push notification service

    return NextResponse.json({ 
      success: true,
      message: 'Order approved successfully',
      order: updatedOrder || order,
      kitchenSheet,
      delivery,
    });
  } catch (error: any) {
    console.error('Error approving order:', error);
    return NextResponse.json(
      { error: 'Failed to approve order', details: error.message },
      { status: 500 }
    );
  }
}

