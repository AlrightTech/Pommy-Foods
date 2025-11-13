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
    success: "bg-success-100/40 backdrop-blur-sm text-success-700 border border-success-200/50",
    warning: "bg-warning-100/40 backdrop-blur-sm text-warning-700 border border-warning-200/50",
    error: "bg-error-100/40 backdrop-blur-sm text-error-700 border border-error-200/50",
    info: "bg-info-100/40 backdrop-blur-sm text-info-700 border border-info-200/50",
  };
  
  return (
    <span className={cn("px-3 py-1.5 rounded-premium text-xs font-semibold font-body transition-all duration-200", variants[variant], className)}>
      {children}
    </span>
  );
};
