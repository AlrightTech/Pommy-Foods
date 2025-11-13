"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className={`w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}>
        {(title || onClose !== undefined) && (
          <div className="flex items-center justify-between mb-6">
            {title && (
              <h2 className="font-display text-xl text-neutral-900">{title}</h2>
            )}
            {onClose !== undefined && (
              <button
                onClick={onClose}
                className="text-neutral-500 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        {children}
      </Card>
    </div>
  );
}

