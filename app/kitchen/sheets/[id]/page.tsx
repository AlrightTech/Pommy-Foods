"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { KitchenItemRow } from "@/components/kitchen/KitchenItemRow";
import { ArrowLeft, CheckCircle2, Package } from "lucide-react";
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
  const [updating, setUpdating] = useState(false);

  const fetchSheet = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/kitchen-sheets/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch kitchen sheet");

      const data = await response.json();
      setSheet(data.kitchen_sheet);
    } catch (error) {
      console.error("Error fetching kitchen sheet:", error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchSheet();
    }
  }, [params.id, fetchSheet]);

  const handleItemUpdate = async (itemId: string, updates: any) => {
    try {
      const response = await fetch(
        `/api/admin/kitchen-sheets/${params.id}/items/${itemId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) throw new Error("Failed to update item");
      fetchSheet();
    } catch (error) {
      console.error("Error updating item:", error);
      alert("Failed to update item");
    }
  };

  const handleMarkPrepared = async () => {
    if (!sheet) return;

    try {
      setUpdating(true);
      const response = await fetch(
        `/api/admin/kitchen-sheets/${params.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prepared_at: new Date().toISOString() }),
        }
      );

      if (!response.ok) throw new Error("Failed to mark as prepared");
      fetchSheet();
    } catch (error) {
      console.error("Error marking as prepared:", error);
      alert("Failed to update kitchen sheet");
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!sheet) return;

    // Check if all items are prepared
    const allPrepared = sheet.kitchen_sheet_items?.every((item) => item.prepared);
    if (!allPrepared) {
      alert("Please mark all items as prepared before completing the sheet");
      return;
    }

    try {
      setUpdating(true);
      const response = await fetch(
        `/api/admin/kitchen-sheets/${params.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed_at: new Date().toISOString() }),
        }
      );

      if (!response.ok) throw new Error("Failed to mark as completed");
      fetchSheet();
    } catch (error) {
      console.error("Error marking as completed:", error);
      alert("Failed to update kitchen sheet");
    } finally {
      setUpdating(false);
    }
  };

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

  const allPrepared = sheet.kitchen_sheet_items?.every((item) => item.prepared);
  const isCompleted = !!sheet.completed_at;
  const isInProgress = !!sheet.prepared_at && !isCompleted;

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
              Kitchen Sheet
            </h1>
            <p className="text-neutral-600 mt-1">
              Order: {sheet.orders?.order_number || "N/A"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {!sheet.prepared_at && (
            <Button
              onClick={handleMarkPrepared}
              disabled={updating}
              variant="secondary"
            >
              Start Preparation
            </Button>
          )}
          {isInProgress && allPrepared && (
            <Button
              onClick={handleMarkCompleted}
              disabled={updating}
              className="flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Complete</span>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-primary-600" />
              <h2 className="font-display text-xl text-neutral-900">
                Items to Prepare
              </h2>
            </div>
            <div className="space-y-4">
              {sheet.kitchen_sheet_items && sheet.kitchen_sheet_items.length > 0 ? (
                sheet.kitchen_sheet_items.map((item) => (
                  <KitchenItemRow
                    key={item.id}
                    item={item}
                    onUpdate={(updates) => handleItemUpdate(item.id, updates)}
                    canEdit={!isCompleted}
                  />
                ))
              ) : (
                <p className="text-neutral-600">No items found</p>
              )}
            </div>
          </Card>

          {sheet.notes && (
            <Card>
              <h2 className="font-display text-xl text-neutral-900 mb-4">
                Notes
              </h2>
              <p className="text-sm text-neutral-700">{sheet.notes}</p>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <h2 className="font-display text-xl text-neutral-900 mb-4">
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

