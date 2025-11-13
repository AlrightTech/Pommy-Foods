"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";

interface OrderFiltersProps {
  status: string | null;
  onStatusChange: (status: string | null) => void;
  storeId: string | null;
  onStoreIdChange: (storeId: string | null) => void;
  stores: Array<{ id: string; name: string }>;
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  status,
  onStatusChange,
  storeId,
  onStoreIdChange,
  stores,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const hasActiveFilters = status || storeId;

  const clearFilters = () => {
    onStatusChange(null);
    onStoreIdChange(null);
  };

  return (
    <div className="relative">
      <Button
        variant="glass"
        onClick={() => setIsOpen(!isOpen)}
        size="md"
        className="flex items-center gap-2 h-11"
      >
        <span>Filter</span>
        {hasActiveFilters && (
          <span className="bg-primary-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">
            {[status, storeId].filter(Boolean).length}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <Card variant="glass-strong" className="absolute top-full mt-2 right-0 z-50 w-80 shadow-glass-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg text-neutral-900">
                Filters
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Status
                </label>
                <select
                  value={status || ''}
                  onChange={(e) => onStatusChange(e.target.value || null)}
                  className="w-full px-4 py-2.5 glass rounded-premium focus:shadow-glass-lg focus:bg-white/35 border border-white/50 text-sm font-body text-neutral-900 transition-all"
                >
                  <option value="">All Statuses</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Store
                </label>
                <select
                  value={storeId || ''}
                  onChange={(e) => onStoreIdChange(e.target.value || null)}
                  className="w-full px-4 py-2.5 glass rounded-premium focus:shadow-glass-lg focus:bg-white/35 border border-white/50 text-sm font-body text-neutral-900 transition-all"
                >
                  <option value="">All Stores</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="glass"
                  onClick={clearFilters}
                  className="w-full"
                  size="md"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

