"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  products: {
    id: string;
    name: string;
    sku: string;
    unit: string;
  } | null;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  notes: string | null;
  created_at: string;
  approved_at: string | null;
  order_items: OrderItem[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch order");

      const data = await response.json();
      setOrder(data.order);
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchOrder();
    }
  }, [params.id, fetchOrder]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return <Loader text="Loading order..." fullScreen />;
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-error-600">Order not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-neutral-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-neutral-900">
              {order.order_number}
            </h1>
            <p className="text-neutral-600 mt-1">
              Created on {format(new Date(order.created_at), "MMMM dd, yyyy")}
            </p>
          </div>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="font-display text-xl text-neutral-900 mb-4">
              Order Items
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                      Product
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                      SKU
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700">
                      Quantity
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700">
                      Unit Price
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.order_items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-neutral-200"
                    >
                      <td className="py-3 px-4 text-sm text-neutral-900">
                        {item.products?.name || "Unknown Product"}
                      </td>
                      <td className="py-3 px-4 text-sm text-neutral-600 font-mono">
                        {item.products?.sku || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-sm text-neutral-900 text-right">
                        {item.quantity} {item.products?.unit || ""}
                      </td>
                      <td className="py-3 px-4 text-sm text-neutral-900 text-right">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-neutral-900 text-right">
                        {formatCurrency(item.total_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {order.notes && (
            <Card>
              <h2 className="font-display text-xl text-neutral-900 mb-4">
                Notes
              </h2>
              <p className="text-sm text-neutral-700">{order.notes}</p>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <h2 className="font-display text-xl text-neutral-900 mb-4">
              Order Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Subtotal:</span>
                <span className="font-semibold text-neutral-900">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Discount:</span>
                  <span className="font-semibold text-success-600">
                    -{formatCurrency(order.discount_amount)}
                  </span>
                </div>
              )}
              <div className="border-t border-neutral-200 pt-3 flex justify-between">
                <span className="font-semibold text-neutral-900">Total:</span>
                <span className="font-bold text-lg text-primary-600">
                  {formatCurrency(order.final_amount)}
                </span>
              </div>
            </div>

            {order.approved_at && (
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <p className="text-xs text-neutral-500">
                  Approved on{" "}
                  {format(new Date(order.approved_at), "MMM dd, yyyy HH:mm")}
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

