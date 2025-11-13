"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { useToast } from "@/components/ui/ToastProvider";
import { ArrowLeft, Save, Trash2 } from "lucide-react";

interface Store {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  credit_limit: number;
  current_balance: number;
  is_active: boolean;
}

export default function EditStorePage() {
  const params = useParams();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [store, setStore] = useState<Store | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    credit_limit: '0',
    is_active: true,
  });

  const fetchStore = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/stores/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch store');
      }
      const data = await response.json();
      setStore(data.store);
      
      // Populate form with store data
      setFormData({
        name: data.store.name || '',
        email: data.store.email || '',
        phone: data.store.phone || '',
        address: data.store.address || '',
        city: data.store.city || '',
        state: data.store.state || '',
        zip_code: data.store.zip_code || '',
        credit_limit: data.store.credit_limit?.toString() || '0',
        is_active: data.store.is_active !== undefined ? data.store.is_active : true,
      });
    } catch (error: any) {
      console.error('Error fetching store:', error);
      showError(error.message || 'Failed to load store');
      router.push('/admin/stores');
    } finally {
      setLoading(false);
    }
  }, [params.id, router, showError]);

  useEffect(() => {
    if (params.id) {
      fetchStore();
    }
  }, [params.id, fetchStore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/stores/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          credit_limit: parseFloat(formData.credit_limit) || 0,
        }),
      });

      if (response.ok) {
        showSuccess('Store updated successfully!');
        router.push(`/admin/stores/${params.id}`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update store');
      }
    } catch (error: any) {
      console.error('Error updating store:', error);
      showError(error.message || 'Failed to update store. Please check all fields.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/stores/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showSuccess('Store deactivated successfully!');
        setDeleteDialogOpen(false);
        router.push('/admin/stores');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to deactivate store');
      }
    } catch (error: any) {
      console.error('Error deleting store:', error);
      showError(error.message || 'Failed to deactivate store');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  if (loading) {
    return <Loader text="Loading store..." fullScreen />;
  }

  if (!store) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-error-600">Store not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 glass rounded-premium hover:bg-white/35 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-primary-600" />
          </button>
          <div>
            <h1 className="font-bold text-3xl md:text-4xl font-body text-neutral-900 mb-2">
              Edit Store
            </h1>
            <p className="text-neutral-600 font-body text-base">
              Update store information
            </p>
          </div>
        </div>
        <Button
          variant="danger"
          onClick={handleDeleteClick}
          disabled={deleting}
          className="flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          <span>Deactivate Store</span>
        </Button>
      </div>

      <Card variant="glass-strong">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold font-body text-neutral-700 mb-2">
                Store Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 glass rounded-premium focus:shadow-glass-lg focus:bg-white/35 border border-white/50 text-sm font-body text-neutral-900 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold font-body text-neutral-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 glass rounded-premium focus:shadow-glass-lg focus:bg-white/35 border border-white/50 text-sm font-body text-neutral-900 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold font-body text-neutral-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 glass rounded-premium focus:shadow-glass-lg focus:bg-white/35 border border-white/50 text-sm font-body text-neutral-900 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold font-body text-neutral-700 mb-2">
                Credit Limit
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.credit_limit}
                onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                className="w-full px-4 py-3 glass rounded-premium focus:shadow-glass-lg focus:bg-white/35 border border-white/50 text-sm font-body text-neutral-900 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold font-body text-neutral-700 mb-2">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 glass rounded-premium focus:shadow-glass-lg focus:bg-white/35 border border-white/50 text-sm font-body text-neutral-900 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold font-body text-neutral-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-3 glass rounded-premium focus:shadow-glass-lg focus:bg-white/35 border border-white/50 text-sm font-body text-neutral-900 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold font-body text-neutral-700 mb-2">
                State
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-4 py-3 glass rounded-premium focus:shadow-glass-lg focus:bg-white/35 border border-white/50 text-sm font-body text-neutral-900 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold font-body text-neutral-700 mb-2">
                Zip Code
              </label>
              <input
                type="text"
                value={formData.zip_code}
                onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                className="w-full px-4 py-3 glass rounded-premium focus:shadow-glass-lg focus:bg-white/35 border border-white/50 text-sm font-body text-neutral-900 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-white/30">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5 text-primary-500 border-2 border-neutral-300 rounded focus:ring-2 focus:ring-primary-500"
            />
            <label htmlFor="is_active" className="text-sm font-semibold font-body text-neutral-700">
              Store is active
            </label>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/30">
            <Button
              type="button"
              variant="glass"
              onClick={() => router.back()}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </Button>
          </div>
        </form>
      </Card>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Deactivate Store"
        message={`Are you sure you want to deactivate "${store?.name}"? This will prevent new orders from being placed. You can reactivate it later.`}
        confirmText="Deactivate"
        cancelText="Cancel"
        variant="warning"
        isLoading={deleting}
      />
    </div>
  );
}

