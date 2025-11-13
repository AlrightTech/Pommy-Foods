"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/admin/StatCard";
import { Loader } from "@/components/ui/Loader";
import { Package, ShoppingCart, TrendingUp, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  lowStockItems: number;
  totalInvoices: number;
}

export default function CustomerDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Get store ID
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("store_id")
          .eq("id", session.user.id)
          .single();

        if (!profile?.store_id) return;
        setStoreId(profile.store_id);

        // Fetch stats
        const [ordersRes, stockRes, invoicesRes] = await Promise.all([
          supabase
            .from("orders")
            .select("id, status", { count: "exact" })
            .eq("store_id", profile.store_id),
          supabase
            .from("store_stock")
            .select("id, current_stock, products(min_stock_level)")
            .eq("store_id", profile.store_id),
          supabase
            .from("invoices")
            .select("id", { count: "exact" })
            .eq("store_id", profile.store_id),
        ]);

        const totalOrders = ordersRes.count || 0;
        const pendingOrders = ordersRes.data?.filter(
          (o) => o.status === "pending" || o.status === "draft"
        ).length || 0;

        const lowStockItems = stockRes.data?.filter((s: any) => {
          const minLevel = s.products?.min_stock_level || 0;
          return s.current_stock < minLevel;
        }).length || 0;

        const totalInvoices = invoicesRes.count || 0;

        setStats({
          totalOrders,
          pendingOrders,
          lowStockItems,
          totalInvoices,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loader text="Loading dashboard..." fullScreen />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-neutral-900">
          Dashboard
        </h1>
        <p className="text-neutral-600 mt-2">
          Overview of your store operations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders.toString() || "0"}
          icon={ShoppingCart}
          iconBg="bg-primary-100"
        />
        <StatCard
          title="Pending Orders"
          value={stats?.pendingOrders.toString() || "0"}
          icon={Package}
          iconBg="bg-warning-100"
        />
        <StatCard
          title="Low Stock Items"
          value={stats?.lowStockItems.toString() || "0"}
          icon={AlertTriangle}
          iconBg="bg-error-100"
        />
        <StatCard
          title="Total Invoices"
          value={stats?.totalInvoices.toString() || "0"}
          icon={TrendingUp}
          iconBg="bg-info-100"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-display text-xl text-neutral-900 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link
              href="/customer/orders/new"
              className="block px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-center font-semibold"
            >
              Create New Order
            </Link>
            <Link
              href="/customer/stock"
              className="block px-4 py-3 border-2 border-primary-500 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors text-center font-semibold"
            >
              Update Stock Levels
            </Link>
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-xl text-neutral-900 mb-4">
            Recent Activity
          </h2>
          <div className="text-sm text-neutral-600">
            <p>Your recent orders and updates will appear here.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

