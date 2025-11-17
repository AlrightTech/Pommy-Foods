"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { ArrowLeft, MapPin, Package, CheckCircle2, Camera, Thermometer } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase/client";
import { TemperatureLogger } from "@/components/driver/TemperatureLogger";
import { SignaturePad } from "@/components/ui/SignaturePad";

interface Delivery {
  id: string;
  status: string;
  scheduled_date: string | null;
  delivered_at: string | null;
  temperature_reading: number | null;
  proof_of_delivery: string | null;
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
    order_items: Array<{
      id: string;
      quantity: number;
      products: {
        name: string;
        sku: string;
        unit: string;
      } | null;
    }>;
  } | null;
}

export default function DeliveryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showTemperatureForm, setShowTemperatureForm] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);

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

  const handleStatusUpdate = async (newStatus: string) => {
    if (!delivery) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/deliveries/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update delivery");
      fetchDelivery();
    } catch (error) {
      console.error("Error updating delivery:", error);
      alert("Failed to update delivery");
    } finally {
      setUpdating(false);
    }
  };

  const handleTemperatureSubmit = async (temperature: number, productId?: string, location?: string) => {
    try {
      // Get driver ID from session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Please log in to record temperature");
        return;
      }

      // Use the new temperature API endpoint
      const response = await fetch(`/api/deliveries/${params.id}/temperature`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          temperature,
          product_id: productId || null,
          location: location || null,
          recorded_by: session.user.id,
          source: 'manual',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save temperature");
      }
      
      setShowTemperatureForm(false);
      fetchDelivery();
      alert("Temperature recorded successfully");
    } catch (error: any) {
      console.error("Error saving temperature:", error);
      alert(error.message || "Failed to save temperature");
    }
  };

  const handleSignatureSubmit = async (signature: string, photoUrl?: string) => {
    try {
      // Get driver ID from session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Please log in to submit proof of delivery");
        return;
      }

      // Use the delivery update endpoint which handles signature_data
      const response = await fetch(`/api/deliveries/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signature_data: signature,
          proof_of_delivery_url: photoUrl || null,
          signed_by: session.user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save signature");
      }
      
      setShowSignaturePad(false);
      fetchDelivery();
      alert("Proof of delivery saved successfully");
    } catch (error: any) {
      console.error("Error saving signature:", error);
      alert(error.message || "Failed to save signature");
    }
  };

  if (loading) {
    return <Loader text="Loading delivery..." fullScreen />;
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

  const isDelivered = delivery.status === "delivered";
  const isInTransit = delivery.status === "in_transit";
  const canMarkDelivered = delivery.status === "assigned" || isInTransit;

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-neutral-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-2xl md:text-3xl text-neutral-900">
            {delivery.orders?.order_number || "Delivery"}
          </h1>
          <p className="text-neutral-600 mt-1 text-sm">
            {delivery.orders?.stores?.name || "Unknown Store"}
          </p>
        </div>
      </div>

      {/* Delivery Info */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-primary-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-neutral-900">
                {delivery.orders?.stores?.address || "N/A"}
              </p>
              {delivery.orders?.stores?.city && delivery.orders?.stores?.state && (
                <p className="text-sm text-neutral-600">
                  {delivery.orders.stores.city}, {delivery.orders.stores.state}
                </p>
              )}
            </div>
          </div>

          {delivery.orders && (
            <div>
              <p className="text-sm text-neutral-600">Order Amount</p>
              <p className="text-lg font-bold text-primary-600">
                {formatCurrency(delivery.orders.final_amount)}
              </p>
            </div>
          )}

          {delivery.scheduled_date && (
            <div>
              <p className="text-sm text-neutral-600">Scheduled Date</p>
              <p className="text-sm font-semibold text-neutral-900">
                {format(new Date(delivery.scheduled_date), "MMM dd, yyyy")}
              </p>
            </div>
          )}

          {delivery.temperature_reading !== null && (
            <div>
              <p className="text-sm text-neutral-600">Temperature Reading</p>
              <p className="text-sm font-semibold text-neutral-900">
                {delivery.temperature_reading}°C
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Order Items */}
      {delivery.orders?.order_items && delivery.orders.order_items.length > 0 && (
        <Card>
          <h2 className="font-display text-lg text-neutral-900 mb-4">
            Order Items
          </h2>
          <div className="space-y-2">
            {delivery.orders.order_items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg"
              >
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    {item.products?.name || "Unknown"}
                  </p>
                  <p className="text-xs text-neutral-600">
                    {item.products?.sku || "N/A"}
                  </p>
                </div>
                <p className="text-sm text-neutral-700">
                  {item.quantity} {item.products?.unit || ""}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {!isInTransit && delivery.status === "assigned" && (
          <Button
            onClick={() => handleStatusUpdate("in_transit")}
            disabled={updating}
            className="w-full"
          >
            <Package className="w-4 h-4 mr-2" />
            Start Delivery
          </Button>
        )}

        {!showTemperatureForm && (
          <Button
            onClick={() => setShowTemperatureForm(true)}
            variant="secondary"
            className="w-full"
          >
            <Thermometer className="w-4 h-4 mr-2" />
            Log Temperature
          </Button>
        )}

        {showTemperatureForm && (
          <TemperatureLogger
            onSubmit={handleTemperatureSubmit}
            onCancel={() => setShowTemperatureForm(false)}
          />
        )}

        {!showSignaturePad && canMarkDelivered && (
          <Button
            onClick={() => setShowSignaturePad(true)}
            className="w-full bg-success-600 hover:bg-success-700"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark as Delivered
          </Button>
        )}

        {showSignaturePad && (
          <SignaturePad
            onSubmit={handleSignatureSubmit}
            onCancel={() => setShowSignaturePad(false)}
          />
        )}

        {isDelivered && (
          <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
            <p className="text-sm font-semibold text-success-900">
              ✓ Delivery Completed
            </p>
            {delivery.delivered_at && (
              <p className="text-xs text-success-700 mt-1">
                {format(new Date(delivery.delivered_at), "MMM dd, yyyy HH:mm")}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => router.push(`/driver/deliveries/${params.id}/returns`)}
          variant="secondary"
          className="w-full"
        >
          Returns
        </Button>
        <Button
          onClick={() => router.push(`/driver/deliveries/${params.id}/payment`)}
          variant="secondary"
          className="w-full"
        >
          Payment
        </Button>
      </div>
    </div>
  );
}

