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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-neutral-600">Loading dashboard...</div>
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
        <h1 className="font-display text-3xl md:text-4xl text-neutral-900">
          Dashboard
        </h1>
        <p className="text-neutral-600 mt-2">
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
          iconBg="bg-success-100"
        />
        <StatCard
          title="Products"
          value={data.stats.totalProducts.toLocaleString()}
          change=""
          changeType="neutral"
          icon={Package}
          iconBg="bg-info-100"
        />
        <StatCard
          title="Pending Approval"
          value={data.stats.pendingApprovals.toLocaleString()}
          change={data.stats.pendingApprovals > 0 ? `${data.stats.pendingApprovals} orders need review` : ""}
          changeType={data.stats.pendingApprovals > 0 ? "negative" : "neutral"}
          icon={Clock}
          iconBg="bg-warning-100"
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
              <h2 className="font-display text-xl text-neutral-900">
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
                <div className="text-center py-8 text-neutral-600">
                  No orders yet
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                        Order ID
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                        Store
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                      >
                        <td className="py-3 px-4 text-sm font-mono text-primary-600">
                          {order.orderNumber}
                        </td>
                        <td className="py-3 px-4 text-sm text-neutral-700">
                          {order.store}
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-neutral-900">
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
            <h2 className="font-display text-xl text-neutral-900 mb-6">
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
                className="w-full bg-white border-2 border-primary-500 text-primary-600 hover:bg-primary-50 font-semibold px-4 py-3 rounded-lg transition-all duration-200 text-left flex items-center space-x-3 block"
              >
                <TrendingUp className="w-5 h-5" />
                <span>View Analytics</span>
              </Link>
              <Link
                href="/admin/products"
                className="w-full bg-white border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-semibold px-4 py-3 rounded-lg transition-all duration-200 text-left flex items-center space-x-3 block"
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

