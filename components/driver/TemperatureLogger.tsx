"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Thermometer, X } from "lucide-react";

interface TemperatureLoggerProps {
  onSubmit: (temperature: number) => void;
  onCancel: () => void;
}

export function TemperatureLogger({ onSubmit, onCancel }: TemperatureLoggerProps) {
  const [temperature, setTemperature] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const temp = parseFloat(temperature);
    if (isNaN(temp)) {
      alert("Please enter a valid temperature");
      return;
    }
    onSubmit(temp);
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Thermometer className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-neutral-900">Log Temperature</h3>
        </div>
        <button
          onClick={onCancel}
          className="text-neutral-500 hover:text-neutral-700"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Temperature (°C)
          </label>
          <input
            type="number"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            required
            className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white text-neutral-900"
            placeholder="e.g., 4.5"
          />
        </div>

        <div className="flex items-center space-x-3">
          <Button type="submit" className="flex-1">
            Save Temperature
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}

