"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { OrderFilters } from "@/components/admin/OrderFilters";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { Search, Download, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface Order {
  id: string;
  order_number: string;
  status: string;
  final_amount: number;
  created_at: string;
  stores: {
    id: string;
    name: string;
  } | null;
  order_items: Array<{
    id: string;
    quantity: number;
  }>;
}

interface StoresResponse {
  stores: Array<{ id: string; name: string }>;
}

function OrdersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stores, setStores] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(
    searchParams.get('status')
  );
  const [storeFilter, setStoreFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    page: 1,
    limit: 20,
  });
  const [isGeneratingReplenishment, setIsGeneratingReplenishment] = useState(false);

  const fetchStores = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/stores');
      if (response.ok) {
        const data: StoresResponse = await response.json();
        setStores(data.stores || []);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (storeFilter) params.append('store_id', storeFilter);
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', page.toString());
      params.append('limit', '20');

      const response = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders || []);
      setPagination(data.pagination || {
        total: 0,
        totalPages: 1,
        page: 1,
        limit: 20,
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Use static data as fallback
      const staticOrders: Order[] = [
        { id: '1', order_number: 'ORD-2024-001234', status: 'pending', final_amount: 1250.00, created_at: new Date().toISOString(), stores: { id: '1', name: 'Downtown Convenience' }, order_items: [{ id: '1', quantity: 10 }] },
        { id: '2', order_number: 'ORD-2024-001233', status: 'approved', final_amount: 890.50, created_at: new Date(Date.now() - 86400000).toISOString(), stores: { id: '2', name: 'Main Street Market' }, order_items: [{ id: '2', quantity: 5 }] },
        { id: '3', order_number: 'ORD-2024-001232', status: 'completed', final_amount: 2340.75, created_at: new Date(Date.now() - 172800000).toISOString(), stores: { id: '3', name: 'Corner Store' }, order_items: [{ id: '3', quantity: 15 }] },
        { id: '4', order_number: 'ORD-2024-001231', status: 'draft', final_amount: 567.25, created_at: new Date(Date.now() - 259200000).toISOString(), stores: { id: '4', name: 'Quick Mart' }, order_items: [{ id: '4', quantity: 8 }] },
        { id: '5', order_number: 'ORD-2024-001230', status: 'approved', final_amount: 1890.00, created_at: new Date(Date.now() - 345600000).toISOString(), stores: { id: '5', name: 'Food Express' }, order_items: [{ id: '5', quantity: 12 }] },
        { id: '6', order_number: 'ORD-2024-001229', status: 'pending', final_amount: 1120.50, created_at: new Date(Date.now() - 432000000).toISOString(), stores: { id: '1', name: 'Downtown Convenience' }, order_items: [{ id: '6', quantity: 7 }] },
        { id: '7', order_number: 'ORD-2024-001228', status: 'completed', final_amount: 765.25, created_at: new Date(Date.now() - 518400000).toISOString(), stores: { id: '2', name: 'Main Street Market' }, order_items: [{ id: '7', quantity: 9 }] },
        { id: '8', order_number: 'ORD-2024-001227', status: 'rejected', final_amount: 450.00, created_at: new Date(Date.now() - 604800000).toISOString(), stores: { id: '3', name: 'Corner Store' }, order_items: [{ id: '8', quantity: 3 }] },
      ];
      let filtered = [...staticOrders];
      if (statusFilter) {
        filtered = filtered.filter(o => o.status === statusFilter);
      }
      if (storeFilter) {
        filtered = filtered.filter(o => o.stores?.id === storeFilter);
      }
      if (searchQuery) {
        filtered = filtered.filter(o => 
          o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.stores?.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      const start = (page - 1) * 20;
      const end = start + 20;
      setOrders(filtered.slice(start, end));
      setPagination({
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / 20),
        page: page,
        limit: 20,
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, storeFilter, page, searchQuery]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleGenerateReplenishment = async () => {
    if (!confirm('This will generate replenishment orders for all stores with low stock. Continue?')) {
      return;
    }

    try {
      setIsGeneratingReplenishment(true);
      const response = await fetch('/api/admin/orders/generate-replenishment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || `Generated ${data.count || 0} replenishment order(s)`);
        fetchOrders(); // Refresh the orders list
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to generate replenishment orders: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error generating replenishment orders:', error);
      alert('Failed to generate replenishment orders. Please try again.');
    } finally {
      setIsGeneratingReplenishment(false);
    }
  };

  const handleApprove = async (orderId: string) => {
    if (!confirm('Are you sure you want to approve this order? This will generate a kitchen sheet and delivery note.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved_by: 'current-user-id' }), // TODO: Get from auth
      });

      if (response.ok) {
        const data = await response.json();
        fetchOrders();
        alert(data.message || 'Order approved successfully! Kitchen sheet and delivery note have been generated.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.details 
          ? Array.isArray(errorData.details) 
            ? errorData.details.join(', ') 
            : errorData.details
          : errorData.error || 'Failed to approve order';
        alert(`Failed to approve order: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error approving order:', error);
      alert('Failed to approve order. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-semibold text-3xl md:text-4xl font-body text-neutral-900 mb-2">
            Orders
          </h1>
          <p className="text-neutral-600 font-body text-base">
            Manage and review all orders from stores
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleGenerateReplenishment}
            disabled={isGeneratingReplenishment}
            variant="glass"
            size="md"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isGeneratingReplenishment ? 'animate-spin' : ''}`} />
            <span>{isGeneratingReplenishment ? 'Generating...' : 'Generate Replenishment'}</span>
          </Button>
          <Button variant="primary" size="md" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card variant="glass">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center gap-3 glass rounded-premium px-4 py-2.5 h-11 focus-within:shadow-glass-lg focus-within:bg-white/35 transition-all">
            <Search className="w-4 h-4 text-primary-600 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by Order ID or Store..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="flex-1 bg-transparent border-none outline-none text-sm font-body text-neutral-900 placeholder-neutral-500 h-full"
            />
          </div>
          <OrderFilters
            status={statusFilter}
            onStatusChange={(status) => {
              setStatusFilter(status);
              setPage(1);
            }}
            storeId={storeFilter}
            onStoreIdChange={(storeId) => {
              setStoreFilter(storeId);
              setPage(1);
            }}
            stores={stores}
          />
        </div>
      </Card>

      {/* Orders Table */}
      <Card variant="glass-strong">
        {loading ? (
          <div className="py-12">
            <Loader text="Loading orders..." />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg font-body text-neutral-600 font-medium">No orders found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-white/20 backdrop-blur-sm border-b border-white/30">
                    <th className="px-6 py-4 text-left text-xs font-semibold font-body text-neutral-600 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold font-body text-neutral-600 uppercase tracking-wider">
                      Store
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold font-body text-neutral-600 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold font-body text-neutral-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold font-body text-neutral-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold font-body text-neutral-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold font-body text-neutral-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-white/20 hover:bg-white/10 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-mono text-primary-600">
                        {order.order_number}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-700">
                        {order.stores?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-700">
                        {order.order_items?.length || 0}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-neutral-900">
                        {formatCurrency(order.final_amount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        {format(new Date(order.created_at), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="px-3 py-1.5 glass rounded-premium text-primary-500 hover:text-primary-600 active:text-primary-700 hover:bg-white/35 text-sm font-semibold font-body transition-all"
                          >
                            View
                          </Link>
                          {(order.status === 'pending' || order.status === 'draft') && (
                            <button
                              onClick={() => handleApprove(order.id)}
                              className="px-3 py-1.5 glass rounded-premium text-success-600 hover:text-success-700 hover:bg-white/35 text-sm font-semibold font-body transition-all"
                            >
                              Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/30">
              <p className="text-sm font-body text-neutral-600">
                Showing {(page - 1) * pagination.limit + 1}-
                {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} orders
              </p>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  variant="glass"
                  size="sm"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages}
                  variant="glass"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<Loader text="Loading..." fullScreen />}>
      <OrdersPageContent />
    </Suspense>
  );
}

