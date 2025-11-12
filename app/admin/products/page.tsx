"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Plus, Search, Edit, Trash2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  cost: number | null;
  unit: string;
  category: string | null;
  is_active: boolean;
  min_stock_level: number;
  description: string | null;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    fetchProducts();
  }, [page, searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', page.toString());
      params.append('limit', '20');

      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.products || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchProducts();
        alert('Product deleted successfully');
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-neutral-900 dark:text-neutral-100">
            Products
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Manage your product catalog
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <div className="flex items-center space-x-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg px-4 py-2">
          <Search className="w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="flex-1 bg-transparent border-none outline-none text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-500"
          />
        </div>
      </Card>

      {/* Products Table */}
      <Card>
        {loading ? (
          <div className="text-center py-8 text-neutral-600 dark:text-neutral-400">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-neutral-600 dark:text-neutral-400">
            No products found
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-neutral-100 dark:bg-neutral-800 border-b-2 border-neutral-200 dark:border-neutral-700">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                      SKU
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                      Category
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                      Price
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                      Min Stock
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-primary-600 dark:text-primary-400">
                        {product.sku}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-700 dark:text-neutral-300">
                        {product.category || 'Uncategorized'}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100 text-right">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-700 dark:text-neutral-300 text-right">
                        {product.min_stock_level}
                      </td>
                      <td className="px-6 py-4">
                        {product.is_active ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="error">Inactive</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-error-600 hover:text-error-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Showing {(page - 1) * pagination.limit + 1}-
                {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} products
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border-2 border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages}
                  className="px-4 py-2 border-2 border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

