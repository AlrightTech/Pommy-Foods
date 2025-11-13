"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

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

interface StockUpdateFormProps {
  product: StockItem | null;
  storeId: string | null;
  onUpdate: (productId: string, newStock: number) => void;
  onClose: () => void;
}

export function StockUpdateForm({
  product,
  storeId,
  onUpdate,
  onClose,
}: StockUpdateFormProps) {
  const [stockValue, setStockValue] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [isBulkUpdate, setIsBulkUpdate] = useState(false);

  useEffect(() => {
    if (product) {
      setStockValue(product.current_stock.toString());
      setSelectedProductId(product.product_id);
      setIsBulkUpdate(false);
    } else {
      // Bulk update mode - fetch all products
      fetchAllProducts();
      setIsBulkUpdate(true);
    }
  }, [product]);

  const fetchAllProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, sku")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setAllProducts(data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!storeId) {
        throw new Error("Store ID not found");
      }

      const productId = isBulkUpdate ? selectedProductId : product?.product_id;
      if (!productId) {
        throw new Error("Product not selected");
      }

      const newStock = parseInt(stockValue);
      if (isNaN(newStock) || newStock < 0) {
        throw new Error("Invalid stock value");
      }

      // Update stock in database
      const { data: existingStock } = await supabase
        .from("store_stock")
        .select("id")
        .eq("store_id", storeId)
        .eq("product_id", productId)
        .single();

      if (existingStock) {
        // Update existing stock
        const { error: updateError } = await supabase
          .from("store_stock")
          .update({ current_stock: newStock })
          .eq("id", existingStock.id);

        if (updateError) throw updateError;
      } else {
        // Create new stock entry
        const { error: insertError } = await supabase
          .from("store_stock")
          .insert({
            store_id: storeId,
            product_id: productId,
            current_stock: newStock,
          });

        if (insertError) throw insertError;
      }

      // Trigger replenishment check via API
      try {
        await fetch("/api/admin/orders/generate-replenishment", {
          method: "POST",
        });
      } catch (err) {
        // Non-critical - just log
        console.log("Replenishment check failed:", err);
      }

      onUpdate(productId, newStock);
    } catch (err: any) {
      setError(err.message || "Failed to update stock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl text-neutral-900">
            {isBulkUpdate ? "Bulk Stock Update" : "Update Stock Level"}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {isBulkUpdate && (
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Product
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white text-neutral-900"
              >
                <option value="">Select a product</option>
                {allProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>
          )}

          {!isBulkUpdate && product && (
            <div>
              <p className="text-sm text-neutral-600 mb-2">
                <span className="font-semibold">Product:</span> {product.products?.name}
              </p>
              <p className="text-sm text-neutral-600 mb-2">
                <span className="font-semibold">SKU:</span> {product.products?.sku}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Current Stock Level
            </label>
            <input
              type="number"
              value={stockValue}
              onChange={(e) => setStockValue(e.target.value)}
              required
              min="0"
              className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white text-neutral-900"
              placeholder="Enter stock level"
            />
            {!isBulkUpdate && product && (
              <p className="text-xs text-neutral-500 mt-1">
                Unit: {product.products?.unit || "units"}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <Button
              type="submit"
              disabled={loading || !stockValue}
              className="flex-1"
            >
              {loading ? "Updating..." : "Update Stock"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

