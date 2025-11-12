import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get total revenue
    const { data: completedOrders } = await supabase
      .from('orders')
      .select('final_amount')
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString());

    const totalRevenue = completedOrders?.reduce((sum: number, order: { final_amount: number | null }) => sum + Number(order.final_amount || 0), 0) || 0;

    // Get total orders
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    const averageOrderValue = totalOrders && totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get top products
    const { data: orderItems } = await supabase
      .from('order_items')
      .select(`
        quantity,
        products (
          name
        )
      `)
      .gte('created_at', startDate.toISOString());

    const productCounts: Record<string, number> = {};
    orderItems?.forEach((item: any) => {
      const productName = item.products?.name || 'Unknown';
      productCounts[productName] = (productCounts[productName] || 0) + item.quantity;
    });

    const topProducts = Object.entries(productCounts)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Get sales by store
    const { data: storeOrders } = await supabase
      .from('orders')
      .select(`
        final_amount,
        stores (
          name
        )
      `)
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString());

    const storeSales: Record<string, number> = {};
    storeOrders?.forEach((order: any) => {
      const storeName = order.stores?.name || 'Unknown';
      storeSales[storeName] = (storeSales[storeName] || 0) + Number(order.final_amount || 0);
    });

    const salesByStore = Object.entries(storeSales)
      .map(([store, revenue]) => ({ store, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    // Get sales trend
    const { data: trendOrders } = await supabase
      .from('orders')
      .select('final_amount, created_at, status')
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    const dailySales = trendOrders?.reduce((acc: Record<string, number>, order: { created_at: string; final_amount: number | null }) => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + Number(order.final_amount || 0);
      return acc;
    }, {}) || {};

    return NextResponse.json({
      totalRevenue,
      totalOrders: totalOrders || 0,
      averageOrderValue,
      topProducts,
      salesByStore,
      salesTrend: Object.entries(dailySales).map(([date, amount]) => ({
        date,
        amount: Number(amount),
      })),
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

