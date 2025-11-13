"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { Search, Eye } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase/client";

interface Order {
  id: string;
  order_number: string;
  status: string;
  final_amount: number;
  created_at: string;
  approved_at: string | null;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("store_id")
        .eq("id", session.user.id)
        .single();

      if (!profile?.store_id) return;
      setStoreId(profile.store_id);

      const params = new URLSearchParams();
      params.append("store_id", profile.store_id);
      if (statusFilter) params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/orders?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch orders");

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-neutral-900">
            Orders
          </h1>
          <p className="text-neutral-600 mt-2">View your order history</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center space-x-2 bg-neutral-100 rounded-lg px-4 py-2">
            <Search className="w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search by Order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm text-neutral-900 placeholder-neutral-500"
            />
          </div>
          <select
            value={statusFilter || ""}
            onChange={(e) => setStatusFilter(e.target.value || null)}
            className="px-4 py-2 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white text-neutral-900"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </Card>

      {/* Orders Table */}
      <Card>
        {loading ? (
          <div className="py-12">
            <Loader text="Loading orders..." />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-neutral-600">
            No orders found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-neutral-100 border-b-2 border-neutral-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-700">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-mono text-primary-600">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {format(new Date(order.created_at), "MMM dd, yyyy")}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-neutral-900 text-right">
                      {formatCurrency(order.final_amount)}
                    </td>
                    <td className="px-6 py-4">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/customer/orders/${order.id}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

