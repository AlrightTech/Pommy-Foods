import { NextRequest, NextResponse } from 'next/server';
import { sendPaymentReminders, getPaymentReminderHistory, createPaymentReminder } from '@/lib/services/payment-reminders';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/payments/reminders/send
 * Manually trigger payment reminder sending
 */
export async function POST(request: NextRequest) {
  try {
    const result = await sendPaymentReminders();

    return NextResponse.json({
      success: true,
      message: `Sent ${result.sent} reminder(s), ${result.failed} failed`,
      ...result,
    });
  } catch (error: any) {
    console.error('Error sending payment reminders:', error);
    return NextResponse.json(
      { error: 'Failed to send payment reminders', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/payments/reminders
 * Get payment reminder history
 */
export async function GET(request: NextRequest) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const searchParams = request.nextUrl.searchParams;

    const storeId = searchParams.get('store_id');
    const invoiceId = searchParams.get('invoice_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = adminSupabase
      .from('payment_reminders')
      .select(`
        *,
        invoices (
          id,
          invoice_number,
          total_amount,
          due_date
        ),
        stores (
          id,
          name
        )
      `, { count: 'exact' })
      .order('reminder_sent_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (storeId) {
      query = query.eq('store_id', storeId);
    }

    if (invoiceId) {
      query = query.eq('invoice_id', invoiceId);
    }

    if (startDate) {
      query = query.gte('reminder_sent_at', startDate);
    }

    if (endDate) {
      query = query.lte('reminder_sent_at', endDate);
    }

    const { data: reminders, error, count } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      reminders: reminders || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching payment reminders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment reminders', details: error.message },
      { status: 500 }
    );
  }
}

