"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2, Minus } from "lucide-react";

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  products: {
    id: string;
    name: string;
    sku: string;
    price: number;
    unit: string;
  } | null;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  order_items: OrderItem[];
}

interface OrderModifyFormProps {
  order: Order;
  onSave: (items: OrderItem[]) => void;
  onCancel: () => void;
  saving: boolean;
}

export function OrderModifyForm({
  order,
  onSave,
  onCancel,
  saving,
}: OrderModifyFormProps) {
  const [items, setItems] = useState<OrderItem[]>(order.order_items);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProductId, setNewProductId] = useState("");
  const [newProductQuantity, setNewProductQuantity] = useState(1);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (response.ok) {
          const data = await response.json();
          setAvailableProducts(data.products || []);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  const updateQuantity = (itemId: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newQuantity = Math.max(0, item.quantity + delta);
          return {
            ...item,
            quantity: newQuantity,
            total_price: newQuantity * item.unit_price,
          };
        }
        return item;
      })
    );
  };

  const updatePrice = (itemId: string, newPrice: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            unit_price: newPrice,
            total_price: newPrice * item.quantity,
          };
        }
        return item;
      })
    );
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const addProduct = () => {
    if (!newProductId || newProductQuantity <= 0) return;

    const product = availableProducts.find((p) => p.id === newProductId);
    if (!product) return;

    const newItem: OrderItem = {
      id: `new-${Date.now()}`,
      product_id: product.id,
      quantity: newProductQuantity,
      unit_price: product.price,
      total_price: product.price * newProductQuantity,
      products: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        unit: product.unit,
      },
    };

    setItems((prev) => [...prev, newItem]);
    setNewProductId("");
    setNewProductQuantity(1);
    setShowAddProduct(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
  const discount = order.discount_amount;
  const total = subtotal - discount;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-neutral-900">
              Order Items
            </h2>
            {!showAddProduct && (
              <Button
                onClick={() => setShowAddProduct(true)}
                variant="secondary"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            )}
          </div>

          {showAddProduct && (
            <Card className="mb-4 p-4 bg-neutral-50">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Product
                  </label>
                  <select
                    value={newProductId}
                    onChange={(e) => setNewProductId(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white text-neutral-900"
                  >
                    <option value="">Select a product</option>
                    {availableProducts
                      .filter((p) => p.is_active)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku}) - {formatCurrency(p.price)}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newProductQuantity}
                    onChange={(e) =>
                      setNewProductQuantity(parseInt(e.target.value) || 1)
                    }
                    className="w-full px-4 py-2 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white text-neutral-900"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button onClick={addProduct} size="sm">
                    Add
                  </Button>
                  <Button
                    onClick={() => {
                      setShowAddProduct(false);
                      setNewProductId("");
                      setNewProductQuantity(1);
                    }}
                    variant="secondary"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900">
                      {item.products?.name || "Unknown Product"}
                    </h3>
                    <p className="text-xs text-neutral-600">
                      {item.products?.sku || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 hover:bg-neutral-200 rounded"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 hover:bg-neutral-200 rounded"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unit_price}
                        onChange={(e) =>
                          updatePrice(item.id, parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-2 py-1 border border-neutral-300 rounded text-sm"
                      />
                    </div>
                    <div className="w-24 text-right">
                      <p className="font-semibold">
                        {formatCurrency(item.total_price)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-error-600 hover:text-error-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <Card>
          <h2 className="font-display text-xl text-neutral-900 mb-4">
            Order Summary
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Subtotal:</span>
              <span className="font-semibold text-neutral-900">
                {formatCurrency(subtotal)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Discount:</span>
                <span className="font-semibold text-success-600">
                  -{formatCurrency(discount)}
                </span>
              </div>
            )}
            <div className="border-t border-neutral-200 pt-3 flex justify-between">
              <span className="font-semibold text-neutral-900">Total:</span>
              <span className="font-bold text-lg text-primary-600">
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 mt-6">
            <Button
              onClick={() => onSave(items)}
              disabled={saving || items.length === 0}
              className="flex-1"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button onClick={onCancel} variant="secondary" disabled={saving}>
              Cancel
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

