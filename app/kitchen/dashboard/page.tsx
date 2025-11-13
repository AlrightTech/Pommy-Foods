"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/admin/StatCard";
import { Loader } from "@/components/ui/Loader";
import { Package, CheckSquare, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";

interface KitchenStats {
  activeSheets: number;
  pendingItems: number;
  completedToday: number;
  inProgress: number;
}

export default function KitchenDashboardPage() {
  const [stats, setStats] = useState<KitchenStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentSheets, setRecentSheets] = useState<any[]>([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch kitchen sheets
      const response = await fetch("/api/admin/kitchen-sheets");
      if (!response.ok) throw new Error("Failed to fetch kitchen sheets");

      const data = await response.json();
      const sheets = data.kitchen_sheets || [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const activeSheets = sheets.filter(
        (s: any) => !s.completed_at
      ).length;

      const completedToday = sheets.filter((s: any) => {
        if (!s.completed_at) return false;
        const completedDate = new Date(s.completed_at);
        completedDate.setHours(0, 0, 0, 0);
        return completedDate.getTime() === today.getTime();
      }).length;

      const inProgress = sheets.filter(
        (s: any) => s.prepared_at && !s.completed_at
      ).length;

      // Count pending items
      let pendingItems = 0;
      for (const sheet of sheets) {
        if (!sheet.completed_at) {
          const itemsRes = await fetch(
            `/api/admin/kitchen-sheets/${sheet.id}/items`
          );
          if (itemsRes.ok) {
            const itemsData = await itemsRes.json();
            const unprepared = itemsData.items?.filter(
              (i: any) => !i.prepared
            ).length || 0;
            pendingItems += unprepared;
          }
        }
      }

      setStats({
        activeSheets,
        pendingItems,
        completedToday,
        inProgress,
      });

      setRecentSheets(sheets.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return <Loader text="Loading dashboard..." fullScreen />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-neutral-900">
          Kitchen Dashboard
        </h1>
        <p className="text-neutral-600 mt-2">
          Overview of kitchen operations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Sheets"
          value={stats?.activeSheets.toString() || "0"}
          icon={Package}
          iconBg="bg-primary-100"
        />
        <StatCard
          title="Pending Items"
          value={stats?.pendingItems.toString() || "0"}
          icon={Clock}
          iconBg="bg-warning-100"
        />
        <StatCard
          title="In Progress"
          value={stats?.inProgress.toString() || "0"}
          icon={TrendingUp}
          iconBg="bg-info-100"
        />
        <StatCard
          title="Completed Today"
          value={stats?.completedToday.toString() || "0"}
          icon={CheckSquare}
          iconBg="bg-success-100"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-display text-xl text-neutral-900 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link
              href="/kitchen/sheets"
              className="block px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-center font-semibold"
            >
              View All Kitchen Sheets
            </Link>
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-xl text-neutral-900 mb-4">
            Recent Activity
          </h2>
          <div className="text-sm text-neutral-600">
            {recentSheets.length === 0 ? (
              <p>No recent kitchen sheets</p>
            ) : (
              <ul className="space-y-2">
                {recentSheets.map((sheet) => (
                  <li key={sheet.id} className="flex justify-between">
                    <span>Sheet #{sheet.id.slice(0, 8)}</span>
                    <span className={sheet.completed_at ? "text-success-600" : "text-warning-600"}>
                      {sheet.completed_at ? "Completed" : "Active"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

