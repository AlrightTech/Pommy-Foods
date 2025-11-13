"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/ui/FileUpload";
import { DollarSign } from "lucide-react";

interface PaymentFormProps {
  orderAmount: number;
  onSubmit: (paymentData: { method: string; amount: number; receipt?: string }) => void;
  onCancel: () => void;
}

export function PaymentForm({ orderAmount, onSubmit, onCancel }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [amount, setAmount] = useState<string>(orderAmount.toString());
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (file: File | null) => {
    setReceiptFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const paymentAmount = parseFloat(amount);
    
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    let receiptUrl: string | undefined;
    if (receiptFile && paymentMethod === "cash") {
      try {
        setUploading(true);
        // In a real app, upload to storage service (e.g., Supabase Storage)
        // For now, we'll use a placeholder
        receiptUrl = "placeholder-receipt-url";
      } catch (error) {
        alert("Failed to upload receipt");
        return;
      } finally {
        setUploading(false);
      }
    }

    onSubmit({
      method: paymentMethod,
      amount: paymentAmount,
      receipt: receiptUrl,
    });
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(num);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">
          Payment Method
        </label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white text-neutral-900"
        >
          <option value="cash">Cash to Driver</option>
          <option value="direct_debit">Direct Debit</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">
          Amount
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-500" />
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full pl-10 pr-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white text-neutral-900"
            placeholder="0.00"
          />
        </div>
        <p className="text-xs text-neutral-500 mt-1">
          {formatCurrency(amount)}
        </p>
      </div>

      {paymentMethod === "cash" && (
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Receipt Photo (Optional)
          </label>
          <FileUpload
            accept="image/*"
            onChange={handleFileChange}
            maxSize={5 * 1024 * 1024} // 5MB
          />
        </div>
      )}

      <div className="flex items-center space-x-3 pt-4">
        <Button type="submit" disabled={uploading} className="flex-1">
          {uploading ? "Uploading..." : "Record Payment"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={uploading}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

