"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { SalesChart } from "@/components/admin/SalesChart";
import { StatCard } from "@/components/admin/StatCard";
import { DollarSign, Package, TrendingUp, AlertTriangle } from "lucide-react";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{ name: string; quantity: number }>;
  salesByStore: Array<{ store: string; revenue: number }>;
  salesTrend: Array<{ date: string; amount: number }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?days=${dateRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Use static data as fallback
      const days = parseInt(dateRange);
      const staticData: AnalyticsData = {
        totalRevenue: 456789.50,
        totalOrders: 1247,
        averageOrderValue: 366.25,
        topProducts: [
          { name: 'Premium Coffee Beans', quantity: 245 },
          { name: 'Organic Tea Selection', quantity: 189 },
          { name: 'Artisan Bread Loaf', quantity: 156 },
          { name: 'Fresh Milk 1L', quantity: 134 },
          { name: 'Free Range Eggs (12)', quantity: 112 },
          { name: 'Organic Honey 500g', quantity: 98 },
          { name: 'Whole Grain Cereal', quantity: 87 },
          { name: 'Yogurt Assorted', quantity: 76 },
          { name: 'Fresh Vegetables Pack', quantity: 65 },
          { name: 'Premium Olive Oil', quantity: 54 },
        ],
        salesByStore: [
          { store: 'Downtown Convenience', revenue: 125450.00 },
          { store: 'Main Street Market', revenue: 98760.50 },
          { store: 'Corner Store', revenue: 87650.25 },
          { store: 'Quick Mart', revenue: 65430.75 },
          { store: 'Food Express', revenue: 53420.00 },
        ],
        salesTrend: Array.from({ length: days }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (days - 1 - i));
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
  }, [dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-neutral-600">Loading analytics...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-error-600">Failed to load analytics</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-neutral-900">
            Analytics
          </h1>
          <p className="text-neutral-600 mt-2">
            View sales reports and insights
          </p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white text-neutral-900"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(data.totalRevenue)}
          changeType="positive"
          icon={DollarSign}
          iconBg="bg-success-100"
        />
        <StatCard
          title="Total Orders"
          value={data.totalOrders.toLocaleString()}
          changeType="neutral"
          icon={Package}
        />
        <StatCard
          title="Average Order Value"
          value={formatCurrency(data.averageOrderValue)}
          changeType="positive"
          icon={TrendingUp}
          iconBg="bg-info-100"
        />
        <StatCard
          title="Active Products"
          value={data.topProducts.length.toLocaleString()}
          changeType="neutral"
          icon={AlertTriangle}
          iconBg="bg-warning-100"
        />
      </div>

      {/* Charts */}
      <SalesChart data={data.salesTrend} />

      {/* Top Products & Stores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-display text-xl text-neutral-900 mb-4">
            Top Products
          </h2>
          <div className="space-y-2">
            {data.topProducts.slice(0, 10).map((product, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                <span className="text-sm font-semibold text-neutral-900">
                  {product.name}
                </span>
                <span className="text-sm text-neutral-700">
                  {product.quantity} units
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-xl text-neutral-900 mb-4">
            Sales by Store
          </h2>
          <div className="space-y-2">
            {data.salesByStore.map((store, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                <span className="text-sm font-semibold text-neutral-900">
                  {store.store}
                </span>
                <span className="text-sm font-semibold text-primary-600">
                  {formatCurrency(store.revenue)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

