import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/customer/invoices
 * Get invoices for current store
 * 
 * Query params:
 * - store_id: string (required)
 * - payment_status: string (optional)
 * - start_date: string (optional)
 * - end_date: string (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const searchParams = request.nextUrl.searchParams;

    const storeId = searchParams.get('store_id');
    const paymentStatus = searchParams.get('payment_status');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!storeId) {
      return NextResponse.json(
        { error: 'store_id is required' },
        { status: 400 }
      );
    }

    let query = adminSupabase
      .from('invoices')
      .select(`
        *,
        orders (
          id,
          order_number,
          status
        ),
        payments (
          id,
          amount,
          payment_method,
          payment_date,
          status
        )
      `)
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (paymentStatus) {
      query = query.eq('payment_status', paymentStatus);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: invoices, error } = await query;

    if (error) {
      throw error;
    }

    // Calculate payment totals for each invoice
    const invoicesWithPayments = (invoices || []).map((invoice: any) => {
      const payments = invoice.payments || [];
      const totalPaid = payments.reduce(
        (sum: number, p: any) => sum + parseFloat(p.amount?.toString() || '0'),
        0
      );
      const invoiceTotal = parseFloat(invoice.total_amount?.toString() || '0');
      const remaining = invoiceTotal - totalPaid;

      return {
        ...invoice,
        total_paid: totalPaid,
        remaining_amount: remaining,
        is_fully_paid: remaining <= 0,
        is_overdue: invoice.payment_status === 'pending' && new Date(invoice.due_date) < new Date(),
      };
    });

    return NextResponse.json({
      invoices: invoicesWithPayments,
      count: invoicesWithPayments.length,
      summary: {
        total: invoicesWithPayments.length,
        paid: invoicesWithPayments.filter((inv: any) => inv.is_fully_paid).length,
        pending: invoicesWithPayments.filter((inv: any) => !inv.is_fully_paid).length,
        overdue: invoicesWithPayments.filter((inv: any) => inv.is_overdue).length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices', details: error.message },
      { status: 500 }
    );
  }
}

