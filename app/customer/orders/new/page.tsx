"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface CartItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  unit: string;
  quantity: number;
}

export default function NewOrderPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    const storedCart = sessionStorage.getItem("cart");
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }

    // Get store ID
    const fetchStoreId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("store_id")
        .eq("id", session.user.id)
        .single();

      if (profile?.store_id) {
        setStoreId(profile.store_id);
      }
    };

    fetchStoreId();
  }, []);

  const updateQuantity = (productId: string, delta: number) => {
    const updatedCart = cart.map((item) => {
      if (item.productId === productId) {
        const newQuantity = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter((item) => item.quantity > 0);

    setCart(updatedCart);
    sessionStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const removeItem = (productId: string) => {
    const updatedCart = cart.filter((item) => item.productId !== productId);
    setCart(updatedCart);
    sessionStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    if (!storeId) {
      alert("Store ID not found");
      return;
    }

    setLoading(true);

    try {
      const orderItems = cart.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }));

      const totalAmount = orderItems.reduce(
        (sum, item) => sum + item.total_price,
        0
      );

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_id: storeId,
          order_items: orderItems,
          notes: notes || null,
          total_amount: totalAmount,
          final_amount: totalAmount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create order");
      }

      const data = await response.json();
      sessionStorage.removeItem("cart");
      router.push(`/customer/orders/${data.order.id}`);
    } catch (error: any) {
      alert(error.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (cart.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-neutral-900">
            New Order
          </h1>
          <p className="text-neutral-600 mt-2">Create a new order</p>
        </div>
        <Card>
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-600 mb-4">Your cart is empty</p>
            <Button onClick={() => router.push("/customer/products")}>
              Browse Products
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-neutral-900">
          New Order
        </h1>
        <p className="text-neutral-600 mt-2">Review and submit your order</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="font-display text-xl text-neutral-900 mb-4">
              Order Items
            </h2>
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900">
                      {item.name}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      {item.sku} • {formatCurrency(item.price)} per {item.unit}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.productId, -1)}
                        className="p-1 hover:bg-neutral-200 rounded"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, 1)}
                        className="p-1 hover:bg-neutral-200 rounded"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="w-24 text-right font-semibold">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-error-600 hover:text-error-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-xl text-neutral-900 mb-4">
              Order Notes
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any special instructions or notes..."
              className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white text-neutral-900 min-h-[100px]"
            />
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
              <div className="border-t border-neutral-200 pt-3 flex justify-between">
                <span className="font-semibold text-neutral-900">Total:</span>
                <span className="font-bold text-lg text-primary-600">
                  {formatCurrency(subtotal)}
                </span>
              </div>
            </div>
            <Button
              onClick={handleSubmitOrder}
              disabled={loading}
              className="w-full mt-6"
            >
              {loading ? "Submitting..." : "Submit Order"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push("/customer/products")}
              className="w-full mt-3"
            >
              Continue Shopping
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

