"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Loader } from "@/components/ui/Loader";
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

  const fetchStore = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/stores/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch store');
      }
      const data = await response.json();
      setStore(data.store);
    } catch (error: any) {
      console.error('Error fetching store:', error);
      alert(error.message || 'Failed to load store');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchStore();
    }
  }, [params.id, fetchStore]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
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
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 glass rounded-premium hover:bg-white/35 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-primary-600" />
          </button>
          <div>
            <h1 className="font-bold text-3xl md:text-4xl font-body text-neutral-900 mb-2">
              {store.name}
            </h1>
            <p className="text-neutral-600 font-body text-base">
              Store Details
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={store.is_active ? "success" : "error"}>
            {store.is_active ? "Active" : "Inactive"}
          </Badge>
          <Link href={`/admin/stores/${store.id}/edit`}>
            <Button variant="glass" className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card variant="glass-strong">
            <h2 className="font-bold text-xl font-body text-neutral-900 mb-4">
              Contact Information
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-semibold text-neutral-700">Email:</span>
                <p className="text-sm text-neutral-900">{store.email}</p>
              </div>
              {store.phone && (
                <div>
                  <span className="text-sm font-semibold text-neutral-700">Phone:</span>
                  <p className="text-sm text-neutral-900">{store.phone}</p>
                </div>
              )}
              {store.address && (
                <div>
                  <span className="text-sm font-semibold text-neutral-700">Address:</span>
                  <p className="text-sm text-neutral-900">
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
          <Card variant="glass-strong">
            <h2 className="font-bold text-xl font-body text-neutral-900 mb-4">
              Financial Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Credit Limit:</span>
                <span className="font-semibold text-neutral-900">
                  {formatCurrency(store.credit_limit)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Current Balance:</span>
                <span className={`font-semibold ${store.current_balance < 0 ? 'text-error-600' : 'text-neutral-900'}`}>
                  {formatCurrency(store.current_balance)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Available Credit:</span>
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


