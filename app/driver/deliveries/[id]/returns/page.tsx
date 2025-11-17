"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { ArrowLeft, Package } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { ReturnForm } from "@/components/driver/ReturnForm";

interface Delivery {
  id: string;
  orders: {
    id: string;
    order_number: string;
    order_items: Array<{
      id: string;
      quantity: number;
      products: {
        id: string;
        name: string;
        sku: string;
      } | null;
    }>;
  } | null;
}

export default function ReturnsPage() {
  const params = useParams();
  const router = useRouter();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchDelivery = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/deliveries/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch delivery");

      const data = await response.json();
      setDelivery(data.delivery);
    } catch (error) {
      console.error("Error fetching delivery:", error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchDelivery();
    }
  }, [params.id, fetchDelivery]);

  const handleReturnSubmit = async (returns: Array<{ productId: string; quantity: number; reason: string; expiryDate?: string; batchNumber?: string }>) => {
    if (!delivery?.orders) return;

    try {
      setSubmitting(true);
      
      // Get driver ID from session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Please log in to submit returns");
        return;
      }

      // Transform returns to match API format
      const formattedReturns = returns.map(ret => ({
        product_id: ret.productId,
        quantity: ret.quantity,
        reason: ret.reason as 'expired' | 'damaged' | 'unsold',
        expiry_date: ret.expiryDate || undefined,
        batch_number: ret.batchNumber || undefined,
      }));

      const response = await fetch(`/api/deliveries/${params.id}/returns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returns: formattedReturns,
          returned_by: session.user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = errorData.error || "Failed to submit returns";
        if (errorData.details) {
          if (Array.isArray(errorData.details)) {
            errorMessage += "\n" + errorData.details.join("\n");
          } else {
            errorMessage += "\n" + errorData.details;
          }
        }
        if (errorData.invalidItems && Array.isArray(errorData.invalidItems)) {
          const invalidItemsMsg = errorData.invalidItems.map((item: any) => 
            `${item.product_name}: ${item.reason}`
          ).join("\n");
          errorMessage += "\nInvalid items:\n" + invalidItemsMsg;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      alert(`Returns submitted successfully. Invoice adjusted by $${data.totalReturnAmount?.toFixed(2) || '0.00'}.`);
      router.back();
    } catch (error: any) {
      alert(error.message || "Failed to submit returns");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader text="Loading..." fullScreen />;
  }

  if (!delivery) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-error-600">Delivery not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-neutral-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-neutral-900">
            Return Expired Items
          </h1>
          <p className="text-neutral-600 mt-1 text-sm">
            Order: {delivery.orders?.order_number || "N/A"}
          </p>
        </div>
      </div>

      <Card>
        <div className="flex items-center space-x-2 mb-4">
          <Package className="w-5 h-5 text-warning-600" />
          <h2 className="font-display text-lg text-neutral-900">
            Return Expired Items
          </h2>
        </div>
        <p className="text-sm text-neutral-600 mb-4">
          Select expired items to return. Only unsold expired items are accepted.
          The invoice will be automatically adjusted.
        </p>

        {delivery.orders?.order_items && delivery.orders.order_items.length > 0 ? (
          <ReturnForm
            items={delivery.orders.order_items}
            onSubmit={handleReturnSubmit}
            onCancel={() => router.back()}
            submitting={submitting}
          />
        ) : (
          <p className="text-neutral-600">No items available for return</p>
        )}
      </Card>
    </div>
  );
}

