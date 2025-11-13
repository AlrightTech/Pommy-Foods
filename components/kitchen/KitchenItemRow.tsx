"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Circle } from "lucide-react";
import { BatchEntryForm } from "@/components/kitchen/BatchEntryForm";

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

interface KitchenItemRowProps {
  item: KitchenSheetItem;
  onUpdate: (updates: any) => void;
  canEdit: boolean;
}

export function KitchenItemRow({
  item,
  onUpdate,
  canEdit,
}: KitchenItemRowProps) {
  const [showBatchForm, setShowBatchForm] = useState(false);

  const handleMarkPrepared = () => {
    onUpdate({ prepared: true });
  };

  const handleBatchUpdate = (batchNumber: string, expiryDate: string) => {
    onUpdate({
      batch_number: batchNumber,
      expiry_date: expiryDate,
    });
    setShowBatchForm(false);
  };

  return (
    <Card className={item.prepared ? "bg-success-50 border-success-200" : ""}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              {item.prepared ? (
                <CheckCircle2 className="w-5 h-5 text-success-600" />
              ) : (
                <Circle className="w-5 h-5 text-neutral-400" />
              )}
              <div>
                <h3 className="font-semibold text-neutral-900">
                  {item.products?.name || "Unknown Product"}
                </h3>
                <p className="text-xs text-neutral-600">
                  {item.products?.sku || "N/A"} • Quantity: {item.quantity}{" "}
                  {item.products?.unit || ""}
                </p>
              </div>
            </div>

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

          {canEdit && (
            <div className="flex items-center space-x-2">
              {!item.prepared && (
                <>
                  <Button
                    onClick={() => setShowBatchForm(true)}
                    variant="secondary"
                    size="sm"
                  >
                    Add Batch
                  </Button>
                  <Button onClick={handleMarkPrepared} size="sm">
                    Mark Prepared
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {showBatchForm && (
        <BatchEntryForm
          item={item}
          onSave={handleBatchUpdate}
          onClose={() => setShowBatchForm(false)}
        />
      )}
    </Card>
  );
}

