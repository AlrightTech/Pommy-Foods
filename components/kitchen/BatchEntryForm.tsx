"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";

interface KitchenSheetItem {
  id: string;
  product_id: string;
  quantity: number;
  batch_number: string | null;
  expiry_date: string | null;
  prepared: boolean;
  products: {
    id: string;
    name: string;
    sku: string;
    unit: string;
  } | null;
}

interface BatchEntryFormProps {
  item: KitchenSheetItem;
  onSave: (batchNumber: string, expiryDate: string) => void;
  onClose: () => void;
}

export function BatchEntryForm({
  item,
  onSave,
  onClose,
}: BatchEntryFormProps) {
  const [batchNumber, setBatchNumber] = useState(item.batch_number || "");
  const [expiryDate, setExpiryDate] = useState(
    item.expiry_date ? new Date(item.expiry_date).toISOString().split("T")[0] : ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (batchNumber && expiryDate) {
      onSave(batchNumber, expiryDate);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl text-neutral-900">
            Batch & Expiry Information
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-neutral-600 mb-2">
              Product: {item.products?.name}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Batch Number
            </label>
            <input
              type="text"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white text-neutral-900"
              placeholder="Enter batch number"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Expiry Date
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white text-neutral-900"
            />
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <Button type="submit" disabled={!batchNumber || !expiryDate} className="flex-1">
              Save
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

