"use client";

import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface StockAlertProps {
  count: number;
  onClick?: () => void;
}

export function StockAlert({ count, onClick }: StockAlertProps) {
  if (count === 0) return null;

  return (
    <Card
      className={`bg-warning-50 border-warning-200 ${onClick ? "cursor-pointer hover:bg-warning-100" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <AlertTriangle className="w-5 h-5 text-warning-600" />
        <div>
          <h3 className="font-semibold text-warning-900">
            Low Stock Alert
          </h3>
          <p className="text-sm text-warning-700">
            {count} product{count !== 1 ? "s" : ""} below minimum stock level
          </p>
        </div>
      </div>
    </Card>
  );
}

