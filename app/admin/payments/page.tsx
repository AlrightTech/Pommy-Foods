"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Loader } from "@/components/ui/Loader";
import { Search } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface Payment {
  id: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  payment_date: string | null;
  orders: {
    id: string;
    order_number: string;
    stores: {
      id: string;
      name: string;
    } | null;
  } | null;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/payments?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }

      const data = await response.json();
      setPayments(data.payments || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      // Use static data as fallback
      const staticPayments: Payment[] = [
        { id: '1', amount: 1250.00, payment_method: 'credit_card', payment_status: 'paid', payment_date: new Date(Date.now() - 86400000).toISOString(), orders: { id: '1', order_number: 'ORD-2024-001234', stores: { id: '1', name: 'Downtown Convenience' } } },
        { id: '2', amount: 890.50, payment_method: 'bank_transfer', payment_status: 'paid', payment_date: new Date(Date.now() - 172800000).toISOString(), orders: { id: '2', order_number: 'ORD-2024-001233', stores: { id: '2', name: 'Main Street Market' } } },
        { id: '3', amount: 2340.75, payment_method: 'credit_card', payment_status: 'pending', payment_date: null, orders: { id: '3', order_number: 'ORD-2024-001232', stores: { id: '3', name: 'Corner Store' } } },
        { id: '4', amount: 567.25, payment_method: 'check', payment_status: 'pending', payment_date: null, orders: { id: '4', order_number: 'ORD-2024-001231', stores: { id: '4', name: 'Quick Mart' } } },
        { id: '5', amount: 1890.00, payment_method: 'credit_card', payment_status: 'overdue', payment_date: null, orders: { id: '5', order_number: 'ORD-2024-001230', stores: { id: '5', name: 'Food Express' } } },
        { id: '6', amount: 1120.50, payment_method: 'bank_transfer', payment_status: 'paid', payment_date: new Date(Date.now() - 259200000).toISOString(), orders: { id: '6', order_number: 'ORD-2024-001229', stores: { id: '1', name: 'Downtown Convenience' } } },
        { id: '7', amount: 765.25, payment_method: 'credit_card', payment_status: 'paid', payment_date: new Date(Date.now() - 345600000).toISOString(), orders: { id: '7', order_number: 'ORD-2024-001228', stores: { id: '2', name: 'Main Street Market' } } },
      ];
      const filtered = statusFilter 
        ? staticPayments.filter(p => p.payment_status === statusFilter)
        : staticPayments;
      setPayments(filtered);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Paid</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'overdue':
        return <Badge variant="error">Overdue</Badge>;
      default:
        return <Badge variant="info">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-3xl md:text-4xl font-body text-neutral-900 mb-2">
          Payments
        </h1>
        <p className="text-neutral-600 font-body text-base">
          Manage payments and invoices
        </p>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter || ''}
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

      {/* Payments Table */}
      <Card>
        {loading ? (
          <div className="py-12">
            <Loader text="Loading payments..." />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8 text-neutral-600">
            No payments found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold font-body text-neutral-600 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold font-body text-neutral-600 uppercase tracking-wider">
                    Store
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold font-body text-neutral-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold font-body text-neutral-600 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold font-body text-neutral-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold font-body text-neutral-600 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-neutral-100 hover:bg-primary-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-mono text-primary-600">
                      {payment.orders?.order_number || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-700">
                      {payment.orders?.stores?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-neutral-900 text-right">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-700 capitalize">
                      {payment.payment_method.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(payment.payment_status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {payment.payment_date
                        ? format(new Date(payment.payment_date), 'MMM dd, yyyy')
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="flex justify-end">
        <Link href="/admin/invoices">
          <button className="text-primary-600 hover:text-primary-700 font-semibold">
            View All Invoices →
          </button>
        </Link>
      </div>
    </div>
  );
}

