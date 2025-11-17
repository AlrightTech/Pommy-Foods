import { NextRequest, NextResponse } from 'next/server';
import {
  getDeliveryPerformance,
  getAverageDeliveryTime,
  getRouteEfficiency,
  getDeliveryStatusDistribution,
} from '@/lib/services/analytics/delivery-analytics';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/analytics/deliveries
 * Delivery performance metrics
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start_date') || undefined;
    const endDate = searchParams.get('end_date') || undefined;
    const period = (searchParams.get('period') as 'day' | 'week' | 'month') || 'day';

    // Get delivery performance
    const performance = await getDeliveryPerformance({ startDate, endDate });

    // Get average delivery time
    const averageDeliveryTime = await getAverageDeliveryTime(startDate, endDate);

    // Get route efficiency
    const routeEfficiency = await getRouteEfficiency({ startDate, endDate });

    // Get delivery status distribution
    const statusDistribution = await getDeliveryStatusDistribution();

    return NextResponse.json({
      performance,
      averageDeliveryTime,
      routeEfficiency,
      statusDistribution,
      summary: {
        onTimePercentage: performance.on_time_percentage,
        averageTimeHours: performance.average_delivery_time_hours,
        totalDeliveries: performance.total_deliveries,
        totalDrivers: routeEfficiency.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching delivery analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery analytics', details: error.message },
      { status: 500 }
    );
  }
}

