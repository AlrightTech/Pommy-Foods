"use client";

import { Card } from "@/components/ui/Card";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { format } from "date-fns";
import Link from "next/link";

interface Order {
  id: string;
  order_number: string;
  status: string;
  final_amount: number;
  created_at: string;
}

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Link href={`/customer/orders/${order.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg text-neutral-900">
              {order.order_number}
            </h3>
            <OrderStatusBadge status={order.status} />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-600">
              {format(new Date(order.created_at), "MMM dd, yyyy")}
            </p>
            <p className="text-lg font-bold text-primary-600">
              {formatCurrency(order.final_amount)}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

