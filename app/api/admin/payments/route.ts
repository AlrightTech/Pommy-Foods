import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/payments
 * List payments with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const searchParams = request.nextUrl.searchParams;
    
    const orderId = searchParams.get('order_id');
    const invoiceId = searchParams.get('invoice_id');
    const paymentStatus = searchParams.get('payment_status');
    const paymentMethod = searchParams.get('payment_method');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = adminSupabase
      .from('payments')
      .select(`
        *,
        orders (
          id,
          order_number
        ),
        invoices (
          id,
          invoice_number
        )
      `, { count: 'exact' })
      .order('payment_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (orderId) {
      query = query.eq('order_id', orderId);
    }

    if (invoiceId) {
      query = query.eq('invoice_id', invoiceId);
    }

    if (paymentStatus) {
      query = query.eq('payment_status', paymentStatus);
    }

    if (paymentMethod) {
      query = query.eq('payment_method', paymentMethod);
    }

    if (startDate) {
      query = query.gte('payment_date', startDate);
    }

    if (endDate) {
      query = query.lte('payment_date', endDate);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      payments: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/payments
 * Record a payment
 */
export async function POST(request: NextRequest) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const body = await request.json();

    const { order_id, invoice_id, amount, payment_method, payment_date, transaction_id, notes } = body;

    // Validation
    if (!order_id && !invoice_id) {
      return NextResponse.json(
        { error: 'Either order_id or invoice_id is required' },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    if (!payment_method || !['cash', 'direct_debit', 'online'].includes(payment_method)) {
      return NextResponse.json(
        { error: 'Invalid payment method. Must be: cash, direct_debit, or online' },
        { status: 400 }
      );
    }

    // Verify order or invoice exists
    if (order_id) {
      const { data: order, error: orderError } = await adminSupabase
        .from('orders')
        .select('id, store_id, final_amount')
        .eq('id', order_id)
        .single();

      if (orderError || !order) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }
    }

    if (invoice_id) {
      const { data: invoice, error: invoiceError } = await adminSupabase
        .from('invoices')
        .select('id, order_id, store_id, total_amount, payment_status')
        .eq('id', invoice_id)
        .single();

      if (invoiceError || !invoice) {
        return NextResponse.json(
          { error: 'Invoice not found' },
          { status: 404 }
        );
      }

      // If invoice is already paid, prevent duplicate payment
      if (invoice.payment_status === 'paid') {
        return NextResponse.json(
          { error: 'Invoice is already paid' },
          { status: 400 }
        );
      }
    }

    // Create payment record
    const { data: payment, error: paymentError } = await adminSupabase
      .from('payments')
      .insert({
        order_id: order_id || null,
        invoice_id: invoice_id || null,
        amount,
        payment_method,
        payment_status: 'paid',
        payment_date: payment_date || new Date().toISOString(),
        transaction_id: transaction_id || null,
        notes: notes || null,
      })
      .select(`
        *,
        orders (
          id,
          order_number
        ),
        invoices (
          id,
          invoice_number
        )
      `)
      .single();

    if (paymentError) {
      throw paymentError;
    }

    // Update invoice payment status if applicable
    if (invoice_id) {
      // Get invoice to check if fully paid
      const { data: invoice, error: invoiceError } = await adminSupabase
        .from('invoices')
        .select('id, total_amount')
        .eq('id', invoice_id)
        .single();

      if (!invoiceError && invoice) {
        // Get total payments for this invoice
        const { data: payments, error: paymentsError } = await adminSupabase
          .from('payments')
          .select('amount')
          .eq('invoice_id', invoice_id)
          .eq('payment_status', 'paid');

        if (!paymentsError && payments) {
          const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
          const invoiceTotal = parseFloat(invoice.total_amount.toString());

          const newPaymentStatus = totalPaid >= invoiceTotal ? 'paid' : 'pending';

          await adminSupabase
            .from('invoices')
            .update({
              payment_status: newPaymentStatus,
              updated_at: new Date().toISOString(),
            })
            .eq('id', invoice_id);
        }
      }
    }

    // Update store balance (decrease balance when payment is received)
    if (order_id) {
      const { data: order } = await adminSupabase
        .from('orders')
        .select('store_id, final_amount')
        .eq('id', order_id)
        .single();

      if (order) {
        const { data: store } = await adminSupabase
          .from('stores')
          .select('id, current_balance')
          .eq('id', order.store_id)
          .single();

        if (store) {
          const currentBalance = parseFloat(store.current_balance?.toString() || '0');
          const paymentAmount = parseFloat(amount.toString());
          const newBalance = Math.max(0, currentBalance - paymentAmount);

          await adminSupabase
            .from('stores')
            .update({
              current_balance: newBalance,
              updated_at: new Date().toISOString(),
            })
            .eq('id', store.id);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment recorded successfully',
      payment,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error recording payment:', error);
    return NextResponse.json(
      { error: 'Failed to record payment', details: error.message },
      { status: 500 }
    );
  }
}

