"use client";

import { StatCard } from "@/components/admin/StatCard";
import { Card } from "@/components/ui/Card";
import { 
  ShoppingCart, 
  DollarSign, 
  Package, 
  TrendingUp,
  Clock,
  CheckCircle2
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export default function DashboardPage() {
  const recentOrders = [
    { id: "ORD-001", store: "Store A", amount: "$1,234.56", status: "pending", date: "2024-03-15" },
    { id: "ORD-002", store: "Store B", amount: "$2,345.67", status: "approved", date: "2024-03-15" },
    { id: "ORD-003", store: "Store C", amount: "$987.65", status: "completed", date: "2024-03-14" },
    { id: "ORD-004", store: "Store D", amount: "$1,567.89", status: "pending", date: "2024-03-14" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-neutral-900 dark:text-neutral-100">
          Dashboard
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Welcome back! Here's what's happening with your orders today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value="1,234"
          change="+12% from last month"
          changeType="positive"
          icon={ShoppingCart}
        />
        <StatCard
          title="Revenue"
          value="$45,678"
          change="+15% from last month"
          changeType="positive"
          icon={DollarSign}
          iconBg="bg-success-100 dark:bg-success-900"
        />
        <StatCard
          title="Products"
          value="156"
          change="+3 new products"
          changeType="positive"
          icon={Package}
          iconBg="bg-info-100 dark:bg-info-900"
        />
        <StatCard
          title="Pending Approval"
          value="23"
          change="5 urgent"
          changeType="negative"
          icon={Clock}
          iconBg="bg-warning-100 dark:bg-warning-900"
        />
      </div>

      {/* Recent Orders and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl text-neutral-900 dark:text-neutral-100">
                Recent Orders
              </h2>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-semibold">
                View All
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                      Order ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                      Store
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm font-mono text-primary-600 dark:text-primary-400">
                        {order.id}
                      </td>
                      <td className="py-3 px-4 text-sm text-neutral-700 dark:text-neutral-300">
                        {order.store}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {order.amount}
                      </td>
                      <td className="py-3 px-4">
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card>
            <h2 className="font-display text-xl text-neutral-900 dark:text-neutral-100 mb-6">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold px-4 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-left flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5" />
                <span>Review Pending Orders</span>
              </button>
              <button className="w-full bg-white dark:bg-neutral-800 border-2 border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-neutral-700 font-semibold px-4 py-3 rounded-lg transition-all duration-200 text-left flex items-center space-x-3">
                <TrendingUp className="w-5 h-5" />
                <span>View Analytics</span>
              </button>
              <button className="w-full bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 font-semibold px-4 py-3 rounded-lg transition-all duration-200 text-left flex items-center space-x-3">
                <Package className="w-5 h-5" />
                <span>Manage Products</span>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

