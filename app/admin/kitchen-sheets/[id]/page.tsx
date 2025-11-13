"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { ArrowLeft, Package } from "lucide-react";
import { format } from "date-fns";

interface KitchenSheetItem {
  id: string;
  product_id: string;
  quantity: number;
  batch_number: string | null;
  expiry_date: string | null;
  prepared: boolean;
  products: {
    id: string;
    name: string;
    sku: string;
    unit: string;
  } | null;
}

interface KitchenSheet {
  id: string;
  order_id: string;
  prepared_at: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  orders: {
    id: string;
    order_number: string;
    stores: {
      id: string;
      name: string;
    } | null;
  } | null;
  kitchen_sheet_items?: KitchenSheetItem[];
}

export default function KitchenSheetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [sheet, setSheet] = useState<KitchenSheet | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSheet = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/kitchen-sheets/${params.id}`);
      if (!response.ok) {
        // Fallback if endpoint doesn't exist
        setSheet(null);
        return;
      }

      const data = await response.json();
      setSheet(data.kitchen_sheet);
    } catch (error) {
      console.error("Error fetching kitchen sheet:", error);
      setSheet(null);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchSheet();
    }
  }, [params.id, fetchSheet]);

  if (loading) {
    return <Loader text="Loading kitchen sheet..." fullScreen />;
  }

  if (!sheet) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-error-600">Kitchen sheet not found</div>
      </div>
    );
  }

  const isCompleted = !!sheet.completed_at;
  const isInProgress = !!sheet.prepared_at && !isCompleted;

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
          <h1 className="font-semibold text-3xl md:text-4xl font-body text-neutral-900 mb-2">
            Kitchen Sheet
          </h1>
          <p className="text-neutral-600 mt-1">
            Order: {sheet.orders?.order_number || "N/A"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-primary-600" />
              <h2 className="font-semibold text-xl font-body text-neutral-900">
                Items to Prepare
              </h2>
            </div>
            <div className="space-y-4">
              {sheet.kitchen_sheet_items && sheet.kitchen_sheet_items.length > 0 ? (
                sheet.kitchen_sheet_items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg ${
                      item.prepared ? "bg-success-50 border border-success-200" : "bg-neutral-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900">
                          {item.products?.name || "Unknown Product"}
                        </h3>
                        <p className="text-xs text-neutral-600">
                          {item.products?.sku || "N/A"} • Quantity: {item.quantity}{" "}
                          {item.products?.unit || ""}
                        </p>
                        {item.batch_number && (
                          <p className="text-xs text-neutral-600 mt-1">
                            Batch: {item.batch_number}
                          </p>
                        )}
                        {item.expiry_date && (
                          <p className="text-xs text-neutral-600">
                            Expiry: {new Date(item.expiry_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div>
                        {item.prepared ? (
                          <span className="px-2 py-1 bg-success-100 text-success-700 text-xs rounded">
                            Prepared
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-warning-100 text-warning-700 text-xs rounded">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-neutral-600">No items found</p>
              )}
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <h2 className="font-semibold text-xl font-body text-neutral-900 mb-4">
              Sheet Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-neutral-500">Store</p>
                <p className="text-sm font-semibold text-neutral-900">
                  {sheet.orders?.stores?.name || "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Created</p>
                <p className="text-sm text-neutral-700">
                  {format(new Date(sheet.created_at), "MMM dd, yyyy HH:mm")}
                </p>
              </div>
              {sheet.prepared_at && (
                <div>
                  <p className="text-xs text-neutral-500">Started</p>
                  <p className="text-sm text-neutral-700">
                    {format(new Date(sheet.prepared_at), "MMM dd, yyyy HH:mm")}
                  </p>
                </div>
              )}
              {sheet.completed_at && (
                <div>
                  <p className="text-xs text-neutral-500">Completed</p>
                  <p className="text-sm text-success-600">
                    {format(new Date(sheet.completed_at), "MMM dd, yyyy HH:mm")}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-neutral-500">Status</p>
                <p className="text-sm font-semibold text-neutral-900">
                  {isCompleted
                    ? "Completed"
                    : isInProgress
                    ? "In Progress"
                    : "Pending"}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

