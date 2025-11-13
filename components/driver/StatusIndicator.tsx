"use client";

import { Badge } from "@/components/ui/Badge";

interface StatusIndicatorProps {
  status: string;
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "pending":
        return { variant: "warning" as const, label: "Pending" };
      case "assigned":
        return { variant: "info" as const, label: "Assigned" };
      case "in_transit":
        return { variant: "info" as const, label: "In Transit" };
      case "delivered":
        return { variant: "success" as const, label: "Delivered" };
      case "returned":
        return { variant: "error" as const, label: "Returned" };
      default:
        return { variant: "info" as const, label: status };
    }
  };

  const config = getStatusConfig();
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

