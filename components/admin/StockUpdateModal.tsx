"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/FormInput";

interface StockItem {
  id: string;
  product_id: string;
  current_stock: number;
  products: {
    id: string;
    name: string;
    sku: string;
    min_stock_level: number;
    unit: string;
  } | null;
}

interface StockUpdateModalProps {
  product: StockItem;
  storeId: string;
  onUpdate: (productId: string, newStock: number) => void;
  onClose: () => void;
}

export function StockUpdateModal({
  product,
  storeId,
  onUpdate,
  onClose,
}: StockUpdateModalProps) {
  const [stockValue, setStockValue] = useState<string>(product.current_stock.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const newStock = parseInt(stockValue);
      if (isNaN(newStock) || newStock < 0) {
        throw new Error("Invalid stock value");
      }

      const response = await fetch(`/api/admin/stores/${storeId}/stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.product_id,
          current_stock: newStock,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update stock");
      }

      onUpdate(product.product_id, newStock);
    } catch (err: any) {
      setError(err.message || "Failed to update stock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Update Stock Level" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <p className="text-sm text-neutral-600 mb-2">
            <span className="font-semibold">Product:</span> {product.products?.name}
          </p>
          <p className="text-sm text-neutral-600 mb-4">
            <span className="font-semibold">SKU:</span> {product.products?.sku}
          </p>
        </div>

        <FormInput
          label="Current Stock Level"
          type="number"
          min="0"
          value={stockValue}
          onChange={(e) => setStockValue(e.target.value)}
          required
          helperText={`Unit: ${product.products?.unit || "units"}`}
        />

        <div className="flex items-center space-x-3 pt-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "Updating..." : "Update Stock"}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}

