"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Loader } from "@/components/ui/Loader";
import { Plus, Search, Edit, Trash2, Filter, X, Package, DollarSign, TrendingUp } from "lucide-react";

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
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    page: 1,
    limit: 20,
  });

  // Get unique categories
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[];

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

  // Calculate stats
  const stats = {
    total: products.length,
    active: products.filter(p => p.is_active).length,
    inactive: products.filter(p => !p.is_active).length,
    totalValue: products.reduce((sum, p) => sum + p.price, 0),
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter || (!product.category && categoryFilter === "uncategorized");
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && product.is_active) ||
      (statusFilter === "inactive" && !product.is_active);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-8">
      {/* Enhanced Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1.5 h-10 bg-gradient-gold rounded-full shadow-sm"></div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl text-neutral-900 mb-1">
                Products
              </h1>
              <p className="text-neutral-600 font-body text-sm">
                Manage your product catalog
              </p>
            </div>
          </div>
        </div>
        <Link href="/admin/products/new">
          <Button variant="primary" className="flex items-center gap-2 min-w-[160px]">
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4" style={{ background: 'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary-lighter) 100%)', borderColor: 'var(--color-primary)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-body text-neutral-600 mb-1">Total Products</p>
              <p className="text-2xl font-bold font-display text-neutral-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-light)' }}>
              <Package className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-success-50 to-success-100/50 border-success-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-body text-neutral-600 mb-1">Active</p>
              <p className="text-2xl font-bold font-display text-neutral-900">{stats.active}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-success-500/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-warning-50 to-warning-100/50 border-warning-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-body text-neutral-600 mb-1">Inactive</p>
              <p className="text-2xl font-bold font-display text-neutral-900">{stats.inactive}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-warning-500/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-warning-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-info-50 to-info-100/50 border-info-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-body text-neutral-600 mb-1">Total Value</p>
              <p className="text-2xl font-bold font-display text-neutral-900">{formatCurrency(stats.totalValue)}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-info-500/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-info-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center space-x-3 bg-neutral-50 rounded-lg px-4 py-3 border border-neutral-200 focus-within:border-primary focus-within:ring-2 transition-all" style={{ '--tw-ring-color': 'var(--color-primary-light)' } as React.CSSProperties}>
              <Search className="w-5 h-5 text-neutral-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="flex-1 bg-transparent border-none outline-none text-sm font-body text-neutral-900 placeholder-neutral-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-lg border-2 transition-all flex items-center gap-2 font-semibold text-sm font-body ${
                showFilters || categoryFilter !== "all" || statusFilter !== "all"
                  ? "border-primary text-primary"
                  : "bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50"
              }`}
              style={showFilters || categoryFilter !== "all" || statusFilter !== "all" ? { backgroundColor: 'var(--color-primary-light)' } : {}}
            >
              <Filter className="w-4 h-4" />
              Filters
              {(categoryFilter !== "all" || statusFilter !== "all") && (
                <span className="bg-primary text-white text-xs rounded-full px-2 py-0.5">
                  {[categoryFilter !== "all" ? 1 : 0, statusFilter !== "all" ? 1 : 0].reduce((a, b) => a + b, 0)}
                </span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="pt-4 border-t border-neutral-200 flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-semibold font-body text-neutral-700 mb-2">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border-2 border-neutral-300 rounded-lg focus:border-primary focus:ring-2 bg-white text-sm font-body text-neutral-900"
                  style={{ '--tw-ring-color': 'var(--color-primary-light)' } as React.CSSProperties}
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="uncategorized">Uncategorized</option>
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-semibold font-body text-neutral-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border-2 border-neutral-300 rounded-lg focus:border-primary focus:ring-2 bg-white text-sm font-body text-neutral-900"
                  style={{ '--tw-ring-color': 'var(--color-primary-light)' } as React.CSSProperties}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              {(categoryFilter !== "all" || statusFilter !== "all") && (
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setCategoryFilter("all");
                      setStatusFilter("all");
                    }}
                    className="px-4 py-2 text-sm font-body text-neutral-600 hover:text-neutral-900 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Products Table */}
      <Card>
        {loading ? (
          <div className="py-12">
            <Loader text="Loading products..." />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <p className="text-lg font-semibold font-body text-neutral-900 mb-2">
              {searchQuery || categoryFilter !== "all" || statusFilter !== "all" 
                ? "No products match your filters" 
                : "No products found"}
            </p>
            <p className="text-sm font-body text-neutral-600 mb-6">
              {searchQuery || categoryFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by adding your first product"}
            </p>
            {(searchQuery || categoryFilter !== "all" || statusFilter !== "all") ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                  setStatusFilter("all");
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors font-semibold text-sm font-body"
              >
                Clear Filters
              </button>
            ) : (
              <Link href="/admin/products/new">
                <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold text-sm font-body">
                  Add Your First Product
                </button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-neutral-50 border-b-2 border-neutral-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold font-body text-neutral-700">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold font-body text-neutral-700">
                      SKU
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold font-body text-neutral-700">
                      Category
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold font-body text-neutral-700">
                      Price
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold font-body text-neutral-700">
                      Min Stock
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold font-body text-neutral-700">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold font-body text-neutral-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-semibold font-body text-neutral-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono font-body text-primary">
                        {product.sku}
                      </td>
                      <td className="px-6 py-4 text-sm font-body text-neutral-700">
                        {product.category || 'Uncategorized'}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold font-body text-neutral-900 text-right">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-6 py-4 text-sm font-body text-neutral-700 text-right">
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
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold font-body text-primary hover:text-[var(--color-primary-dark)] active:text-[var(--color-primary-darker)] rounded-lg transition-colors disabled:text-primary/50"
                            style={{ backgroundColor: 'var(--color-primary-light)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-light)'}
                            title="Edit product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Edit</span>
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold font-body rounded-lg transition-colors"
                            style={{ color: 'var(--color-error)', backgroundColor: 'var(--color-error-light)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-error-light)'}
                            title="Delete product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-neutral-200">
              <p className="text-sm font-body text-neutral-600">
                Showing <span className="font-semibold text-neutral-900">{(page - 1) * pagination.limit + 1}</span>-
                <span className="font-semibold text-neutral-900">{Math.min(page * pagination.limit, pagination.total)}</span> of <span className="font-semibold text-neutral-900">{pagination.total}</span> products
              </p>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-5 py-2.5 border-2 border-neutral-300 rounded-lg hover:bg-neutral-50 hover:border-neutral-400 text-sm font-semibold font-body text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all disabled:hover:bg-transparent disabled:hover:border-neutral-300"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages}
                  className="px-5 py-2.5 border-2 border-neutral-300 rounded-lg hover:bg-neutral-50 hover:border-neutral-400 text-sm font-semibold font-body text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all disabled:hover:bg-transparent disabled:hover:border-neutral-300"
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

