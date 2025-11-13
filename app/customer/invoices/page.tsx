"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Loader } from "@/components/ui/Loader";
import { Search, Eye, Download } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase/client";

interface Invoice {
  id: string;
  invoice_number: string;
  total_amount: number;
  payment_status: string;
  due_date: string | null;
  created_at: string;
  orders: {
    id: string;
    order_number: string;
  } | null;
}

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [storeId, setStoreId] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("store_id")
        .eq("id", session.user.id)
        .single();

      if (!profile?.store_id) return;
      setStoreId(profile.store_id);

      const params = new URLSearchParams();
      params.append("store_id", profile.store_id);
      if (statusFilter) params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/invoices?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch invoices");

      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="success">Paid</Badge>;
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "overdue":
        return <Badge variant="error">Overdue</Badge>;
      default:
        return <Badge variant="info">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-neutral-900">
            Invoices
          </h1>
          <p className="text-neutral-600 mt-2">
            View and manage your invoices
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
              placeholder="Search by Invoice # or Order #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm text-neutral-900 placeholder-neutral-500"
            />
          </div>
          <select
            value={statusFilter || ""}
            onChange={(e) => setStatusFilter(e.target.value || null)}
            className="px-4 py-2 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white text-neutral-900"
          >
            <option value="">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </Card>

      {/* Invoices Table */}
      <Card>
        {loading ? (
          <div className="py-12">
            <Loader text="Loading invoices..." />
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-8 text-neutral-600">
            No invoices found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-neutral-100 border-b-2 border-neutral-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                    Invoice #
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                    Order #
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-700">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                    Due Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-mono text-primary-600">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-neutral-600">
                      {invoice.orders?.order_number || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-neutral-900 text-right">
                      {formatCurrency(invoice.total_amount)}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(invoice.payment_status)}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {invoice.due_date
                        ? format(new Date(invoice.due_date), "MMM dd, yyyy")
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/customer/invoices/${invoice.id}`}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

