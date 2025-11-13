"use client";

import { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
}

export function Select({ label, error, helperText, options, className, ...props }: SelectProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-neutral-700">
          {label}
        </label>
      )}
      <select
        className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 bg-white text-neutral-900 ${
          error
            ? "border-error-300 focus:border-error-500 focus:ring-error-200"
            : "border-neutral-300 focus:border-primary-500 focus:ring-primary-200"
        } ${className || ""}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs text-error-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-neutral-500">{helperText}</p>
      )}
    </div>
  );
}

