"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, Download } from "lucide-react";
import { format } from "date-fns";

interface Invoice {
  id: string;
  invoice_number: string;
  subtotal: number;
  discount_amount: number;
  return_amount: number;
  total_amount: number;
  due_date: string | null;
  payment_status: string;
  created_at: string;
  stores: {
    id: string;
    name: string;
    email: string;
    address: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
  } | null;
  orders: {
    id: string;
    order_number: string;
    order_items: Array<{
      id: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      products: {
        name: string;
        sku: string;
      } | null;
    }>;
  } | null;
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoice = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/invoices/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch invoice');
      }
      const data = await response.json();
      setInvoice(data.invoice);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      alert('Failed to load invoice');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchInvoice();
    }
  }, [params.id, fetchInvoice]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-neutral-600">Loading invoice...</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-error-600">Invoice not found</div>
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
              {invoice.invoice_number}
            </h1>
            <p className="text-neutral-600 mt-1">
              Invoice Details
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant={invoice.payment_status === 'paid' ? 'success' : invoice.payment_status === 'overdue' ? 'error' : 'warning'}>
            {invoice.payment_status}
          </Badge>
          <Button variant="secondary" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Store Information */}
          {invoice.stores && (
            <Card>
              <h2 className="font-display text-xl text-neutral-900 mb-4">
                Bill To
              </h2>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-neutral-900">
                  {invoice.stores.name}
                </p>
                {invoice.stores.address && (
                  <p className="text-sm text-neutral-700">
                    {invoice.stores.address}
                  </p>
                )}
                {(invoice.stores.city || invoice.stores.state) && (
                  <p className="text-sm text-neutral-700">
                    {invoice.stores.city}{invoice.stores.city && invoice.stores.state && ', '}
                    {invoice.stores.state} {invoice.stores.zip_code}
                  </p>
                )}
                <p className="text-sm text-neutral-700">
                  {invoice.stores.email}
                </p>
              </div>
            </Card>
          )}

          {/* Invoice Items */}
          {invoice.orders?.order_items && invoice.orders.order_items.length > 0 && (
            <Card>
              <h2 className="font-display text-xl text-neutral-900 mb-4">
                Invoice Items
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                        Product
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
                    {invoice.orders.order_items.map((item) => (
                      <tr key={item.id} className="border-b border-neutral-200">
                        <td className="py-3 px-4 text-sm text-neutral-900">
                          {item.products?.name || 'Unknown'}
                        </td>
                        <td className="py-3 px-4 text-sm text-neutral-900 text-right">
                          {item.quantity}
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
          )}
        </div>

        {/* Invoice Summary */}
        <div>
          <Card>
            <h2 className="font-display text-xl text-neutral-900 mb-4">
              Invoice Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Subtotal:</span>
                <span className="font-semibold text-neutral-900">
                  {formatCurrency(invoice.subtotal)}
                </span>
              </div>
              {invoice.discount_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Discount:</span>
                  <span className="font-semibold text-success-600">
                    -{formatCurrency(invoice.discount_amount)}
                  </span>
                </div>
              )}
              {invoice.return_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Returns:</span>
                  <span className="font-semibold text-error-600">
                    -{formatCurrency(invoice.return_amount)}
                  </span>
                </div>
              )}
              <div className="border-t border-neutral-200 pt-3 flex justify-between">
                <span className="font-semibold text-neutral-900">Total:</span>
                <span className="font-bold text-lg text-primary-600">
                  {formatCurrency(invoice.total_amount)}
                </span>
              </div>
              {invoice.due_date && (
                <div className="pt-3 border-t border-neutral-200">
                  <p className="text-xs text-neutral-600">
                    Due Date: {format(new Date(invoice.due_date), 'MMMM dd, yyyy')}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

