import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "outlined";
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  className,
  ...props
}) => {
  const baseStyles = "rounded-food p-6 transition-all duration-300";
  
  const variants = {
    default: "bg-white/95 backdrop-blur-sm border border-primary-200/50 shadow-food hover:shadow-food-lg hover:-translate-y-1",
    elevated: "bg-white/98 backdrop-blur-md border border-primary-300/60 shadow-elevated hover:shadow-food-lg hover:-translate-y-1",
    outlined: "bg-gradient-to-br from-white via-primary-50/30 to-accent-50/20 backdrop-blur-sm border-2 border-primary-400/40 shadow-food hover:shadow-food-lg hover:border-primary-500/60",
  };
  
  return (
    <div className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </div>
  );
};

