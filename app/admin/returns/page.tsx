"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { Button } from "@/components/ui/Button";
import { 
  PackageX, 
  TrendingDown, 
  Filter,
  Download,
  Calendar,
  Store,
  Package
} from "lucide-react";
import { format } from "date-fns";

interface Return {
  id: string;
  quantity: number;
  reason: 'expired' | 'damaged' | 'unsold';
  returned_at: string;
  products: {
    id: string;
    name: string;
    sku: string;
    price: number;
  };
  deliveries: {
    orders: {
      order_number: string;
      stores: {
        id: string;
        name: string;
      };
    };
  };
}

interface ReturnsAnalytics {
  totalReturns: number;
  totalWastageValue: number;
  returnsByReason: Record<string, number>;
  returnsByProduct: Array<{
    product_id: string;
    name: string;
    quantity: number;
    value: number;
  }>;
}

export default function ReturnsPage() {
  const [returns, setReturns] = useState<Return[]>([]);
  const [analytics, setAnalytics] = useState<ReturnsAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    store_id: '',
    product_id: '',
    reason: '',
    start_date: '',
    end_date: '',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReturns = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (filters.store_id) params.append('store_id', filters.store_id);
      if (filters.product_id) params.append('product_id', filters.product_id);
      if (filters.reason) params.append('reason', filters.reason);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);

      const response = await fetch(`/api/admin/returns?${params}`);
      if (!response.ok) throw new Error('Failed to fetch returns');

      const data = await response.json();
      setReturns(data.returns || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching returns:', error);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);

      const response = await fetch(`/api/admin/analytics/returns?${params}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');

      const data = await response.json();
      setAnalytics({
        totalReturns: data.summary?.totalProducts || 0,
        totalWastageValue: data.summary?.totalWastageValue || 0,
        returnsByReason: data.wastageByReason?.reduce((acc: Record<string, number>, item: any) => {
          acc[item.reason] = item.quantity;
          return acc;
        }, {}) || {},
        returnsByProduct: data.topWastedProducts || [],
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }, [filters]);

  useEffect(() => {
    fetchReturns();
    fetchAnalytics();
  }, [page, filters, fetchReturns, fetchAnalytics]);

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'damaged':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'unsold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading && !returns.length) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Returns & Wastage</h1>
          <p className="text-neutral-600 mt-1">Track and manage product returns and wastage</p>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Returns</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">{analytics.totalReturns}</p>
              </div>
              <PackageX className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Wastage Value</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">
                  ${analytics.totalWastageValue.toFixed(2)}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Expired Items</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">
                  {analytics.returnsByReason.expired || 0}
                </p>
              </div>
              <Package className="w-8 h-8 text-red-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Damaged Items</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">
                  {analytics.returnsByReason.damaged || 0}
                </p>
              </div>
              <PackageX className="w-8 h-8 text-orange-500" />
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-600" />
            <span className="text-sm font-medium text-neutral-700">Filters:</span>
          </div>

          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
            className="px-3 py-2 border border-neutral-300 rounded-lg text-sm"
            placeholder="Start Date"
          />

          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
            className="px-3 py-2 border border-neutral-300 rounded-lg text-sm"
            placeholder="End Date"
          />

          <select
            value={filters.reason}
            onChange={(e) => setFilters({ ...filters, reason: e.target.value })}
            className="px-3 py-2 border border-neutral-300 rounded-lg text-sm"
          >
            <option value="">All Reasons</option>
            <option value="expired">Expired</option>
            <option value="damaged">Damaged</option>
            <option value="unsold">Unsold</option>
          </select>

          <Button
            variant="secondary"
            onClick={() => setFilters({ store_id: '', product_id: '', reason: '', start_date: '', end_date: '' })}
          >
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Top Wasted Products */}
      {analytics && analytics.returnsByProduct.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Top Wasted Products</h2>
          <div className="space-y-3">
            {analytics.returnsByProduct.slice(0, 5).map((product) => (
              <div key={product.product_id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div>
                  <p className="font-medium text-neutral-900">{product.name}</p>
                  <p className="text-sm text-neutral-600">Quantity: {product.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">${product.value.toFixed(2)}</p>
                  <p className="text-xs text-neutral-500">Wastage Value</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Returns Table */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-neutral-900">Recent Returns</h2>
        </div>

        {returns.length === 0 ? (
          <div className="text-center py-12">
            <PackageX className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600">No returns found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Product</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Store</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Quantity</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Reason</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Value</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((returnItem) => {
                  const product = returnItem.products;
                  const store = returnItem.deliveries?.orders?.stores;
                  const value = (returnItem.quantity || 0) * (product?.price || 0);

                  return (
                    <tr key={returnItem.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-neutral-900">{product?.name || 'Unknown'}</p>
                          <p className="text-xs text-neutral-500">{product?.sku || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-neutral-700">{store?.name || 'Unknown Store'}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-neutral-900">{returnItem.quantity}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getReasonColor(returnItem.reason)}`}>
                          {returnItem.reason}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-red-600">${value.toFixed(2)}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-neutral-600">
                          {format(new Date(returnItem.returned_at), 'MMM dd, yyyy')}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="secondary"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-neutral-600">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="secondary"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

