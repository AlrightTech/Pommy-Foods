"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Loader } from "@/components/ui/Loader";
import { Search, AlertTriangle, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { StockUpdateForm } from "@/components/customer/StockUpdateForm";

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

export default function StockPage() {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [storeId, setStoreId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<StockItem | null>(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  const fetchStock = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("store_id")
        .eq("id", session.user.id)
        .single();

      if (!profile?.store_id) return;
      setStoreId(profile.store_id);

      // Use the new API endpoint
      const response = await fetch(`/api/stores/${profile.store_id}/stock`);
      if (!response.ok) throw new Error("Failed to fetch stock");

      const data = await response.json();
      // Transform data to match interface
      const transformedData = (data.stock || []).map((item: any) => ({
        id: item.id || `${item.product_id}-${profile.store_id}`,
        product_id: item.product_id,
        current_stock: item.current_stock || 0,
        products: item.products || null,
      }));
      setStockItems(transformedData);
    } catch (error) {
      console.error("Error fetching stock:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  const handleUpdateStock = (productId: string, newStock: number) => {
    setStockItems((prev) =>
      prev.map((item) =>
        item.product_id === productId
          ? { ...item, current_stock: newStock }
          : item
      )
    );
    setShowUpdateForm(false);
    setSelectedProduct(null);
    fetchStock();
  };

  const filteredItems = stockItems.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.products?.name.toLowerCase().includes(query) ||
      item.products?.sku.toLowerCase().includes(query)
    );
  });

  const lowStockItems = filteredItems.filter((item) => {
    const minLevel = item.products?.min_stock_level || 0;
    return item.current_stock < minLevel;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-neutral-900">
            Stock Management
          </h1>
          <p className="text-neutral-600 mt-2">
            View and update your Pommy product stock levels
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedProduct(null);
            setShowUpdateForm(true);
          }}
          variant="secondary"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Bulk Update
        </Button>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="bg-warning-50 border-warning-200">
          <div className="flex items-center space-x-3">
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

      {/* Search */}
      <Card>
        <div className="flex items-center space-x-2 bg-neutral-100 rounded-lg px-4 py-2">
          <Search className="w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-neutral-900 placeholder-neutral-500"
          />
        </div>
      </Card>

      {/* Stock Table */}
      <Card>
        {loading ? (
          <div className="py-12">
            <Loader text="Loading stock levels..." />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-8 text-neutral-600">
            No stock items found
          </div>
        ) : (
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
                {filteredItems.map((item) => {
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
                            setShowUpdateForm(true);
                          }}
                          className="text-primary-600 hover:text-primary-700 text-sm font-semibold"
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Stock Update Form Modal */}
      {showUpdateForm && (
        <StockUpdateForm
          product={selectedProduct}
          storeId={storeId}
          onUpdate={handleUpdateStock}
          onClose={() => {
            setShowUpdateForm(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}

