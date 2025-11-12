import React from "react";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconBg?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconBg = "bg-primary-100",
}) => {
  const changeColors = {
    positive: "text-success-600",
    negative: "text-error-600",
    neutral: "text-neutral-500",
  };

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-600">{title}</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">
            {value}
          </p>
          {change && (
            <p className={cn("text-sm mt-2", changeColors[changeType])}>
              {change}
            </p>
          )}
        </div>
        <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", iconBg)}>
          <Icon className="w-6 h-6 text-primary-600" />
        </div>
      </div>
    </Card>
  );
};

