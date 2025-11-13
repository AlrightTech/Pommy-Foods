"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { ArrowLeft } from "lucide-react";

export default function NewStorePage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    credit_limit: '0',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          credit_limit: parseFloat(formData.credit_limit) || 0,
        }),
      });

      if (response.ok) {
        showSuccess('Store created successfully!');
        router.push('/admin/stores');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create store');
      }
    } catch (error: any) {
      console.error('Error creating store:', error);
      showError(error.message || 'Failed to create store. Please check all required fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 glass rounded-premium hover:bg-white/35 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-primary-600" />
            </button>
        <div>
          <h1 className="font-bold text-3xl md:text-4xl font-body text-neutral-900 mb-2">
            Add New Store
          </h1>
          <p className="text-neutral-600 font-body text-base">
            Register a new convenience store or restaurant
          </p>
        </div>
      </div>

      <Card variant="glass-strong">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
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
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
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
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
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
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Credit Limit
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.credit_limit}
                onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                className="w-full px-4 py-3 glass rounded-premium focus:shadow-glass-lg focus:bg-white/35 border border-white/50 text-sm font-body text-neutral-900 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
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
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
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
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
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
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
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

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/30">
            <Button
              type="button"
              variant="glass"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex items-center gap-2">
              <span>{loading ? 'Creating...' : 'Create Store'}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

