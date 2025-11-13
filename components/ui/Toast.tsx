"use client";

import React, { useEffect } from "react";
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "warning" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const icons = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
};

const styles = {
  success: {
    container: "bg-success-50/95 backdrop-blur-sm border-success-200/50 text-success-800",
    icon: "text-success-600",
    close: "text-success-600 hover:text-success-700 hover:bg-success-100/50",
  },
  warning: {
    container: "bg-warning-50/95 backdrop-blur-sm border-warning-200/50 text-warning-800",
    icon: "text-warning-600",
    close: "text-warning-600 hover:text-warning-700 hover:bg-warning-100/50",
  },
  error: {
    container: "bg-error-50/95 backdrop-blur-sm border-error-200/50 text-error-800",
    icon: "text-error-600",
    close: "text-error-600 hover:text-error-700 hover:bg-error-100/50",
  },
  info: {
    container: "bg-info-50/95 backdrop-blur-sm border-info-200/50 text-info-800",
    icon: "text-info-600",
    close: "text-info-600 hover:text-info-700 hover:bg-info-100/50",
  },
};

export function ToastComponent({ toast, onClose }: ToastProps) {
  const Icon = icons[toast.type];
  const style = styles[toast.type];

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onClose]);

  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3 rounded-premium border shadow-glass-lg min-w-[300px] max-w-[500px] animate-fade-in",
        style.container
      )}
    >
      <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", style.icon)} />
      <p className="flex-1 text-sm font-body font-medium">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className={cn(
          "p-1 rounded-premium transition-all flex-shrink-0",
          style.close
        )}
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

