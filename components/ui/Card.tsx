import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "glass" | "glass-strong" | "neu";
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  className,
  ...props
}) => {
  const baseStyles = "rounded-premium p-6 transition-all duration-300";
  
  const variants = {
    default: "bg-white/40 backdrop-blur-[25px] border border-white/50 shadow-glass",
    glass: "bg-white/25 backdrop-blur-[25px] border border-white/50 shadow-glass",
    "glass-strong": "bg-white/35 backdrop-blur-[25px] border border-white/60 shadow-glass-lg",
    neu: "neu rounded-neu",
  };
  
  return (
    <div className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </div>
  );
};
