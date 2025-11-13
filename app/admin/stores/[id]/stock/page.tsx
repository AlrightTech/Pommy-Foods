"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Loader } from "@/components/ui/Loader";
import { ArrowLeft, RefreshCw, AlertTriangle } from "lucide-react";
import { StockManagementTable } from "@/components/admin/StockManagementTable";

interface Store {
  id: string;
  name: string;
}

export default function StoreStockPage() {
  const params = useParams();
  const router = useRouter();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStore = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/stores/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch store");

      const data = await response.json();
      setStore(data.store);
    } catch (error) {
      console.error("Error fetching store:", error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchStore();
    }
  }, [params.id, fetchStore]);

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
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-neutral-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-neutral-900">
            Stock Management
          </h1>
          <p className="text-neutral-600 mt-1">{store.name}</p>
        </div>
      </div>

      <StockManagementTable storeId={params.id as string} />
    </div>
  );
}

