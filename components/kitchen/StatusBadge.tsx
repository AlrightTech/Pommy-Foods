"use client";

import { Badge } from "@/components/ui/Badge";

interface StatusBadgeProps {
  status: "pending" | "in_progress" | "completed";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants = {
    pending: "warning" as const,
    in_progress: "info" as const,
    completed: "success" as const,
  };

  const labels = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
  };

  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}

