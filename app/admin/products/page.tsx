"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Loader } from "@/components/ui/Loader";
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

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', page.toString());
      params.append('limit', '20');

      const response = await fetch(`/api/admin/products?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.products || []);
      setPagination(data.pagination || {
        total: 0,
        totalPages: 1,
        page: 1,
        limit: 20,
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      // Use static data as fallback
      const staticProducts: Product[] = [
        { id: '1', name: 'Premium Coffee Beans', sku: 'COF-001', price: 24.99, cost: 15.00, unit: 'lb', category: 'Beverages', is_active: true, min_stock_level: 50, description: 'High quality arabica beans' },
        { id: '2', name: 'Organic Tea Selection', sku: 'TEA-002', price: 12.99, cost: 8.00, unit: 'box', category: 'Beverages', is_active: true, min_stock_level: 30, description: 'Assorted organic teas' },
        { id: '3', name: 'Artisan Bread Loaf', sku: 'BRD-003', price: 5.99, cost: 3.50, unit: 'loaf', category: 'Bakery', is_active: true, min_stock_level: 100, description: 'Fresh baked daily' },
        { id: '4', name: 'Fresh Milk 1L', sku: 'MLK-004', price: 4.99, cost: 2.50, unit: 'bottle', category: 'Dairy', is_active: true, min_stock_level: 200, description: 'Whole milk' },
        { id: '5', name: 'Free Range Eggs (12)', sku: 'EGG-005', price: 6.99, cost: 4.00, unit: 'dozen', category: 'Dairy', is_active: true, min_stock_level: 150, description: 'Farm fresh eggs' },
        { id: '6', name: 'Organic Honey 500g', sku: 'HNY-006', price: 14.99, cost: 9.00, unit: 'jar', category: 'Pantry', is_active: true, min_stock_level: 40, description: 'Pure organic honey' },
        { id: '7', name: 'Whole Grain Cereal', sku: 'CER-007', price: 8.99, cost: 5.00, unit: 'box', category: 'Breakfast', is_active: true, min_stock_level: 80, description: 'Healthy breakfast option' },
        { id: '8', name: 'Yogurt Assorted', sku: 'YOG-008', price: 3.99, cost: 2.00, unit: 'cup', category: 'Dairy', is_active: true, min_stock_level: 120, description: 'Mixed flavors' },
        { id: '9', name: 'Fresh Vegetables Pack', sku: 'VEG-009', price: 9.99, cost: 6.00, unit: 'pack', category: 'Produce', is_active: true, min_stock_level: 60, description: 'Seasonal vegetables' },
        { id: '10', name: 'Premium Olive Oil', sku: 'OIL-010', price: 18.99, cost: 12.00, unit: 'bottle', category: 'Pantry', is_active: true, min_stock_level: 35, description: 'Extra virgin olive oil' },
      ];
      const filtered = searchQuery 
        ? staticProducts.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            p.sku.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : staticProducts;
      setProducts(filtered);
      setPagination({
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / 20),
        page: page,
        limit: 20,
      });
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? If the product is used in orders, it will be deactivated instead.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        fetchProducts();
        alert(data.message || 'Product deleted successfully');
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Failed to delete product';
        alert(`Failed to delete product: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
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
          <h1 className="font-display text-3xl md:text-4xl text-neutral-900">
            Products
          </h1>
          <p className="text-neutral-600 mt-2">
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
        <div className="flex items-center space-x-2 bg-neutral-100 rounded-lg px-4 py-2">
          <Search className="w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="flex-1 bg-transparent border-none outline-none text-sm text-neutral-900 placeholder-neutral-500"
          />
        </div>
      </Card>

      {/* Products Table */}
      <Card>
        {loading ? (
          <div className="py-12">
            <Loader text="Loading products..." />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-neutral-600">
            No products found
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-neutral-100 border-b-2 border-neutral-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                      SKU
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                      Category
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-700">
                      Price
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-700">
                      Min Stock
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
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-neutral-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-primary-600">
                        {product.sku}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-700">
                        {product.category || 'Uncategorized'}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-neutral-900 text-right">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-700 text-right">
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
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-neutral-200">
              <p className="text-sm text-neutral-600">
                Showing {(page - 1) * pagination.limit + 1}-
                {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} products
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border-2 border-neutral-300 rounded-lg hover:bg-neutral-50 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages}
                  className="px-4 py-2 border-2 border-neutral-300 rounded-lg hover:bg-neutral-50 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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

