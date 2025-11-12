"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";

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

export default function StoreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchStore();
    }
  }, [params.id]);

  const fetchStore = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stores/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch store');
      }
      const data = await response.json();
      setStore(data.store);
    } catch (error) {
      console.error('Error fetching store:', error);
      alert('Failed to load store');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-neutral-600 dark:text-neutral-400">Loading store...</div>
      </div>
    );
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
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-neutral-900 dark:text-neutral-100">
              {store.name}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
              Store Details
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <OrderStatusBadge status={store.is_active ? 'active' : 'inactive'} />
          <Link href={`/admin/stores/${store.id}/edit`}>
            <Button variant="secondary" className="flex items-center space-x-2">
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="font-display text-xl text-neutral-900 dark:text-neutral-100 mb-4">
              Contact Information
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Email:</span>
                <p className="text-sm text-neutral-900 dark:text-neutral-100">{store.email}</p>
              </div>
              {store.phone && (
                <div>
                  <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Phone:</span>
                  <p className="text-sm text-neutral-900 dark:text-neutral-100">{store.phone}</p>
                </div>
              )}
              {store.address && (
                <div>
                  <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Address:</span>
                  <p className="text-sm text-neutral-900 dark:text-neutral-100">
                    {store.address}
                    {store.city && store.state && `, ${store.city}, ${store.state}`}
                    {store.zip_code && ` ${store.zip_code}`}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <h2 className="font-display text-xl text-neutral-900 dark:text-neutral-100 mb-4">
              Financial Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">Credit Limit:</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(store.credit_limit)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">Current Balance:</span>
                <span className={`font-semibold ${store.current_balance < 0 ? 'text-error-600' : 'text-neutral-900 dark:text-neutral-100'}`}>
                  {formatCurrency(store.current_balance)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">Available Credit:</span>
                <span className="font-semibold text-success-600">
                  {formatCurrency(store.credit_limit - store.current_balance)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  return status === 'active' ? (
    <Badge variant="success">Active</Badge>
  ) : (
    <Badge variant="error">Inactive</Badge>
  );
}

