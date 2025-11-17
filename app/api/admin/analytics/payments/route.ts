import { NextRequest, NextResponse } from 'next/server';
import {
  getPaymentCollectionStats,
  getPaymentTrends,
  getOverdueAccounts,
  getPaymentMethodDistribution,
} from '@/lib/services/analytics/payment-analytics';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/analytics/payments
 * Payment collection reports
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start_date') || undefined;
    const endDate = searchParams.get('end_date') || undefined;
    const period = (searchParams.get('period') as 'day' | 'week' | 'month') || 'day';

    // Get payment collection statistics
    const stats = await getPaymentCollectionStats({ startDate, endDate });

    // Get payment trends
    const trends = await getPaymentTrends(period, startDate, endDate);

    // Get overdue accounts
    const overdueAccounts = await getOverdueAccounts();

    // Get payment method distribution
    const methodDistribution = await getPaymentMethodDistribution(startDate, endDate);

    return NextResponse.json({
      stats,
      trends,
      overdueAccounts,
      methodDistribution,
      summary: {
        totalCollected: stats.total_collected,
        cashPercentage: methodDistribution.cash.percentage,
        directDebitPercentage: methodDistribution.direct_debit.percentage,
        overdueCount: overdueAccounts.length,
        overdueAmount: overdueAccounts.reduce((sum, acc) => sum + acc.total_amount, 0),
      },
    });
  } catch (error: any) {
    console.error('Error fetching payment analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment analytics', details: error.message },
      { status: 500 }
    );
  }
}

