"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { KitchenSheetCard } from "@/components/kitchen/KitchenSheetCard";
import { Search, Package } from "lucide-react";

interface KitchenSheet {
  id: string;
  order_id: string;
  prepared_at: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  orders: {
    id: string;
    order_number: string;
    stores: {
      id: string;
      name: string;
    } | null;
  } | null;
}

export default function KitchenSheetsPage() {
  const router = useRouter();
  const [sheets, setSheets] = useState<KitchenSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSheets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/kitchen-sheets");
      if (!response.ok) throw new Error("Failed to fetch kitchen sheets");

      const data = await response.json();
      setSheets(data.kitchen_sheets || []);
    } catch (error) {
      console.error("Error fetching kitchen sheets:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSheets();
  }, [fetchSheets]);

  const getSheetStatus = (sheet: KitchenSheet) => {
    if (sheet.completed_at) return "completed";
    if (sheet.prepared_at) return "in_progress";
    return "pending";
  };

  const filteredSheets = sheets.filter((sheet) => {
    const status = getSheetStatus(sheet);
    const matchesStatus =
      statusFilter === "all" || status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      sheet.orders?.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sheet.orders?.stores?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-neutral-900">
            Kitchen Sheets
          </h1>
          <p className="text-neutral-600 mt-2">
            Manage preparation and packing
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center space-x-2 bg-neutral-100 rounded-lg px-4 py-2">
            <Search className="w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search by Order # or Store..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm text-neutral-900 placeholder-neutral-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white text-neutral-900"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </Card>

      {/* Kitchen Sheets Grid */}
      {loading ? (
        <div className="py-12">
          <Loader text="Loading kitchen sheets..." />
        </div>
      ) : filteredSheets.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-neutral-600">
            <Package className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <p>No kitchen sheets found</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSheets.map((sheet) => (
            <KitchenSheetCard
              key={sheet.id}
              sheet={sheet}
              onClick={() => router.push(`/kitchen/sheets/${sheet.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

