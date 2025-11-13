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
    <Card variant="elevated" className="hover:scale-[1.02] transition-all duration-300 animate-scale-in">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-body text-neutral-600 mb-2">{title}</p>
          <p className="text-3xl font-bold font-display text-neutral-900 mb-1.5">
            {value}
          </p>
          {change && (
            <p className={cn("text-xs font-body font-medium flex items-center gap-1", changeColors[changeType])}>
              {changeType === "positive" && "↑"}
              {changeType === "negative" && "↓"}
              {change}
            </p>
          )}
        </div>
        <div className={cn("w-14 h-14 rounded-food flex items-center justify-center shadow-food transition-all duration-300 hover:scale-110", iconBg)}>
          <Icon className="w-7 h-7 text-primary-600" />
        </div>
      </div>
    </Card>
  );
};

