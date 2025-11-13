"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StatCard } from "@/components/admin/StatCard";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { SalesChart } from "@/components/admin/SalesChart";
import { 
  ShoppingCart, 
  DollarSign, 
  Users,
  Utensils,
  Calendar,
  Filter,
  Plus,
  ArrowRight
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
  const [dateRange, setDateRange] = useState("30");
  const [data, setData] = useState<DashboardStats>({
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
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (err) {
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

  return (
    <div className="space-y-8 pb-8">
      {/* Overview Header with Date Range Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-bold text-4xl md:text-5xl font-body text-neutral-900 mb-2">
            Overview
          </h1>
          <p className="text-neutral-600 font-body text-base">
            {format(new Date(), 'EEEE, MMMM dd, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass rounded-premium px-4 py-2.5 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-body text-neutral-800 font-medium cursor-pointer"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
          <button className="glass rounded-premium px-4 py-2.5 hover:bg-white/35 transition-all">
            <Filter className="w-5 h-5 text-primary-600" />
          </button>
        </div>
      </div>

      {/* Statistic Cards - Glassmorphic */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Orders Today"
          value={data.stats.totalOrders.toLocaleString()}
          change="+12% from yesterday"
          changeType="positive"
          icon={ShoppingCart}
          iconBg="bg-primary-100/30"
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(data.stats.revenue)}
          change="+8.5% from last month"
          changeType="positive"
          icon={DollarSign}
          iconBg="bg-success-100/30"
        />
        <StatCard
          title="Active Users"
          value={data.stats.totalProducts.toLocaleString()}
          change="Active stores"
          changeType="neutral"
          icon={Users}
          iconBg="bg-info-100/30"
        />
        <StatCard
          title="Top Dishes"
          value={data.stats.pendingApprovals.toLocaleString()}
          change="Most ordered items"
          changeType="neutral"
          icon={Utensils}
          iconBg="bg-warning-100/30"
        />
      </div>

      {/* Sales Chart */}
      <Card variant="glass-strong" className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-bold text-2xl font-body text-neutral-900 mb-1">
              Sales Trend
            </h2>
            <p className="text-sm font-body text-neutral-600">
              Order revenue over the last {dateRange} days
            </p>
          </div>
        </div>
        <div className="h-80">
          {data.salesTrend && data.salesTrend.length > 0 ? (
            <SalesChart data={data.salesTrend} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-neutral-500 font-body">No sales data available</p>
            </div>
          )}
        </div>
      </Card>

      {/* Recent Orders Table */}
      <Card variant="glass-strong" className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-bold text-2xl font-body text-neutral-900 mb-1">
              Recent Orders
            </h2>
            <p className="text-sm font-body text-neutral-600">
              Latest order activity
            </p>
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
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/30">
                <th className="text-left py-4 px-4 text-sm font-semibold font-body text-neutral-700">Order ID</th>
                <th className="text-left py-4 px-4 text-sm font-semibold font-body text-neutral-700">Store</th>
                <th className="text-left py-4 px-4 text-sm font-semibold font-body text-neutral-700">Amount</th>
                <th className="text-left py-4 px-4 text-sm font-semibold font-body text-neutral-700">Date</th>
                <th className="text-left py-4 px-4 text-sm font-semibold font-body text-neutral-700">Status</th>
                <th className="text-left py-4 px-4 text-sm font-semibold font-body text-neutral-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.slice(0, 5).map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-white/20 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => router.push(`/admin/orders/${order.id}`)}
                >
                  <td className="py-4 px-4">
                    <span className="text-sm font-mono font-semibold text-primary-600">
                      {order.orderNumber}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm font-body text-neutral-700">{order.store}</td>
                  <td className="py-4 px-4 text-sm font-semibold font-body text-neutral-900">
                    {formatCurrency(order.amount)}
                  </td>
                  <td className="py-4 px-4 text-sm font-body text-neutral-600">
                    {format(new Date(order.date), 'MMM dd, yyyy')}
                  </td>
                  <td className="py-4 px-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="py-4 px-4">
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-semibold font-body">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Floating "Add New Menu" Button - Neumorphic */}
      <Link href="/admin/products/new">
        <button className="fixed bottom-8 right-8 w-16 h-16 neu-lg rounded-full flex items-center justify-center text-primary-600 hover:shadow-neu-lg hover:scale-110 transition-all duration-300 z-50 gold-glow group">
          <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </Link>
    </div>
  );
}
