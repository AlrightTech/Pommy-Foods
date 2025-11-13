"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { ArrowLeft, CheckCircle2, XCircle, Edit, RefreshCw, Package } from "lucide-react";
import { format } from "date-fns";

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

interface KitchenSheet {
  id: string;
  prepared_at: string | null;
  completed_at: string | null;
  notes: string | null;
}

interface Delivery {
  id: string;
  status: string;
  scheduled_date: string | null;
  delivered_at: string | null;
  driver_id: string | null;
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
  stores: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
  } | null;
  order_items: OrderItem[];
  kitchen_sheets?: KitchenSheet[];
  deliveries?: Delivery[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/orders/${params.id}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch order');
      }
      const data = await response.json();
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchOrder();
    }
  }, [params.id, fetchOrder]);

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this order? This will generate a kitchen sheet and delivery note, and update the store balance.')) {
      return;
    }

    try {
      setIsApproving(true);
      const response = await fetch(`/api/admin/orders/${params.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved_by: 'current-user-id' }), // TODO: Get from auth
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || 'Order approved successfully! Kitchen sheet and delivery note have been generated.');
        fetchOrder();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.details 
          ? Array.isArray(errorData.details) 
            ? errorData.details.join('\n') 
            : errorData.details
          : errorData.error || 'Failed to approve order';
        alert(`Failed to approve order:\n${errorMessage}`);
      }
    } catch (err) {
      console.error('Error approving order:', err);
      alert('Failed to approve order. Please try again.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Please provide a reason for rejecting this order:');
    if (reason === null) {
      return; // User cancelled
    }

    if (!reason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }

    if (!confirm('Are you sure you want to reject this order?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/orders/${params.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reason: reason.trim(),
          rejected_by: 'current-user-id' // TODO: Get from auth
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || 'Order rejected successfully');
        fetchOrder();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Failed to reject order';
        alert(`Failed to reject order: ${errorMessage}`);
      }
    } catch (err) {
      console.error('Error rejecting order:', err);
      alert('Failed to reject order. Please try again.');
    }
  };

  const handleModify = async () => {
    if (!order) return;
    router.push(`/admin/orders/${order.id}/modify`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return <Loader text="Loading order..." fullScreen />;
  }

  if (error || !order) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-error-600">Error: {error || 'Order not found'}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
              {order.order_number}
            </h1>
            <p className="text-neutral-600 mt-1">
              Created on {format(new Date(order.created_at), 'MMMM dd, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <OrderStatusBadge status={order.status} />
          {(order.status === 'pending' || order.status === 'draft') && (
            <>
              <Button
                onClick={handleModify}
                variant="secondary"
                className="flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Modify</span>
              </Button>
              <Button
                onClick={handleApprove}
                disabled={isApproving}
                className="flex items-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isApproving ? 'Approving...' : 'Approve'}</span>
              </Button>
              <Button
                variant="secondary"
                onClick={handleReject}
                className="flex items-center space-x-2"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Store Information */}
          <Card>
            <h2 className="font-semibold text-xl font-body text-neutral-900 mb-4">
              Store Information
            </h2>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-semibold text-neutral-700">Name:</span>{' '}
                <span className="text-neutral-900">{order.stores?.name || 'N/A'}</span>
              </p>
              <p className="text-sm">
                <span className="font-semibold text-neutral-700">Email:</span>{' '}
                <span className="text-neutral-900">{order.stores?.email || 'N/A'}</span>
              </p>
              {order.stores?.phone && (
                <p className="text-sm">
                  <span className="font-semibold text-neutral-700">Phone:</span>{' '}
                  <span className="text-neutral-900">{order.stores.phone}</span>
                </p>
              )}
              {order.stores?.address && (
                <p className="text-sm">
                  <span className="font-semibold text-neutral-700">Address:</span>{' '}
                  <span className="text-neutral-900">{order.stores.address}</span>
                </p>
              )}
            </div>
          </Card>

          {/* Order Items */}
          <Card>
            <h2 className="font-semibold text-xl font-body text-neutral-900 mb-4">
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
                        {item.products?.name || 'Unknown Product'}
                      </td>
                      <td className="py-3 px-4 text-sm text-neutral-600 font-mono">
                        {item.products?.sku || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-sm text-neutral-900 text-right">
                        {item.quantity} {item.products?.unit || ''}
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
              <h2 className="font-semibold text-xl font-body text-neutral-900 mb-4">
                Notes
              </h2>
              <p className="text-sm text-neutral-700">{order.notes}</p>
            </Card>
          )}

          {/* Kitchen Sheet */}
          {order.kitchen_sheets && order.kitchen_sheets.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-primary-600" />
                <h2 className="font-display text-xl text-neutral-900">
                  Kitchen Sheet
                </h2>
              </div>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-semibold text-neutral-700">Status:</span>{' '}
                  <span className="text-neutral-900">
                    {order.kitchen_sheets[0].completed_at ? 'Completed' : order.kitchen_sheets[0].prepared_at ? 'In Progress' : 'Pending'}
                  </span>
                </p>
                {order.kitchen_sheets[0].prepared_at && (
                  <p className="text-sm">
                    <span className="font-semibold text-neutral-700">Prepared:</span>{' '}
                    <span className="text-neutral-900">
                      {format(new Date(order.kitchen_sheets[0].prepared_at), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </p>
                )}
                {order.kitchen_sheets[0].completed_at && (
                  <p className="text-sm">
                    <span className="font-semibold text-neutral-700">Completed:</span>{' '}
                    <span className="text-neutral-900">
                      {format(new Date(order.kitchen_sheets[0].completed_at), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Delivery Note */}
          {order.deliveries && order.deliveries.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-primary-600" />
                <h2 className="font-display text-xl text-neutral-900">
                  Delivery
                </h2>
              </div>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-semibold text-neutral-700">Status:</span>{' '}
                  <span className="text-neutral-900 capitalize">{order.deliveries[0].status.replace('_', ' ')}</span>
                </p>
                {order.deliveries[0].scheduled_date && (
                  <p className="text-sm">
                    <span className="font-semibold text-neutral-700">Scheduled:</span>{' '}
                    <span className="text-neutral-900">
                      {format(new Date(order.deliveries[0].scheduled_date), 'MMM dd, yyyy')}
                    </span>
                  </p>
                )}
                {order.deliveries[0].delivered_at && (
                  <p className="text-sm">
                    <span className="font-semibold text-neutral-700">Delivered:</span>{' '}
                    <span className="text-neutral-900">
                      {format(new Date(order.deliveries[0].delivered_at), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </p>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <h2 className="font-semibold text-xl font-body text-neutral-900 mb-4">
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
                  Approved on {format(new Date(order.approved_at), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

