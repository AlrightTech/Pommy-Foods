"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { DeliveryCard } from "@/components/driver/DeliveryCard";
import { Truck, Clock, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

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

export default function DriverDashboardPage() {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [driverId, setDriverId] = useState<string | null>(null);

  const fetchDeliveries = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      setDriverId(session.user.id);

      const params = new URLSearchParams();
      params.append("driver_id", session.user.id);
      params.append("status", "assigned,in_transit");

      const response = await fetch(`/api/deliveries?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch deliveries");

      const data = await response.json();
      setDeliveries(data.deliveries || []);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const pendingCount = deliveries.filter((d) => d.status === "assigned").length;
  const inTransitCount = deliveries.filter((d) => d.status === "in_transit").length;

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl text-neutral-900">
          Driver Dashboard
        </h1>
        <p className="text-neutral-600 mt-1 text-sm">
          Your assigned deliveries
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{pendingCount}</p>
              <p className="text-xs text-neutral-600">Pending</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-info-100 rounded-full flex items-center justify-center">
              <Truck className="w-6 h-6 text-info-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{inTransitCount}</p>
              <p className="text-xs text-neutral-600">In Transit</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Deliveries List */}
      {loading ? (
        <div className="py-12">
          <Loader text="Loading deliveries..." />
        </div>
      ) : deliveries.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-neutral-600">
            <Truck className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <p>No assigned deliveries</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {deliveries.map((delivery) => (
            <DeliveryCard
              key={delivery.id}
              delivery={delivery}
              onClick={() => router.push(`/driver/deliveries/${delivery.id}`)}
            />
          ))}
        </div>
      )}

      <Link
        href="/driver/deliveries"
        className="block w-full text-center py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold"
      >
        View All Deliveries
      </Link>
    </div>
  );
}

