import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * POST /api/deliveries/[id]/payment
 * Record payment collected by driver
 * 
 * Body:
 * {
 *   amount: number,
 *   payment_method: 'cash' | 'direct_debit',
 *   receipt_url?: string,
 *   collected_by: string (driver_id),
 *   notes?: string
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const body = await request.json();

    const { amount, payment_method, receipt_url, collected_by, notes } = body;

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid payment amount is required' },
        { status: 400 }
      );
    }

    if (!payment_method || !['cash', 'direct_debit'].includes(payment_method)) {
      return NextResponse.json(
        { error: 'payment_method must be "cash" or "direct_debit"' },
        { status: 400 }
      );
    }

    if (!collected_by) {
      return NextResponse.json(
        { error: 'collected_by (driver_id) is required' },
        { status: 400 }
      );
    }

    // Get delivery with order and invoice
    const { data: delivery, error: deliveryError } = await adminSupabase
      .from('deliveries')
      .select(`
        id,
        status,
        order_id,
        orders (
          id,
          store_id,
          invoices (
            id,
            invoice_number,
            total_amount,
            payment_status
          )
        )
      `)
      .eq('id', params.id)
      .single();

    if (deliveryError || !delivery) {
      return NextResponse.json(
        { error: 'Delivery not found' },
        { status: 404 }
      );
    }

    // Only allow payment for delivered orders
    if (delivery.status !== 'delivered') {
      return NextResponse.json(
        { error: 'Payment can only be collected for delivered orders' },
        { status: 400 }
      );
    }

    const order = delivery.orders as any;
    const invoice = order?.invoices?.[0];

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found for this order. Please ensure the order has been approved and invoice generated.' },
        { status: 404 }
      );
    }

    // Validate payment amount (allow partial payments)
    const invoiceTotal = parseFloat(invoice.total_amount?.toString() || '0');
    if (amount > invoiceTotal) {
      return NextResponse.json(
        { error: `Payment amount (${amount}) exceeds invoice total (${invoiceTotal})` },
        { status: 400 }
      );
    }

    // Get existing payments for this invoice
    const { data: existingPayments } = await adminSupabase
      .from('payments')
      .select('amount')
      .eq('invoice_id', invoice.id);

    const totalPaid = (existingPayments || []).reduce(
      (sum, p) => sum + parseFloat(p.amount?.toString() || '0'),
      0
    );

    if (totalPaid + amount > invoiceTotal) {
      return NextResponse.json(
        { error: `Total payment amount (${totalPaid + amount}) would exceed invoice total (${invoiceTotal})` },
        { status: 400 }
      );
    }

    // Create payment record
    const { data: payment, error: paymentError } = await adminSupabase
      .from('payments')
      .insert({
        invoice_id: invoice.id,
        order_id: order.id,
        amount,
        payment_method,
        payment_date: new Date().toISOString(),
        receipt_url: receipt_url || null,
        collected_by,
        notes: notes || null,
        status: 'completed',
      })
      .select()
      .single();

    if (paymentError) {
      throw paymentError;
    }

    // Update invoice payment status
    const newTotalPaid = totalPaid + amount;
    const newPaymentStatus = newTotalPaid >= invoiceTotal ? 'paid' : 'partial';

    await adminSupabase
      .from('invoices')
      .update({
        payment_status: newPaymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoice.id);

    // Update store balance (decrease balance when payment is collected)
    const { data: store } = await adminSupabase
      .from('stores')
      .select('current_balance')
      .eq('id', order.store_id)
      .single();

    if (store) {
      const currentBalance = parseFloat(store.current_balance?.toString() || '0');
      const newBalance = Math.max(0, currentBalance - amount);

      await adminSupabase
        .from('stores')
        .update({
          current_balance: newBalance,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.store_id);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment recorded successfully',
      payment,
      invoice: {
        ...invoice,
        payment_status: newPaymentStatus,
        total_paid: newTotalPaid,
        remaining: invoiceTotal - newTotalPaid,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error recording payment:', error);
    return NextResponse.json(
      { error: 'Failed to record payment', details: error.message },
      { status: 500 }
    );
  }
}

