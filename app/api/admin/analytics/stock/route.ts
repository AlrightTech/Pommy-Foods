import { NextRequest, NextResponse } from 'next/server';
import {
  getStockTurnoverRates,
  getStockManagementByStore,
  getReplenishmentFrequency,
  getLowStockAlerts,
} from '@/lib/services/analytics/stock-analytics';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/analytics/stock
 * Stock insights reports
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start_date') || undefined;
    const endDate = searchParams.get('end_date') || undefined;
    const threshold = parseInt(searchParams.get('threshold') || '10');

    // Get stock turnover rates
    const turnoverRates = await getStockTurnoverRates({ startDate, endDate });

    // Get stock management by store
    const stockManagement = await getStockManagementByStore();

    // Get replenishment frequency
    const replenishmentFrequency = await getReplenishmentFrequency(startDate, endDate);

    // Get low stock alerts
    const lowStockAlerts = await getLowStockAlerts(threshold);

    return NextResponse.json({
      turnoverRates,
      stockManagement,
      replenishmentFrequency,
      lowStockAlerts,
      summary: {
        totalProducts: turnoverRates.length,
        totalStores: stockManagement.length,
        lowStockCount: lowStockAlerts.length,
        averageTurnoverRate: turnoverRates.length > 0
          ? turnoverRates.reduce((sum, r) => sum + r.turnover_rate, 0) / turnoverRates.length
          : 0,
      },
    });
  } catch (error: any) {
    console.error('Error fetching stock analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock analytics', details: error.message },
      { status: 500 }
    );
  }
}

