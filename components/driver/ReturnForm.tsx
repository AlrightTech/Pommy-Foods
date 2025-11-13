"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface OrderItem {
  id: string;
  quantity: number;
  products: {
    id: string;
    name: string;
    sku: string;
  } | null;
}

interface ReturnFormProps {
  items: OrderItem[];
  onSubmit: (returns: Array<{ productId: string; quantity: number; reason: string }>) => void;
  onCancel: () => void;
  submitting: boolean;
}

export function ReturnForm({ items, onSubmit, onCancel, submitting }: ReturnFormProps) {
  const [returns, setReturns] = useState<Record<string, { quantity: number; reason: string }>>({});

  const handleQuantityChange = (productId: string, quantity: number) => {
    setReturns((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        quantity: Math.max(0, Math.min(quantity, items.find((i) => i.products?.id === productId)?.quantity || 0)),
        reason: prev[productId]?.reason || "",
      },
    }));
  };

  const handleReasonChange = (productId: string, reason: string) => {
    setReturns((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        quantity: prev[productId]?.quantity || 0,
        reason,
      },
    }));
  };

  const handleSubmit = () => {
    const returnItems = Object.entries(returns)
      .filter(([_, data]) => data.quantity > 0)
      .map(([productId, data]) => ({
        productId,
        quantity: data.quantity,
        reason: data.reason || "Expired",
      }));

    if (returnItems.length === 0) {
      alert("Please select at least one item to return");
      return;
    }

    onSubmit(returnItems);
  };

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const productId = item.products?.id || "";
        const returnData = returns[productId] || { quantity: 0, reason: "" };
        const maxQuantity = item.quantity;

        return (
          <Card key={item.id} className="p-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-neutral-900">
                  {item.products?.name || "Unknown Product"}
                </h3>
                <p className="text-xs text-neutral-600">
                  {item.products?.sku || "N/A"} • Available: {maxQuantity}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Return Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  max={maxQuantity}
                  value={returnData.quantity}
                  onChange={(e) => handleQuantityChange(productId, parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Reason (e.g., Expired)
                </label>
                <input
                  type="text"
                  value={returnData.reason}
                  onChange={(e) => handleReasonChange(productId, e.target.value)}
                  placeholder="Enter reason for return"
                  className="w-full px-4 py-2 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white text-neutral-900"
                />
              </div>
            </div>
          </Card>
        );
      })}

      <div className="flex items-center space-x-3 pt-4">
        <Button
          onClick={handleSubmit}
          disabled={submitting || Object.values(returns).every((r) => r.quantity === 0)}
          className="flex-1"
        >
          {submitting ? "Submitting..." : "Submit Returns"}
        </Button>
        <Button onClick={onCancel} variant="secondary" disabled={submitting}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

