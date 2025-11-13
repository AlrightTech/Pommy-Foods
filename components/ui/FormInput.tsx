"use client";

import { InputHTMLAttributes } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function FormInput({ label, error, helperText, className, ...props }: FormInputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-neutral-700">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 bg-white text-neutral-900 ${
          error
            ? "border-error-300 focus:border-error-500 focus:ring-error-200"
            : "border-neutral-300 focus:border-primary-500 focus:ring-primary-200"
        } ${className || ""}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-error-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-neutral-500">{helperText}</p>
      )}
    </div>
  );
}

