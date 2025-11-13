"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { Search, ShoppingCart } from "lucide-react";
import { ProductCard } from "@/components/customer/ProductCard";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  unit: string;
  category: string | null;
  description: string | null;
  is_active: boolean;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();
      const activeProducts = (data.products || []).filter(
        (p: Product) => p.is_active
      );
      setProducts(activeProducts);

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(activeProducts.map((p: Product) => p.category).filter(Boolean))
      ) as string[];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-neutral-900">
            Product Catalog
          </h1>
          <p className="text-neutral-600 mt-2">
            Browse and add products to your order
          </p>
        </div>
        <Button onClick={() => router.push("/customer/orders/new")}>
          <ShoppingCart className="w-4 h-4 mr-2" />
          View Cart
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center space-x-2 bg-neutral-100 rounded-lg px-4 py-2">
            <Search className="w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm text-neutral-900 placeholder-neutral-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white text-neutral-900"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Products Grid */}
      {loading ? (
        <div className="py-12">
          <Loader text="Loading products..." />
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-neutral-600">
            No products found
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

