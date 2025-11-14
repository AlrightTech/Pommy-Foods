import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Check if user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user has admin role
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get total orders count
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Get revenue (sum of final_amount from completed orders)
    const { data: revenueData } = await supabase
      .from('orders')
      .select('final_amount')
      .eq('status', 'completed');

    const revenue = revenueData?.reduce((sum: number, order: { final_amount: number | null }) => sum + Number(order.final_amount || 0), 0) || 0;

    // Get products count
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get pending approvals count
    const { count: pendingApprovals } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get recent orders (last 10)
    const { data: recentOrders } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        final_amount,
        created_at,
        stores (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get orders by status for chart
    const { data: ordersByStatus } = await supabase
      .from('orders')
      .select('status')
      .order('created_at', { ascending: false });

    // Calculate status distribution
    const statusCounts = ordersByStatus?.reduce((acc: Record<string, number>, order: { status: string }) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {}) || {};

    // Get sales trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: salesTrend } = await supabase
      .from('orders')
      .select('final_amount, created_at, status')
      .eq('status', 'completed')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    // Group by date
    const dailySales = salesTrend?.reduce((acc: Record<string, number>, order: { created_at: string; final_amount: number | null }) => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + Number(order.final_amount || 0);
      return acc;
    }, {}) || {};

    return NextResponse.json(
      {
        stats: {
          totalOrders: totalOrders || 0,
          revenue: revenue,
          totalProducts: totalProducts || 0,
          pendingApprovals: pendingApprovals || 0,
        },
        recentOrders: recentOrders?.map((order: any) => ({
          id: order.id,
          orderNumber: order.order_number,
          store: order.stores?.name || 'Unknown',
          amount: Number(order.final_amount || 0),
          status: order.status,
          date: order.created_at,
        })) || [],
        statusDistribution: statusCounts,
        salesTrend: Object.entries(dailySales).map(([date, amount]) => ({
          date,
          amount: Number(amount),
        })),
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard statistics',
        details: error?.message || 'Unknown error'
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

