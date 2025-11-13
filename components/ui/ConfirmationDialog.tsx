"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning",
  isLoading = false,
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  const variantStyles = {
    danger: {
      icon: "text-error-600",
      confirmButton: "bg-error-600 hover:bg-error-700 text-white",
    },
    warning: {
      icon: "text-warning-600",
      confirmButton: "bg-warning-600 hover:bg-warning-700 text-white",
    },
    info: {
      icon: "text-info-600",
      confirmButton: "bg-info-600 hover:bg-info-700 text-white",
    },
  };

  const style = variantStyles[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className={cn("flex-shrink-0 p-2 rounded-premium", {
            "bg-error-100": variant === "danger",
            "bg-warning-100": variant === "warning",
            "bg-info-100": variant === "info",
          })}>
            <AlertTriangle className={cn("w-6 h-6", style.icon)} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold font-body text-neutral-900 mb-2">
              {title}
            </h3>
            <p className="text-sm font-body text-neutral-600">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/30">
          <Button
            type="button"
            variant="glass"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              style.confirmButton,
              "flex items-center gap-2 shadow-premium hover:shadow-premium-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed font-semibold font-body rounded-premium transition-all duration-300"
            )}
          >
            {isLoading ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                <span>Processing...</span>
              </>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

