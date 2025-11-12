"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StatCard } from "@/components/admin/StatCard";
import { Card } from "@/components/ui/Card";
import { SalesChart } from "@/components/admin/SalesChart";
import { StatusChart } from "@/components/admin/StatusChart";
import { 
  ShoppingCart, 
  DollarSign, 
  Package, 
  TrendingUp,
  Clock,
  CheckCircle2
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
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching dashboard data:', err);
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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-neutral-600 dark:text-neutral-400">Loading dashboard...</div>
      </div>
    );
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-neutral-900 dark:text-neutral-100">
          Dashboard
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Welcome back! Here&apos;s what&apos;s happening with your orders today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={data.stats.totalOrders.toLocaleString()}
          change=""
          changeType="neutral"
          icon={ShoppingCart}
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(data.stats.revenue)}
          change=""
          changeType="positive"
          icon={DollarSign}
          iconBg="bg-success-100 dark:bg-success-900"
        />
        <StatCard
          title="Products"
          value={data.stats.totalProducts.toLocaleString()}
          change=""
          changeType="neutral"
          icon={Package}
          iconBg="bg-info-100 dark:bg-info-900"
        />
        <StatCard
          title="Pending Approval"
          value={data.stats.pendingApprovals.toLocaleString()}
          change={data.stats.pendingApprovals > 0 ? `${data.stats.pendingApprovals} orders need review` : ""}
          changeType={data.stats.pendingApprovals > 0 ? "negative" : "neutral"}
          icon={Clock}
          iconBg="bg-warning-100 dark:bg-warning-900"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart data={data.salesTrend} />
        <StatusChart data={data.statusDistribution} />
      </div>

      {/* Recent Orders and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl text-neutral-900 dark:text-neutral-100">
                Recent Orders
              </h2>
              <Link 
                href="/admin/orders"
                className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
              >
                View All
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              {data.recentOrders.length === 0 ? (
                <div className="text-center py-8 text-neutral-600 dark:text-neutral-400">
                  No orders yet
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-800">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Order ID
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Store
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                      >
                        <td className="py-3 px-4 text-sm font-mono text-primary-600 dark:text-primary-400">
                          {order.orderNumber}
                        </td>
                        <td className="py-3 px-4 text-sm text-neutral-700 dark:text-neutral-300">
                          {order.store}
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          {formatCurrency(order.amount)}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(order.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card>
            <h2 className="font-display text-xl text-neutral-900 dark:text-neutral-100 mb-6">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link
                href="/admin/orders?status=pending"
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold px-4 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-left flex items-center space-x-3 block"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Review Pending Orders</span>
              </Link>
              <Link
                href="/admin/analytics"
                className="w-full bg-white dark:bg-neutral-800 border-2 border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-neutral-700 font-semibold px-4 py-3 rounded-lg transition-all duration-200 text-left flex items-center space-x-3 block"
              >
                <TrendingUp className="w-5 h-5" />
                <span>View Analytics</span>
              </Link>
              <Link
                href="/admin/products"
                className="w-full bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 font-semibold px-4 py-3 rounded-lg transition-all duration-200 text-left flex items-center space-x-3 block"
              >
                <Package className="w-5 h-5" />
                <span>Manage Products</span>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

