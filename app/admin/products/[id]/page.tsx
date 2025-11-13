"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { ArrowLeft } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  price: number;
  cost: number | null;
  unit: string;
  category: string | null;
  is_active: boolean;
  min_stock_level: number;
  statistics?: {
    total_ordered: number;
    total_revenue: number;
    order_count: number;
    stores_with_stock: number;
    total_stock: number;
  };
  stock_by_store?: Array<{
    store_id: string;
    current_stock: number;
    stores: {
      id: string;
      name: string;
    };
  }>;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    price: '',
    cost: '',
    unit: 'unit',
    category: '',
    min_stock_level: '0',
    is_active: true,
  });

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/products/${params.id}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch product');
      }
      const data = await response.json();
      setProduct(data.product);
      setFormData({
        name: data.product.name,
        description: data.product.description || '',
        sku: data.product.sku,
        price: data.product.price.toString(),
        cost: data.product.cost?.toString() || '',
        unit: data.product.unit,
        category: data.product.category || '',
        min_stock_level: data.product.min_stock_level.toString(),
        is_active: data.product.is_active,
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id, fetchProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/products/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          cost: formData.cost ? parseFloat(formData.cost) : null,
          min_stock_level: parseInt(formData.min_stock_level),
        }),
      });

      if (response.ok) {
        router.push('/admin/products');
        alert('Product updated successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.details 
          ? Array.isArray(errorData.details) 
            ? errorData.details.join(', ') 
            : errorData.details
          : errorData.error || 'Failed to update product';
        alert(`Failed to update product: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader text="Loading product..." fullScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-700" />
        </button>
        <div>
          <h1 className="font-semibold text-3xl md:text-4xl font-body text-neutral-900 mb-2">
            Edit Product
          </h1>
          <p className="text-neutral-600 text-sm font-body">
            Update product information
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold font-body text-neutral-700 mb-2.5">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white text-neutral-900 font-body transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold font-body text-neutral-700 mb-2.5">
                SKU *
              </label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white text-neutral-900 font-body transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold font-body text-neutral-700 mb-2.5">
                Price *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white text-neutral-900 font-body transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold font-body text-neutral-700 mb-2.5">
                Cost
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white text-neutral-900 font-body transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold font-body text-neutral-700 mb-2.5">
                Unit
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white text-neutral-900 font-body transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold font-body text-neutral-700 mb-2.5">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white text-neutral-900 font-body transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold font-body text-neutral-700 mb-2.5">
                Minimum Stock Level
              </label>
              <input
                type="number"
                value={formData.min_stock_level}
                onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })}
                className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white text-neutral-900 font-body transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold font-body text-neutral-700 mb-2.5">
                Status
              </label>
              <select
                value={formData.is_active ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white text-neutral-900 font-body transition-all"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold font-body text-neutral-700 mb-2.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white text-neutral-900 font-body transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-neutral-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              className="px-6 py-2.5"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={saving}
              className="px-6 py-2.5 min-w-[140px]"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Product Statistics */}
      {product?.statistics && (
        <Card>
          <h2 className="font-semibold text-2xl font-body text-neutral-900 mb-6 pb-4 border-b border-neutral-200">
            Product Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="space-y-1">
              <p className="text-sm font-body text-neutral-600">Total Ordered</p>
              <p className="text-xl font-bold font-display text-neutral-900">
                {product.statistics.total_ordered.toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-body text-neutral-600">Total Revenue</p>
              <p className="text-xl font-bold font-display text-primary-600">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(product.statistics.total_revenue)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-body text-neutral-600">Order Count</p>
              <p className="text-xl font-bold font-display text-neutral-900">
                {product.statistics.order_count.toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-body text-neutral-600">Stores with Stock</p>
              <p className="text-xl font-bold font-display text-neutral-900">
                {product.statistics.stores_with_stock}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-body text-neutral-600">Total Stock</p>
              <p className="text-xl font-bold font-display text-neutral-900">
                {product.statistics.total_stock.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Stock by Store */}
      {product?.stock_by_store && product.stock_by_store.length > 0 && (
        <Card>
          <h2 className="font-semibold text-2xl font-body text-neutral-900 mb-6 pb-4 border-b border-neutral-200">
            Stock by Store
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">
                    Store
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700">
                    Current Stock
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {product.stock_by_store.map((stock) => (
                  <tr key={stock.store_id} className="border-b border-neutral-200">
                    <td className="py-3 px-4 text-sm text-neutral-900">
                      {stock.stores?.name || 'Unknown Store'}
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-900 text-right">
                      {stock.current_stock}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {stock.current_stock < (product.min_stock_level || 0) ? (
                        <span className="text-xs font-semibold text-error-600">Low Stock</span>
                      ) : stock.current_stock === 0 ? (
                        <span className="text-xs font-semibold text-error-600">Out of Stock</span>
                      ) : (
                        <span className="text-xs font-semibold text-success-600">In Stock</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

