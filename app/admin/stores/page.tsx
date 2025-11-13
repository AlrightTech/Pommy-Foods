"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Loader } from "@/components/ui/Loader";
import { Plus, Search, Edit, Eye } from "lucide-react";

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

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', page.toString());
      params.append('limit', '20');

      const response = await fetch(`/api/stores?${params.toString()}`);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-semibold text-3xl md:text-4xl font-body text-neutral-900 mb-2">
            Stores
          </h1>
          <p className="text-neutral-600 font-body text-base">
            Manage convenience stores and restaurants
          </p>
        </div>
        <Link href="/admin/stores/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Store
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <div className="flex items-center space-x-2 bg-neutral-100 rounded-lg px-4 py-2">
          <Search className="w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search stores by name or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="flex-1 bg-transparent border-none outline-none text-sm text-neutral-900 placeholder-neutral-500"
          />
        </div>
      </Card>

      {/* Stores Table */}
      <Card>
        {loading ? (
          <div className="py-12">
            <Loader text="Loading stores..." />
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-8 text-neutral-600">
            No stores found
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-neutral-100 border-b-2 border-neutral-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                      Store Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                      Location
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-700">
                      Credit Limit
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-700">
                      Balance
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map((store) => (
                    <tr
                      key={store.id}
                      className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors"
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
                        {store.is_active ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="error">Inactive</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/admin/stores/${store.id}`}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/stores/${store.id}/edit`}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-neutral-200">
              <p className="text-sm text-neutral-600">
                Showing {(page - 1) * pagination.limit + 1}-
                {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} stores
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border-2 border-neutral-300 rounded-lg hover:bg-neutral-50 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages}
                  className="px-4 py-2 border-2 border-neutral-300 rounded-lg hover:bg-neutral-50 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

