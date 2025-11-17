import { NextRequest, NextResponse } from 'next/server';
import {
  getReturnsByProduct,
  getReturnsByStore,
  getWastageTrends,
  getTopWastedProducts,
  getWastageByReason,
} from '@/lib/services/analytics/returns-analytics';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/analytics/returns
 * Returns/wastage reports
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get('store_id');
    const productId = searchParams.get('product_id');
    const reason = searchParams.get('reason') as 'expired' | 'damaged' | 'unsold' | null;
    const startDate = searchParams.get('start_date') || undefined;
    const endDate = searchParams.get('end_date') || undefined;
    const period = (searchParams.get('period') as 'day' | 'week' | 'month') || 'day';
    const topLimit = parseInt(searchParams.get('top_limit') || '10');

    // Get returns by product
    const returnsByProduct = await getReturnsByProduct(startDate, endDate);

    // Get returns by store
    const returnsByStore = await getReturnsByStore(startDate, endDate);

    // Get wastage trends
    const wastageTrends = await getWastageTrends(period, startDate, endDate);

    // Get top wasted products
    const topWastedProducts = await getTopWastedProducts(topLimit, startDate, endDate);

    // Get wastage by reason
    const wastageByReason = await getWastageByReason(reason || undefined, startDate, endDate);

    // Filter by store if provided
    let filteredReturnsByProduct = returnsByProduct;
    if (storeId) {
      // This would require joining with orders/deliveries, simplified for now
      // In a real implementation, you'd filter at the database level
    }

    // Filter by product if provided
    if (productId) {
      filteredReturnsByProduct = returnsByProduct.filter(r => r.product_id === productId);
    }

    return NextResponse.json({
      returnsByProduct: filteredReturnsByProduct,
      returnsByStore,
      wastageTrends,
      topWastedProducts,
      wastageByReason,
      summary: {
        totalProducts: filteredReturnsByProduct.length,
        totalStores: returnsByStore.length,
        totalWastageValue: filteredReturnsByProduct.reduce((sum, r) => sum + r.total_value, 0),
        totalWastageQuantity: filteredReturnsByProduct.reduce((sum, r) => sum + r.total_quantity, 0),
      },
    });
  } catch (error: any) {
    console.error('Error fetching returns analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch returns analytics', details: error.message },
      { status: 500 }
    );
  }
}

