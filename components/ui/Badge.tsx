import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "error" | "info";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "info",
  className,
}) => {
  const variants = {
    success: "bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300",
    warning: "bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300",
    error: "bg-error-100 text-error-700 dark:bg-error-900 dark:text-error-300",
    info: "bg-info-100 text-info-700 dark:bg-info-900 dark:text-info-300",
  };
  
  return (
    <span className={cn("px-3 py-1 rounded-full text-xs font-semibold", variants[variant], className)}>
      {children}
    </span>
  );
};

