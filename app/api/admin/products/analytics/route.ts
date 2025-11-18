import { NextRequest, NextResponse } from 'next/server';
import { 
  getProductStatistics, 
  getProductStockInfo, 
  getTopSellingProducts,
  getLowStockProducts 
} from '@/lib/services/product-analytics';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/products/analytics
 * Get product analytics and statistics
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'all';
    const productId = searchParams.get('product_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '10');

    switch (type) {
      case 'statistics':
        const stats = await getProductStatistics(productId || undefined, startDate || undefined, endDate || undefined);
        return NextResponse.json({ statistics: stats });

      case 'stock':
        const stockInfo = await getProductStockInfo(productId || undefined);
        return NextResponse.json({ stock_info: stockInfo });

      case 'top_selling':
        const topSelling = await getTopSellingProducts(limit, startDate || undefined, endDate || undefined);
        return NextResponse.json({ top_selling: topSelling });

      case 'low_stock':
        const lowStock = await getLowStockProducts();
        return NextResponse.json({ low_stock: lowStock });

      case 'all':
      default:
        const [allStats, allStockInfo, topSellingProducts, lowStockProducts] = await Promise.all([
          getProductStatistics(undefined, startDate || undefined, endDate || undefined),
          getProductStockInfo(),
          getTopSellingProducts(limit, startDate || undefined, endDate || undefined),
          getLowStockProducts(),
        ]);

        return NextResponse.json({
          statistics: allStats,
          stock_info: allStockInfo,
          top_selling: topSellingProducts,
          low_stock: lowStockProducts,
        });
    }
  } catch (error: any) {
    console.error('Error fetching product analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product analytics', details: error.message },
      { status: 500 }
    );
  }
}




