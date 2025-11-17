"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { ArrowLeft, DollarSign, Camera } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { PaymentForm } from "@/components/driver/PaymentForm";

interface Delivery {
  id: string;
  orders: {
    id: string;
    order_number: string;
    final_amount: number;
  } | null;
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handlePaymentSubmit = async (paymentData: {
    method: string;
    amount: number;
    receipt?: string;
  }) => {
    if (!delivery?.orders) return;

    try {
      // Get driver ID from session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Please log in to record payment");
        return;
      }

      // Use the new delivery payment API
      const response = await fetch(`/api/deliveries/${params.id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: paymentData.amount,
          payment_method: paymentData.method,
          receipt_url: paymentData.receipt,
          collected_by: session.user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to record payment");
      }
      
      const data = await response.json();
      alert(`Payment recorded successfully. Invoice updated.`);
      router.back();
    } catch (error: any) {
      alert(error.message || "Failed to record payment");
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

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
            Payment Collection
          </h1>
          <p className="text-neutral-600 mt-1 text-sm">
            Order: {delivery.orders?.order_number || "N/A"}
          </p>
        </div>
      </div>

      <Card>
        <div className="flex items-center space-x-2 mb-4">
          <DollarSign className="w-5 h-5 text-primary-600" />
          <h2 className="font-display text-lg text-neutral-900">
            Record Payment
          </h2>
        </div>

        {delivery.orders && (
          <div className="mb-4 p-4 bg-primary-50 rounded-lg">
            <p className="text-sm text-neutral-600">Order Amount</p>
            <p className="text-2xl font-bold text-primary-600">
              {formatCurrency(delivery.orders.final_amount)}
            </p>
          </div>
        )}

        <PaymentForm
          orderAmount={delivery.orders?.final_amount || 0}
          onSubmit={handlePaymentSubmit}
          onCancel={() => router.back()}
        />
      </Card>
    </div>
  );
}

