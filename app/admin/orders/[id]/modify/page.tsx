"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { OrderModifyForm } from "@/components/admin/OrderModifyForm";

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  products: {
    id: string;
    name: string;
    sku: string;
    price: number;
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
  order_items: OrderItem[];
}

export default function OrderModifyPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/orders/${params.id}`);
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

  const handleSave = async (modifiedItems: OrderItem[]) => {
    if (!order) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/orders/${params.id}/modify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_items: modifiedItems.map((item) => ({
            id: item.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to modify order");
      }

      alert("Order modified successfully");
      router.push(`/admin/orders/${params.id}`);
    } catch (error: any) {
      alert(error.message || "Failed to modify order");
    } finally {
      setSaving(false);
    }
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

  if (order.status !== "draft" && order.status !== "pending") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-error-600 mb-4">
            This order cannot be modified. Only draft or pending orders can be modified.
          </p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-neutral-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-neutral-900">
            Modify Order
          </h1>
          <p className="text-neutral-600 mt-1">
            {order.order_number}
          </p>
        </div>
      </div>

      <OrderModifyForm
        order={order}
        onSave={handleSave}
        onCancel={() => router.back()}
        saving={saving}
      />
    </div>
  );
}

