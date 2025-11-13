"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Loader } from "@/components/ui/Loader";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { StockUpdateModal } from "@/components/admin/StockUpdateModal";

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

interface StockManagementTableProps {
  storeId: string;
}

export function StockManagementTable({ storeId }: StockManagementTableProps) {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<StockItem | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const fetchStock = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/stores/${storeId}/stock`);
      if (!response.ok) throw new Error("Failed to fetch stock");

      const data = await response.json();
      setStockItems(data.stock || []);
    } catch (error) {
      console.error("Error fetching stock:", error);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  const handleUpdate = (productId: string, newStock: number) => {
    setStockItems((prev) =>
      prev.map((item) =>
        item.product_id === productId
          ? { ...item, current_stock: newStock }
          : item
      )
    );
    setShowUpdateModal(false);
    setSelectedProduct(null);
    fetchStock();
  };

  const handleTriggerReplenishment = async () => {
    try {
      const response = await fetch("/api/admin/orders/generate-replenishment", {
        method: "POST",
      });
      if (response.ok) {
        alert("Replenishment check triggered");
      }
    } catch (error) {
      console.error("Error triggering replenishment:", error);
    }
  };

  const lowStockItems = stockItems.filter((item) => {
    const minLevel = item.products?.min_stock_level || 0;
    return item.current_stock < minLevel;
  });

  if (loading) {
    return (
      <div className="py-12">
        <Loader text="Loading stock levels..." />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        {lowStockItems.length > 0 && (
          <Card className="bg-warning-50 border-warning-200 flex-1 mr-4">
            <div className="flex items-center space-x-3 p-4">
              <AlertTriangle className="w-5 h-5 text-warning-600" />
              <div>
                <h3 className="font-semibold text-warning-900">
                  Low Stock Alert
                </h3>
                <p className="text-sm text-warning-700">
                  {lowStockItems.length} product{lowStockItems.length !== 1 ? "s" : ""} below minimum stock level
                </p>
              </div>
            </div>
          </Card>
        )}
        <Button
          onClick={handleTriggerReplenishment}
          variant="secondary"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Check Replenishment
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-neutral-100 border-b-2 border-neutral-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                  SKU
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-700">
                  Current Stock
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-700">
                  Min Level
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {stockItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-neutral-600">
                    No stock items found
                  </td>
                </tr>
              ) : (
                stockItems.map((item) => {
                  const minLevel = item.products?.min_stock_level || 0;
                  const isLowStock = item.current_stock < minLevel;

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-neutral-900">
                        {item.products?.name || "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-primary-600">
                        {item.products?.sku || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-900 text-right">
                        {item.current_stock} {item.products?.unit || ""}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600 text-right">
                        {minLevel} {item.products?.unit || ""}
                      </td>
                      <td className="px-6 py-4">
                        {isLowStock ? (
                          <Badge variant="error">Low Stock</Badge>
                        ) : (
                          <Badge variant="success">In Stock</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedProduct(item);
                            setShowUpdateModal(true);
                          }}
                          className="text-primary-600 hover:text-primary-700 text-sm font-semibold"
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showUpdateModal && selectedProduct && (
        <StockUpdateModal
          product={selectedProduct}
          storeId={storeId}
          onUpdate={handleUpdate}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </>
  );
}

