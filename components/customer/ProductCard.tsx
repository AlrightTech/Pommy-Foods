"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  unit: string;
  category: string | null;
  description: string | null;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleAddToCart = () => {
    // Store product in sessionStorage or use a cart context
    const cart = JSON.parse(sessionStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item: any) => item.productId === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        unit: product.unit,
        quantity: 1,
      });
    }

    sessionStorage.setItem("cart", JSON.stringify(cart));
    router.push("/customer/orders/new");
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="mb-4">
          <h3 className="font-display text-lg text-neutral-900 mb-1">
            {product.name}
          </h3>
          <p className="text-xs font-mono text-primary-600 mb-2">
            {product.sku}
          </p>
          {product.category && (
            <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">
              {product.category}
            </span>
          )}
        </div>

        {product.description && (
          <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-primary-600">
              {formatCurrency(product.price)}
            </p>
            <p className="text-xs text-neutral-500">per {product.unit}</p>
          </div>
          <Button onClick={handleAddToCart} size="sm">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
}

