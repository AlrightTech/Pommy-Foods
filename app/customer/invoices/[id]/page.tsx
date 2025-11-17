"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Loader } from "@/components/ui/Loader";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";

interface InvoiceItem {
  id: string;
  product_id: string;
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

interface Return {
  id: string;
  quantity: number;
  reason: string | null;
  products: {
    id: string;
    name: string;
  } | null;
}

interface Invoice {
  id: string;
  invoice_number: string;
  total_amount: number;
  payment_status: string;
  due_date: string | null;
  created_at: string;
  orders: {
    id: string;
    order_number: string;
    order_items: InvoiceItem[];
  } | null;
  returns?: Return[];
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoice = useCallback(async () => {
    try {
      setLoading(true);
      // Use the new customer invoices API
      const response = await fetch(`/api/customer/invoices/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch invoice");

      const data = await response.json();
      setInvoice(data.invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
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
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="success">Paid</Badge>;
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "overdue":
        return <Badge variant="error">Overdue</Badge>;
      default:
        return <Badge variant="info">{status}</Badge>;
    }
  };

  if (loading) {
    return <Loader text="Loading invoice..." fullScreen />;
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-error-600">Invoice not found</div>
      </div>
    );
  }

  const returnsTotal = invoice.returns?.reduce(
    (sum, ret) => sum + (ret.products ? ret.quantity * 0 : 0),
    0
  ) || 0;

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
              Created on {format(new Date(invoice.created_at), "MMMM dd, yyyy")}
            </p>
          </div>
        </div>
        {getStatusBadge(invoice.payment_status)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {invoice.orders && (
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
                    {invoice.orders.order_items.map((item) => (
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
          )}

          {invoice.returns && invoice.returns.length > 0 && (
            <Card>
              <h2 className="font-display text-xl text-neutral-900 mb-4">
                Returns (Adjustments)
              </h2>
              <div className="space-y-2">
                {invoice.returns.map((ret) => (
                  <div
                    key={ret.id}
                    className="p-3 bg-neutral-50 rounded-lg"
                  >
                    <p className="text-sm font-semibold text-neutral-900">
                      {ret.products?.name || "Unknown Product"}
                    </p>
                    <p className="text-xs text-neutral-600">
                      Quantity: {ret.quantity} • {ret.reason || "No reason provided"}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <h2 className="font-display text-xl text-neutral-900 mb-4">
              Invoice Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Subtotal:</span>
                <span className="font-semibold text-neutral-900">
                  {formatCurrency(invoice.total_amount)}
                </span>
              </div>
              {returnsTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Returns:</span>
                  <span className="font-semibold text-success-600">
                    -{formatCurrency(returnsTotal)}
                  </span>
                </div>
              )}
              <div className="border-t border-neutral-200 pt-3 flex justify-between">
                <span className="font-semibold text-neutral-900">Total:</span>
                <span className="font-bold text-lg text-primary-600">
                  {formatCurrency(invoice.total_amount - returnsTotal)}
                </span>
              </div>
            </div>

            {invoice.due_date && (
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <p className="text-xs text-neutral-500">
                  Due Date: {format(new Date(invoice.due_date), "MMM dd, yyyy")}
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

