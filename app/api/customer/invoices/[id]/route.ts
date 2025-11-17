import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/customer/invoices/[id]
 * Get invoice details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSupabase = getSupabaseAdmin();

    const { data: invoice, error } = await adminSupabase
      .from('invoices')
      .select(`
        *,
        orders (
          id,
          order_number,
          status,
          order_items (
            *,
            products (
              id,
              name,
              sku,
              price,
              category
            )
          )
        ),
        payments (
          id,
          amount,
          payment_method,
          payment_date,
          receipt_url,
          status
        ),
        stores (
          id,
          name,
          address,
          city,
          state,
          zip_code,
          phone,
          email
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      throw error;
    }

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Calculate payment totals
    const payments = invoice.payments || [];
    const totalPaid = payments.reduce(
      (sum: number, p: any) => sum + parseFloat(p.amount?.toString() || '0'),
      0
    );
    const invoiceTotal = parseFloat(invoice.total_amount?.toString() || '0');
    const remaining = invoiceTotal - totalPaid;

    return NextResponse.json({
      invoice: {
        ...invoice,
        total_paid: totalPaid,
        remaining_amount: remaining,
        is_fully_paid: remaining <= 0,
        is_overdue: invoice.payment_status === 'pending' && new Date(invoice.due_date) < new Date(),
      },
    });
  } catch (error: any) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice', details: error.message },
      { status: 500 }
    );
  }
}

