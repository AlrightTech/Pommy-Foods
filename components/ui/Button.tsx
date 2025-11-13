import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}) => {
  const baseStyles = "font-semibold font-body rounded-food transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 active:scale-95";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary-500 via-primary-500 to-accent-500 hover:from-primary-600 hover:via-primary-600 hover:to-accent-600 text-white shadow-food hover:shadow-food-lg hover:-translate-y-0.5",
    secondary: "bg-white/95 backdrop-blur-sm border-2 border-primary-400/60 text-primary-700 hover:bg-primary-50 hover:border-primary-500/80 shadow-soft hover:shadow-food",
    ghost: "bg-transparent text-neutral-700 hover:bg-primary-50/50 hover:text-primary-700",
    danger: "bg-gradient-to-r from-error-500 to-error-600 hover:from-error-600 hover:to-error-700 text-white shadow-food hover:shadow-food-lg hover:-translate-y-0.5",
  };
  
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };
  
  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};

