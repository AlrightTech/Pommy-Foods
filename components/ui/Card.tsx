import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "retro";
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  className,
  ...props
}) => {
  const baseStyles = "rounded-lg p-6";
  
  const variants = {
    default: "bg-white/80 backdrop-blur-md border-2 border-electric-brown-500 shadow-electric-glow hover:shadow-electric-glow-lg transition-all duration-300",
    elevated: "bg-white/85 backdrop-blur-lg border-2 border-electric-brown-500 shadow-electric-glow-lg hover:shadow-electric-glow transition-all duration-300",
    retro: "bg-white/80 backdrop-blur-md border-2 border-electric-brown-500 shadow-electric-glow hover:shadow-electric-glow-lg transition-all duration-300",
  };
  
  return (
    <div className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </div>
  );
};

