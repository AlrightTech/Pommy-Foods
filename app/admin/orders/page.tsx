"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Search, Filter, Download } from "lucide-react";

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const orders = [
    { id: "ORD-001", store: "Store A", amount: "$1,234.56", status: "pending", date: "2024-03-15", items: 12 },
    { id: "ORD-002", store: "Store B", amount: "$2,345.67", status: "approved", date: "2024-03-15", items: 24 },
    { id: "ORD-003", store: "Store C", amount: "$987.65", status: "completed", date: "2024-03-14", items: 8 },
    { id: "ORD-004", store: "Store D", amount: "$1,567.89", status: "pending", date: "2024-03-14", items: 15 },
    { id: "ORD-005", store: "Store E", amount: "$3,456.78", status: "approved", date: "2024-03-13", items: 30 },
    { id: "ORD-006", store: "Store F", amount: "$765.43", status: "completed", date: "2024-03-13", items: 6 },
  ];

  const filteredOrders = orders.filter((order) =>
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.store.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-neutral-900 dark:text-neutral-100">
            Orders
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Manage and review all orders from stores
          </p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center space-x-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg px-4 py-2">
            <Search className="w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search by Order ID or Store..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-500"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border-2 border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-semibold">Filter</span>
          </button>
        </div>
      </Card>

      {/* Orders Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-neutral-100 dark:bg-neutral-800 border-b-2 border-neutral-200 dark:border-neutral-700">
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Order ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Store
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Items
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-mono text-primary-600 dark:text-primary-400">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-700 dark:text-neutral-300">
                    {order.store}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-700 dark:text-neutral-300">
                    {order.items}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {order.amount}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                    {order.date}
                  </td>
                  <td className="px-6 py-4">
                    {order.status === "pending" && (
                      <Badge variant="warning">Pending</Badge>
                    )}
                    {order.status === "approved" && (
                      <Badge variant="info">Approved</Badge>
                    )}
                    {order.status === "completed" && (
                      <Badge variant="success">Completed</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-semibold">
                        View
                      </button>
                      {order.status === "pending" && (
                        <>
                          <span className="text-neutral-300">|</span>
                          <button className="text-success-600 hover:text-success-700 text-sm font-semibold">
                            Approve
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Showing 1-6 of {filteredOrders.length} orders
          </p>
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 border-2 border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm font-semibold disabled:opacity-50">
              Previous
            </button>
            <button className="px-4 py-2 border-2 border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm font-semibold disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

