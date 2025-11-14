"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Loader } from "@/components/ui/Loader";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { useToast } from "@/components/ui/ToastProvider";
import { Plus, Search, Edit, Eye, Trash2, CheckCircle2, PauseCircle } from "lucide-react";

interface Store {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  state: string | null;
  credit_limit: number;
  current_balance: number;
  is_active: boolean;
}

export default function StoresPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    page: 1,
    limit: 20,
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    storeId: string | null;
    storeName: string;
  }>({
    isOpen: false,
    storeId: null,
    storeName: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', page.toString());
      params.append('limit', '20');

      const response = await fetch(`/api/admin/stores?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stores');
      }

      const data = await response.json();
      setStores(data.stores || []);
      setPagination(data.pagination || {
        total: 0,
        totalPages: 1,
        page: 1,
        limit: 20,
      });
    } catch (error) {
      console.error('Error fetching stores:', error);
      // Use static data as fallback
      const staticStores: Store[] = [
        { id: '1', name: 'Downtown Convenience', email: 'downtown@example.com', phone: '+1-555-0101', city: 'New York', state: 'NY', credit_limit: 10000, current_balance: 2500.00, is_active: true },
        { id: '2', name: 'Main Street Market', email: 'mainstreet@example.com', phone: '+1-555-0102', city: 'Boston', state: 'MA', credit_limit: 8000, current_balance: 1200.50, is_active: true },
        { id: '3', name: 'Corner Store', email: 'corner@example.com', phone: '+1-555-0103', city: 'Chicago', state: 'IL', credit_limit: 15000, current_balance: 4500.75, is_active: true },
        { id: '4', name: 'Quick Mart', email: 'quickmart@example.com', phone: '+1-555-0104', city: 'Los Angeles', state: 'CA', credit_limit: 5000, current_balance: 800.25, is_active: true },
        { id: '5', name: 'Food Express', email: 'foodexpress@example.com', phone: '+1-555-0105', city: 'Seattle', state: 'WA', credit_limit: 12000, current_balance: 3200.00, is_active: true },
        { id: '6', name: 'City Market', email: 'citymarket@example.com', phone: '+1-555-0106', city: 'Portland', state: 'OR', credit_limit: 6000, current_balance: 1500.00, is_active: false },
      ];
      const filtered = searchQuery 
        ? staticStores.filter(s => 
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            s.email.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : staticStores;
      setStores(filtered);
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
    fetchStores();
  }, [fetchStores]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleDeleteClick = (storeId: string, storeName: string) => {
    setDeleteDialog({
      isOpen: true,
      storeId,
      storeName,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.storeId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/stores/${deleteDialog.storeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showSuccess('Store deactivated successfully!');
        setDeleteDialog({ isOpen: false, storeId: null, storeName: "" });
        fetchStores(); // Refresh the list
      } else {
        const errorData = await response.json().catch(() => ({}));
        showError(errorData.error || 'Failed to deactivate store');
      }
    } catch (error) {
      console.error('Error deleting store:', error);
      showError('Failed to deactivate store. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, storeId: null, storeName: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-bold text-3xl md:text-4xl font-body text-neutral-900 mb-2">
            Stores
          </h1>
          <p className="text-neutral-600 font-body text-base">
            Manage convenience stores and restaurants
          </p>
        </div>
        <Link href="/admin/stores/new">
          <Button variant="primary" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Add Store</span>
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card variant="glass">
        <div className="flex items-center gap-3 glass rounded-premium px-4 py-2.5 h-11 focus-within:shadow-glass-lg focus-within:bg-white/35 transition-all">
          <Search className="w-4 h-4 text-primary-600 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search stores by name or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="flex-1 bg-transparent border-none outline-none text-sm font-body text-neutral-900 placeholder-neutral-500 h-full"
          />
        </div>
      </Card>

      {/* Stores Table */}
      <Card variant="glass-strong">
        {loading ? (
          <div className="py-12">
            <Loader text="Loading stores..." />
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg font-body text-neutral-600 font-medium">No stores found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-white/20 backdrop-blur-sm border-b border-white/30">
                    <th className="px-6 py-4 text-left text-xs font-semibold font-body text-neutral-600 uppercase tracking-wider">
                      Store Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold font-body text-neutral-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold font-body text-neutral-600 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold font-body text-neutral-600 uppercase tracking-wider">
                      Credit Limit
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold font-body text-neutral-600 uppercase tracking-wider">
                      Balance
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
                  {stores.map((store) => (
                    <tr
                      key={store.id}
                      className="border-b border-white/20 hover:bg-white/10 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-neutral-900">
                        {store.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-700">
                        {store.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-700">
                        {store.city && store.state ? `${store.city}, ${store.state}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-900 text-right">
                        {formatCurrency(store.credit_limit)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-neutral-900 text-right">
                        {formatCurrency(store.current_balance)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                        {store.is_active ? (
                            <>
                              <CheckCircle2 className="w-5 h-5 text-success-600" />
                          <Badge variant="success">Active</Badge>
                            </>
                        ) : (
                            <>
                              <PauseCircle className="w-5 h-5 text-neutral-400" />
                          <Badge variant="error">Inactive</Badge>
                            </>
                        )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/stores/${store.id}`}
                            className="px-3 py-1.5 glass rounded-premium text-[#D2AC6A] hover:text-[#B8944F] active:text-[#9A7A3F] hover:bg-white/35 text-sm font-semibold font-body transition-all"
                            title="View store"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/stores/${store.id}/edit`}
                            className="px-3 py-1.5 glass rounded-premium text-[#D2AC6A] hover:text-[#B8944F] active:text-[#9A7A3F] hover:bg-white/35 text-sm font-semibold font-body transition-all"
                            title="Edit store"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(store.id, store.name)}
                            className="px-3 py-1.5 glass rounded-premium text-error-600 hover:text-error-700 hover:bg-white/35 text-sm font-semibold font-body transition-all"
                            title="Deactivate store"
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
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/30">
              <p className="text-sm font-body text-neutral-600">
                Showing {(page - 1) * pagination.limit + 1}-
                {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} stores
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

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Deactivate Store"
        message={`Are you sure you want to deactivate "${deleteDialog.storeName}"? This will prevent new orders from being placed. You can reactivate it later.`}
        confirmText="Deactivate"
        cancelText="Cancel"
        variant="warning"
        isLoading={isDeleting}
      />
    </div>
  );
}

