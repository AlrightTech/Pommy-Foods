"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Search, Truck, MapPin } from "lucide-react";
import { format } from "date-fns";

interface Delivery {
  id: string;
  status: string;
  scheduled_date: string | null;
  delivered_at: string | null;
  temperature_reading: number | null;
  orders: {
    id: string;
    order_number: string;
    final_amount: number;
    stores: {
      id: string;
      name: string;
      address: string | null;
      city: string | null;
      state: string | null;
    } | null;
  } | null;
}

export default function DeliveriesPage() {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const fetchDeliveries = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/deliveries?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch deliveries');
      }

      const data = await response.json();
      setDeliveries(data.deliveries || []);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'assigned':
        return <Badge variant="info">Assigned</Badge>;
      case 'in_transit':
        return <Badge variant="info">In Transit</Badge>;
      case 'delivered':
        return <Badge variant="success">Delivered</Badge>;
      case 'returned':
        return <Badge variant="error">Returned</Badge>;
      default:
        return <Badge variant="info">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-neutral-900">
          Deliveries
        </h1>
        <p className="text-neutral-600 mt-2">
          Track and manage deliveries
        </p>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter || ''}
            onChange={(e) => setStatusFilter(e.target.value || null)}
            className="px-4 py-2 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white text-neutral-900"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="returned">Returned</option>
          </select>
        </div>
      </Card>

      {/* Deliveries List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8 text-neutral-600">
            Loading deliveries...
          </div>
        ) : deliveries.length === 0 ? (
          <div className="col-span-full text-center py-8 text-neutral-600">
            No deliveries found
          </div>
        ) : (
          deliveries.map((delivery) => (
            <Card key={delivery.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/admin/deliveries/${delivery.id}`)}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-primary-600" />
                  <span className="font-mono text-sm text-primary-600">
                    {delivery.orders?.order_number || 'N/A'}
                  </span>
                </div>
                {getStatusBadge(delivery.status)}
              </div>

              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-neutral-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">
                      {delivery.orders?.stores?.name || 'Unknown Store'}
                    </p>
                    {delivery.orders?.stores?.address && (
                      <p className="text-xs text-neutral-600">
                        {delivery.orders.stores.address}
                        {delivery.orders.stores.city && `, ${delivery.orders.stores.city}`}
                      </p>
                    )}
                  </div>
                </div>

                {delivery.orders && (
                  <p className="text-sm text-neutral-700">
                    Amount: <span className="font-semibold">{formatCurrency(delivery.orders.final_amount)}</span>
                  </p>
                )}

                {delivery.scheduled_date && (
                  <p className="text-xs text-neutral-600">
                    Scheduled: {format(new Date(delivery.scheduled_date), 'MMM dd, yyyy')}
                  </p>
                )}

                {delivery.delivered_at && (
                  <p className="text-xs text-success-600">
                    Delivered: {format(new Date(delivery.delivered_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                )}

                {delivery.temperature_reading && (
                  <p className="text-xs text-neutral-600">
                    Temperature: {delivery.temperature_reading}°C
                  </p>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

