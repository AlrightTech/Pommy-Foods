"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Loader } from "@/components/ui/Loader";
import { ArrowLeft, Truck, MapPin, Thermometer, Package } from "lucide-react";
import { format } from "date-fns";

interface Delivery {
  id: string;
  status: string;
  scheduled_date: string | null;
  delivered_at: string | null;
  temperature_reading: number | null;
  proof_of_delivery_url: string | null;
  notes: string | null;
  orders: {
    id: string;
    order_number: string;
    final_amount: number;
    stores: {
      id: string;
      name: string;
      email: string;
      phone: string | null;
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
      } | null;
    }>;
  } | null;
  returns: Array<{
    id: string;
    quantity: number;
    reason: string;
    products: {
      name: string;
    } | null;
  }>;
}

export default function DeliveryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDelivery = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/deliveries/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch delivery');
      }
      const data = await response.json();
      setDelivery(data.delivery);
    } catch (error) {
      console.error('Error fetching delivery:', error);
      alert('Failed to load delivery');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchDelivery();
    }
  }, [params.id, fetchDelivery]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
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
            <h1 className="font-semibold text-3xl md:text-4xl font-body text-neutral-900 mb-2">
              Delivery Details
            </h1>
            <p className="text-neutral-600 mt-1">
              Order: {delivery.orders?.order_number || 'N/A'}
            </p>
          </div>
        </div>
        <Badge variant={delivery.status === 'delivered' ? 'success' : delivery.status === 'in_transit' ? 'info' : 'warning'}>
          {delivery.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Information */}
          <Card>
            <h2 className="font-semibold text-xl font-body text-neutral-900 mb-4 flex items-center space-x-2">
              <Truck className="w-5 h-5" />
              <span>Delivery Information</span>
            </h2>
            <div className="space-y-3">
              {delivery.scheduled_date && (
                <div>
                  <span className="text-sm font-semibold text-neutral-700">Scheduled Date:</span>
                  <p className="text-sm text-neutral-900">
                    {format(new Date(delivery.scheduled_date), 'MMMM dd, yyyy')}
                  </p>
                </div>
              )}
              {delivery.delivered_at && (
                <div>
                  <span className="text-sm font-semibold text-neutral-700">Delivered At:</span>
                  <p className="text-sm text-neutral-900">
                    {format(new Date(delivery.delivered_at), 'MMMM dd, yyyy HH:mm')}
                  </p>
                </div>
              )}
              {delivery.temperature_reading && (
                <div className="flex items-center space-x-2">
                  <Thermometer className="w-4 h-4 text-neutral-500" />
                  <div>
                    <span className="text-sm font-semibold text-neutral-700">Temperature:</span>
                    <p className="text-sm text-neutral-900">
                      {delivery.temperature_reading}°C
                    </p>
                  </div>
                </div>
              )}
              {delivery.proof_of_delivery_url && (
                <div>
                  <span className="text-sm font-semibold text-neutral-700">Proof of Delivery:</span>
                  <a
                    href={delivery.proof_of_delivery_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-700 block mt-1"
                  >
                    View Proof
                  </a>
                </div>
              )}
            </div>
          </Card>

          {/* Store Information */}
          {delivery.orders?.stores && (
            <Card>
              <h2 className="font-semibold text-xl font-body text-neutral-900 mb-4 flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Delivery Address</span>
              </h2>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-neutral-900">
                  {delivery.orders.stores.name}
                </p>
                {delivery.orders.stores.address && (
                  <p className="text-sm text-neutral-700">
                    {delivery.orders.stores.address}
                  </p>
                )}
                {(delivery.orders.stores.city || delivery.orders.stores.state) && (
                  <p className="text-sm text-neutral-700">
                    {delivery.orders.stores.city}{delivery.orders.stores.city && delivery.orders.stores.state && ', '}
                    {delivery.orders.stores.state}
                  </p>
                )}
                {delivery.orders.stores.phone && (
                  <p className="text-sm text-neutral-700">
                    Phone: {delivery.orders.stores.phone}
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Order Items */}
          {delivery.orders?.order_items && delivery.orders.order_items.length > 0 && (
            <Card>
              <h2 className="font-semibold text-xl font-body text-neutral-900 mb-4 flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Order Items</span>
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-2 text-sm font-semibold text-neutral-700">Product</th>
                      <th className="text-right py-2 text-sm font-semibold text-neutral-700">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {delivery.orders.order_items.map((item) => (
                      <tr key={item.id} className="border-b border-neutral-200">
                        <td className="py-2 text-sm text-neutral-900">
                          {item.products?.name || 'Unknown'}
                        </td>
                        <td className="py-2 text-sm text-neutral-900 text-right">
                          {item.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Returns */}
          {delivery.returns && delivery.returns.length > 0 && (
            <Card>
              <h2 className="font-semibold text-xl font-body text-neutral-900 mb-4">
                Returns
              </h2>
              <div className="space-y-2">
                {delivery.returns.map((returnItem) => (
                  <div key={returnItem.id} className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">
                        {returnItem.products?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-neutral-600">
                        Reason: {returnItem.reason}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-error-600">
                      -{returnItem.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Summary */}
        <div>
          <Card>
            <h2 className="font-semibold text-xl font-body text-neutral-900 mb-4">
              Summary
            </h2>
            {delivery.orders && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Order Amount:</span>
                  <span className="font-semibold text-neutral-900">
                    {formatCurrency(delivery.orders.final_amount)}
                  </span>
                </div>
                {delivery.notes && (
                  <div className="pt-3 border-t border-neutral-200">
                    <p className="text-xs font-semibold text-neutral-700 mb-1">Notes:</p>
                    <p className="text-xs text-neutral-600">{delivery.notes}</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

