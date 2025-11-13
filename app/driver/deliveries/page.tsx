"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { DeliveryCard } from "@/components/driver/DeliveryCard";
import { Search, Truck } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface Delivery {
  id: string;
  status: string;
  scheduled_date: string | null;
  delivered_at: string | null;
  orders: {
    id: string;
    order_number: string;
    final_amount: number;
    stores: {
      id: string;
      name: string;
      address: string | null;
    } | null;
  } | null;
}

export default function DeliveriesPage() {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchDeliveries = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const params = new URLSearchParams();
      params.append("driver_id", session.user.id);
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await fetch(`/api/deliveries?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch deliveries");

      const data = await response.json();
      setDeliveries(data.deliveries || []);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const filteredDeliveries = deliveries.filter((delivery) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      delivery.orders?.order_number.toLowerCase().includes(query) ||
      delivery.orders?.stores?.name.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl text-neutral-900">
          Deliveries
        </h1>
        <p className="text-neutral-600 mt-1 text-sm">
          Manage your assigned deliveries
        </p>
      </div>

      {/* Filters */}
      <Card>
        <div className="space-y-3">
          <div className="flex items-center space-x-2 bg-neutral-100 rounded-lg px-4 py-2">
            <Search className="w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search deliveries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm text-neutral-900 placeholder-neutral-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white text-neutral-900"
          >
            <option value="all">All Statuses</option>
            <option value="assigned">Assigned</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </Card>

      {/* Deliveries List */}
      {loading ? (
        <div className="py-12">
          <Loader text="Loading deliveries..." />
        </div>
      ) : filteredDeliveries.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-neutral-600">
            <Truck className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <p>No deliveries found</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDeliveries.map((delivery) => (
            <DeliveryCard
              key={delivery.id}
              delivery={delivery}
              onClick={() => router.push(`/driver/deliveries/${delivery.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

