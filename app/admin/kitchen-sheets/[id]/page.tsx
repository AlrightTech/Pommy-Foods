"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { ArrowLeft, Package, CheckCircle2, QrCode, Calendar, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
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

  const [preparationStatus, setPreparationStatus] = useState<any>(null);
  const [groupedByCategory, setGroupedByCategory] = useState<Record<string, KitchenSheetItem[]>>({});
  const [groupedByExpiry, setGroupedByExpiry] = useState<Record<string, KitchenSheetItem[]>>({});
  const [barcodes, setBarcodes] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const fetchSheet = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/kitchen-sheets/${params.id}`);
      if (!response.ok) {
        setSheet(null);
        return;
      }

      const data = await response.json();
      const kitchenSheet = data.kitchenSheet || data.kitchen_sheet;
      setSheet(kitchenSheet);
      setPreparationStatus(kitchenSheet?.preparationStatus);
      setGroupedByCategory(kitchenSheet?.groupedByCategory || {});
      setGroupedByExpiry(kitchenSheet?.groupedByExpiry || {});

      // Fetch barcodes
      const barcodeResponse = await fetch(`/api/admin/kitchen-sheets/${params.id}/barcode`);
      if (barcodeResponse.ok) {
        const barcodeData = await barcodeResponse.json();
        setBarcodes(barcodeData.barcodes || []);
      }
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

  const handleMarkPrepared = async (itemIds: string[]) => {
    try {
      const response = await fetch(`/api/admin/kitchen-sheets/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark_prepared',
          item_ids: itemIds,
          prepared_by: 'admin', // TODO: Get from auth
        }),
      });

      if (response.ok) {
        await fetchSheet();
        setSelectedItems([]);
      }
    } catch (error) {
      console.error('Error marking items as prepared:', error);
    }
  };

  const handleGenerateBarcodes = async () => {
    try {
      const response = await fetch(`/api/admin/kitchen-sheets/${params.id}/barcode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setBarcodes(data.labels || []);
        await fetchSheet();
      }
    } catch (error) {
      console.error('Error generating barcodes:', error);
    }
  };

  const isCompleted = !!sheet.completed_at;
  const isInProgress = !!sheet.prepared_at && !isCompleted;
  const items = sheet.kitchen_sheet_items || [];
  const preparedCount = preparationStatus?.prepared || items.filter((i: KitchenSheetItem) => i.prepared).length;
  const totalCount = preparationStatus?.total || items.length;

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

      {/* Preparation Progress */}
      {preparationStatus && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Preparation Progress</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {preparedCount} / {totalCount} ({preparationStatus.percentage || 0}%)
              </p>
            </div>
            <div className="w-64 bg-neutral-200 rounded-full h-4">
              <div
                className="bg-primary h-4 rounded-full transition-all"
                style={{ width: `${preparationStatus.percentage || 0}%` }}
              />
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-xl font-body text-neutral-900">
                  Items to Prepare
                </h2>
              </div>
              <div className="flex gap-2">
                {selectedItems.length > 0 && (
                  <Button
                    variant="primary"
                    onClick={() => handleMarkPrepared(selectedItems)}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark Selected as Prepared
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={handleGenerateBarcodes}
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Generate Barcodes
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              {items.length > 0 ? (
                items.map((item) => {
                  const itemBarcode = barcodes.find((b: any) => b.kitchen_sheet_item_id === item.id);
                  const isSelected = selectedItems.includes(item.id);
                  
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        item.prepared 
                          ? "bg-success-50 border-success-200" 
                          : isSelected
                          ? "bg-primary-50 border-primary-300"
                          : "bg-neutral-50 border-neutral-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {!item.prepared && (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedItems([...selectedItems, item.id]);
                                  } else {
                                    setSelectedItems(selectedItems.filter(id => id !== item.id));
                                  }
                                }}
                                className="w-4 h-4 text-primary border-neutral-300 rounded"
                              />
                            )}
                            <h3 className="font-semibold text-neutral-900">
                              {item.products?.name || "Unknown Product"}
                            </h3>
                          </div>
                          <p className="text-xs text-neutral-600">
                            {item.products?.sku || "N/A"} • Quantity: {item.quantity}{" "}
                            {item.products?.unit || ""}
                          </p>
                          {item.batch_number && (
                            <p className="text-xs text-neutral-600 mt-1">
                              <span className="font-medium">Batch:</span> {item.batch_number}
                            </p>
                          )}
                          {item.expiry_date && (
                            <p className="text-xs text-neutral-600 mt-1">
                              <span className="font-medium">Expiry:</span> {format(new Date(item.expiry_date), "MMM dd, yyyy")}
                            </p>
                          )}
                          {itemBarcode && (
                            <div className="mt-2 p-2 bg-white rounded border border-neutral-200">
                              <p className="text-xs font-mono text-neutral-700">
                                Barcode: {itemBarcode.barcode}
                              </p>
                              {itemBarcode.printed && (
                                <p className="text-xs text-success-600 mt-1">✓ Printed</p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {item.prepared ? (
                            <span className="px-2 py-1 bg-success-100 text-success-700 text-xs rounded font-medium">
                              ✓ Prepared
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-warning-100 text-warning-700 text-xs rounded font-medium">
                              Pending
                            </span>
                          )}
                          {!item.prepared && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleMarkPrepared([item.id])}
                            >
                              Mark Prepared
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
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
              {preparationStatus && (
                <div>
                  <p className="text-xs text-neutral-500">Progress</p>
                  <p className="text-sm font-semibold text-primary">
                    {preparationStatus.prepared} / {preparationStatus.total} items
                  </p>
                </div>
              )}
            </div>
            {!isCompleted && preparedCount === totalCount && totalCount > 0 && (
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/admin/kitchen-sheets/${params.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'mark_completed' }),
                      });
                      if (response.ok) {
                        await fetchSheet();
                      }
                    } catch (error) {
                      console.error('Error marking sheet as completed:', error);
                    }
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark Sheet as Completed
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

