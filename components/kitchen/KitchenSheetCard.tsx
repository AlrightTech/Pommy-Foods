"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Package } from "lucide-react";
import { format } from "date-fns";

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

interface KitchenSheetCardProps {
  sheet: KitchenSheet;
  onClick: () => void;
}

export function KitchenSheetCard({ sheet, onClick }: KitchenSheetCardProps) {
  const getStatus = () => {
    if (sheet.completed_at) return { label: "Completed", variant: "success" as const };
    if (sheet.prepared_at) return { label: "In Progress", variant: "info" as const };
    return { label: "Pending", variant: "warning" as const };
  };

  const status = getStatus();

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-primary-600" />
            <span className="font-mono text-sm text-primary-600">
              {sheet.orders?.order_number || "N/A"}
            </span>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-neutral-900">
            {sheet.orders?.stores?.name || "Unknown Store"}
          </p>
          <p className="text-xs text-neutral-600">
            Created: {format(new Date(sheet.created_at), "MMM dd, yyyy HH:mm")}
          </p>
          {sheet.prepared_at && (
            <p className="text-xs text-neutral-600">
              Started: {format(new Date(sheet.prepared_at), "MMM dd, yyyy HH:mm")}
            </p>
          )}
          {sheet.completed_at && (
            <p className="text-xs text-success-600">
              Completed: {format(new Date(sheet.completed_at), "MMM dd, yyyy HH:mm")}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

