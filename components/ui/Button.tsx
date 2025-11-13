import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "neu" | "glass" | "danger";
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
  const baseStyles = "font-semibold font-body rounded-premium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2";
  
  const variants = {
    // Primary: Golden background, white text
    primary: "bg-gradient-gold text-white shadow-premium hover:shadow-premium-lg hover:-translate-y-0.5 active:translate-y-0 disabled:text-white/70",
    // Secondary: Glassmorphic, primary text color
    secondary: "glass text-primary-500 hover:text-primary-600 hover:bg-white/35 hover:shadow-glass-lg active:text-primary-700 disabled:text-primary-500/50",
    // Neu: Neumorphic, primary text color
    neu: "neu text-primary-500 hover:text-primary-600 hover:shadow-neu-lg active:text-primary-700 active:neu-inset disabled:text-primary-500/50",
    // Glass: Glassmorphic, primary text color
    glass: "glass text-primary-500 hover:text-primary-600 hover:bg-white/35 active:text-primary-700 disabled:text-primary-500/50",
    // Danger: Error background, white text
    danger: "bg-error-600 text-white shadow-premium hover:bg-error-700 hover:shadow-premium-lg hover:-translate-y-0.5 active:translate-y-0 active:bg-error-800 disabled:text-white/70",
  };
  
  const sizes = {
    sm: "px-4 py-2.5 text-sm",
    md: "px-6 py-3.5 text-base",
    lg: "px-8 py-4.5 text-lg",
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
