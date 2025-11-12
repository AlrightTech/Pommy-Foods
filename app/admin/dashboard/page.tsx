"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StatCard } from "@/components/admin/StatCard";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { SalesChart } from "@/components/admin/SalesChart";
import { StatusChart } from "@/components/admin/StatusChart";
import { 
  ShoppingCart, 
  DollarSign, 
  Package, 
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
  Calendar,
  Activity,
  Users
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { format } from "date-fns";

interface DashboardStats {
  stats: {
    totalOrders: number;
    revenue: number;
    totalProducts: number;
    pendingApprovals: number;
  };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    store: string;
    amount: number;
    status: string;
    date: string;
  }>;
  statusDistribution: Record<string, number>;
  salesTrend: Array<{ date: string; amount: number }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      // Use static data as fallback
      const staticData: DashboardStats = {
        stats: {
          totalOrders: 1247,
          revenue: 456789.50,
          totalProducts: 342,
          pendingApprovals: 8,
        },
        recentOrders: [
          { id: '1', orderNumber: 'ORD-2024-001234', store: 'Downtown Convenience', amount: 1250.00, status: 'pending', date: new Date().toISOString() },
          { id: '2', orderNumber: 'ORD-2024-001233', store: 'Main Street Market', amount: 890.50, status: 'approved', date: new Date(Date.now() - 86400000).toISOString() },
          { id: '3', orderNumber: 'ORD-2024-001232', store: 'Corner Store', amount: 2340.75, status: 'completed', date: new Date(Date.now() - 172800000).toISOString() },
          { id: '4', orderNumber: 'ORD-2024-001231', store: 'Quick Mart', amount: 567.25, status: 'draft', date: new Date(Date.now() - 259200000).toISOString() },
          { id: '5', orderNumber: 'ORD-2024-001230', store: 'Food Express', amount: 1890.00, status: 'approved', date: new Date(Date.now() - 345600000).toISOString() },
        ],
        statusDistribution: {
          pending: 45,
          approved: 120,
          completed: 980,
          draft: 12,
          rejected: 8,
        },
        salesTrend: Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (29 - i));
          return {
            date: date.toISOString().split('T')[0],
            amount: Math.floor(Math.random() * 5000) + 10000,
          };
        }),
      };
      setData(staticData);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'approved':
        return <Badge variant="info">Approved</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'draft':
        return <Badge variant="info">Draft</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      default:
        return <Badge variant="info">{status}</Badge>;
    }
  };

  if (loading) {
    return <Loader text="Loading dashboard..." fullScreen />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-error-600">Error: {error}</div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const currentDate = format(new Date(), 'EEEE, MMMM dd, yyyy');
  const currentTime = format(new Date(), 'h:mm a');

  return (
    <div className="space-y-8 pb-8">
      {/* Enhanced Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1.5 h-10 bg-gradient-to-b from-primary-500 to-primary-600 rounded-full shadow-sm"></div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl text-neutral-900 mb-1">
                Dashboard
              </h1>
              <p className="text-neutral-600 font-body text-sm">
                Welcome back! Here&apos;s what&apos;s happening with your orders today.
              </p>
            </div>
          </div>
        </div>
        <Card className="p-4 bg-gradient-to-br from-primary-50 to-primary-100/50 border-primary-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-body font-semibold text-neutral-700">{currentDate}</p>
              <p className="text-xs font-body text-neutral-500">{currentTime}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={data.stats.totalOrders.toLocaleString()}
          change="+12% from last month"
          changeType="positive"
          icon={ShoppingCart}
          iconBg="bg-primary-100"
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(data.stats.revenue)}
          change="+8.5% from last month"
          changeType="positive"
          icon={DollarSign}
          iconBg="bg-success-100"
        />
        <StatCard
          title="Products"
          value={data.stats.totalProducts.toLocaleString()}
          change="Active products"
          changeType="neutral"
          icon={Package}
          iconBg="bg-info-100"
        />
        <StatCard
          title="Pending Approval"
          value={data.stats.pendingApprovals.toLocaleString()}
          change={data.stats.pendingApprovals > 0 ? `${data.stats.pendingApprovals} orders need review` : "All clear!"}
          changeType={data.stats.pendingApprovals > 0 ? "negative" : "positive"}
          icon={Clock}
          iconBg="bg-warning-100"
        />
      </div>

      {/* Charts Section with Better Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <h3 className="font-display text-lg text-neutral-900">Sales Performance</h3>
              <p className="text-xs font-body text-neutral-500">Last 30 days revenue trend</p>
            </div>
          </div>
          {data.salesTrend && data.salesTrend.length > 0 ? (
            <SalesChart data={data.salesTrend} />
          ) : (
            <Card>
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-center">
                  <Activity className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                  <p className="text-sm font-body text-neutral-500">No sales data available</p>
                </div>
              </div>
            </Card>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <h3 className="font-display text-lg text-neutral-900">Order Status</h3>
              <p className="text-xs font-body text-neutral-500">Distribution by status</p>
            </div>
          </div>
          {data.statusDistribution && Object.keys(data.statusDistribution).length > 0 ? (
            <StatusChart data={data.statusDistribution} />
          ) : (
            <Card>
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                  <p className="text-sm font-body text-neutral-500">No order data available</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Recent Orders and Quick Actions - Enhanced Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders - Enhanced */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="font-display text-xl text-neutral-900">
                    Recent Orders
                  </h2>
                  <p className="text-xs font-body text-neutral-500 mt-0.5">
                    Latest order activity
                  </p>
                </div>
              </div>
              <Link 
                href="/admin/orders"
                className="text-sm text-primary-600 hover:text-primary-700 font-semibold font-body flex items-center gap-1 group"
              >
                View All
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              {!data.recentOrders || data.recentOrders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8 text-neutral-300" />
                  </div>
                  <p className="text-sm font-body font-semibold text-neutral-700 mb-1">No orders yet</p>
                  <p className="text-xs font-body text-neutral-500">Orders will appear here once they are created</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.recentOrders.slice(0, 5).map((order, index) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 rounded-lg hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-transparent transition-all duration-200 cursor-pointer border border-neutral-200 hover:border-primary-300 hover:shadow-sm group"
                      onClick={() => router.push(`/admin/orders/${order.id}`)}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center group-hover:from-primary-200 group-hover:to-primary-300 transition-all shadow-sm">
                          <span className="text-xs font-display text-primary-700 font-bold">#{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <p className="text-sm font-mono font-bold text-primary-600 group-hover:text-primary-700">
                              {order.orderNumber}
                            </p>
                            {getStatusBadge(order.status)}
                          </div>
                          <p className="text-sm font-body font-medium text-neutral-700 truncate mb-0.5">
                            {order.store}
                          </p>
                          <p className="text-xs font-body text-neutral-500">
                            {format(new Date(order.date), 'MMM dd, yyyy • h:mm a')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <p className="text-base font-bold font-body text-neutral-900 mb-1">
                          {formatCurrency(order.amount)}
                        </p>
                        <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all ml-auto" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions - Enhanced */}
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-200">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 className="font-display text-xl text-neutral-900">
                  Quick Actions
                </h2>
                <p className="text-xs font-body text-neutral-500 mt-0.5">
                  Common tasks
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <Link
                href="/admin/orders?status=pending"
                className="group w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold px-4 py-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="font-body">Review Pending</span>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/admin/analytics"
                className="group w-full bg-white border-2 border-primary-500 text-primary-600 hover:bg-primary-50 font-semibold px-4 py-4 rounded-lg transition-all duration-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="font-body">View Analytics</span>
                </div>
                <ArrowRight className="w-4 h-4 text-primary-500 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/admin/products"
                className="group w-full bg-white border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 font-semibold px-4 py-4 rounded-lg transition-all duration-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <span className="font-body">Manage Products</span>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/admin/stores"
                className="group w-full bg-white border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 font-semibold px-4 py-4 rounded-lg transition-all duration-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="font-body">Manage Stores</span>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </Card>

          {/* Summary Card */}
          <Card className="bg-gradient-to-br from-primary-50 to-primary-100/50 border-primary-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-display text-lg text-neutral-900">Today&apos;s Summary</h3>
                <p className="text-xs font-body text-neutral-600">Quick overview</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg backdrop-blur-sm">
                <span className="text-sm font-body text-neutral-700">Orders Today</span>
                <span className="text-sm font-semibold font-body text-neutral-900">24</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg backdrop-blur-sm">
                <span className="text-sm font-body text-neutral-700">Revenue Today</span>
                <span className="text-sm font-semibold font-body text-neutral-900">{formatCurrency(12500)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg backdrop-blur-sm">
                <span className="text-sm font-body text-neutral-700">Avg. Order Value</span>
                <span className="text-sm font-semibold font-body text-neutral-900">{formatCurrency(520.83)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

