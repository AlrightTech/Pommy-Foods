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
    default: "bg-white border border-neutral-200 shadow-card hover:shadow-soft-lg transition-shadow duration-200",
    elevated: "bg-white shadow-soft-lg hover:shadow-soft transition-shadow duration-200 border border-neutral-100",
    retro: "bg-white rounded-lg border-2 border-primary-400 shadow-soft hover:shadow-soft-lg transition-all duration-200",
  };
  
  return (
    <div className={cn(baseStyles, variants[variant], className)}>
      {children}
    </div>
  );
};

