import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/analytics/sales
 * Enhanced sales reports with returns/wastage factored in
 */
export async function GET(request: NextRequest) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start_date') || undefined;
    const endDate = searchParams.get('end_date') || undefined;
    const region = searchParams.get('region') || undefined;
    const category = searchParams.get('category') || undefined;

    // Get approved orders
    let orderQuery = adminSupabase
      .from('orders')
      .select(`
        id,
        total_amount,
        discount_amount,
        final_amount,
        created_at,
        store_id,
        stores (
          id,
          name,
          region
        ),
        order_items (
          id,
          quantity,
          unit_price,
          total_price,
          products (
            id,
            name,
            category
          )
        ),
        invoices (
          id,
          return_amount,
          total_amount
        )
      `)
      .eq('status', 'approved');

    if (startDate) {
      orderQuery = orderQuery.gte('created_at', startDate);
    }
    if (endDate) {
      orderQuery = orderQuery.lte('created_at', endDate);
    }

    const { data: orders, error: ordersError } = await orderQuery;

    if (ordersError) {
      throw ordersError;
    }

    // Calculate sales by region
    const salesByRegion: Record<string, { region: string; totalSales: number; netSales: number; orderCount: number }> = {};
    const salesByProduct: Record<string, { product_id: string; product_name: string; totalSold: number; totalValue: number }> = {};
    const salesByCategory: Record<string, { category: string; totalValue: number; quantity: number }> = {};

    let totalSales = 0;
    let totalReturns = 0;
    let totalDiscounts = 0;

    (orders || []).forEach((order: any) => {
      const store = order.stores;
      const invoice = order.invoices?.[0];

      // Filter by region if provided
      if (region && store?.region !== region) {
        return;
      }

      const orderValue = parseFloat(order.final_amount?.toString() || '0');
      const discount = parseFloat(order.discount_amount?.toString() || '0');
      const returnAmount = parseFloat(invoice?.return_amount?.toString() || '0');
      const netSales = orderValue - returnAmount;

      totalSales += orderValue;
      totalDiscounts += discount;
      totalReturns += returnAmount;

      // By region
      const storeRegion = store?.region || 'Unknown';
      if (!salesByRegion[storeRegion]) {
        salesByRegion[storeRegion] = {
          region: storeRegion,
          totalSales: 0,
          netSales: 0,
          orderCount: 0,
        };
      }
      salesByRegion[storeRegion].totalSales += orderValue;
      salesByRegion[storeRegion].netSales += netSales;
      salesByRegion[storeRegion].orderCount += 1;

      // By product and category
      const orderItems = order.order_items || [];
      orderItems.forEach((item: any) => {
        const product = item.products;
        if (!product) return;

        // Filter by category if provided
        if (category && product.category !== category) {
          return;
        }

        const productId = product.id;
        const quantity = item.quantity || 0;
        const unitPrice = parseFloat(item.unit_price?.toString() || '0');
        const itemValue = quantity * unitPrice;

        // By product
        if (!salesByProduct[productId]) {
          salesByProduct[productId] = {
            product_id: productId,
            product_name: product.name || 'Unknown',
            totalSold: 0,
            totalValue: 0,
          };
        }
        salesByProduct[productId].totalSold += quantity;
        salesByProduct[productId].totalValue += itemValue;

        // By category
        const productCategory = product.category || 'Uncategorized';
        if (!salesByCategory[productCategory]) {
          salesByCategory[productCategory] = {
            category: productCategory,
            totalValue: 0,
            quantity: 0,
          };
        }
        salesByCategory[productCategory].totalValue += itemValue;
        salesByCategory[productCategory].quantity += quantity;
      });
    });

    const salesByRegionArray = Object.values(salesByRegion).sort((a, b) => b.totalSales - a.totalSales);
    const salesByProductArray = Object.values(salesByProduct).sort((a, b) => b.totalValue - a.totalValue);
    const salesByCategoryArray = Object.values(salesByCategory).sort((a, b) => b.totalValue - a.totalValue);

    return NextResponse.json({
      summary: {
        totalSales,
        totalReturns,
        netSales: totalSales - totalReturns,
        totalDiscounts,
        orderCount: orders?.length || 0,
      },
      salesByRegion: salesByRegionArray,
      salesByProduct: salesByProductArray,
      salesByCategory: salesByCategoryArray,
    });
  } catch (error: any) {
    console.error('Error fetching sales analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales analytics', details: error.message },
      { status: 500 }
    );
  }
}

