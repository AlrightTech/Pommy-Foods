import React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "retro";
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  className,
}) => {
  const baseStyles = "rounded-lg p-6";
  
  const variants = {
    default: "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow duration-200",
    elevated: "bg-white dark:bg-neutral-900 shadow-md hover:shadow-lg transition-shadow duration-200 border border-neutral-100 dark:border-neutral-800",
    retro: "bg-white dark:bg-neutral-900 rounded-lg border-2 border-primary-400 shadow-pixel hover:shadow-pixel-hover transition-all duration-200",
  };
  
  return (
    <div className={cn(baseStyles, variants[variant], className)}>
      {children}
    </div>
  );
};

