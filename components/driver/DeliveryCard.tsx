"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MapPin, Package } from "lucide-react";
import { format } from "date-fns";

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

interface DeliveryCardProps {
  delivery: Delivery;
  onClick: () => void;
}

export function DeliveryCard({ delivery, onClick }: DeliveryCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "assigned":
        return <Badge variant="info">Assigned</Badge>;
      case "in_transit":
        return <Badge variant="info">In Transit</Badge>;
      case "delivered":
        return <Badge variant="success">Delivered</Badge>;
      default:
        return <Badge variant="info">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer active:scale-95"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-primary-600" />
            <span className="font-mono text-sm font-semibold text-primary-600">
              {delivery.orders?.order_number || "N/A"}
            </span>
          </div>
          {getStatusBadge(delivery.status)}
        </div>

        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-neutral-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-900 truncate">
                {delivery.orders?.stores?.name || "Unknown Store"}
              </p>
              {delivery.orders?.stores?.address && (
                <p className="text-xs text-neutral-600 line-clamp-2">
                  {delivery.orders.stores.address}
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
              Scheduled: {format(new Date(delivery.scheduled_date), "MMM dd, yyyy")}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

