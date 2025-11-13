"use client";

import { useRef, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface BarcodeGeneratorProps {
  value: string;
  format?: "CODE128" | "CODE39" | "EAN13";
  onPrint?: () => void;
}

export function BarcodeGenerator({ value, format = "CODE128", onPrint }: BarcodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Placeholder for barcode generation
    // In production, use a library like jsbarcode or react-barcode
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.fillStyle = "#000";
        ctx.font = "16px monospace";
        ctx.textAlign = "center";
        ctx.fillText(value, canvasRef.current.width / 2, canvasRef.current.height / 2);
        ctx.fillText(`Format: ${format}`, canvasRef.current.width / 2, canvasRef.current.height / 2 + 20);
      }
    }
  }, [value, format]);

  return (
    <Card className="p-4">
      <div className="text-center">
        <canvas
          ref={canvasRef}
          width={300}
          height={100}
          className="border border-neutral-300 rounded bg-white mx-auto mb-4"
        />
        <p className="text-xs text-neutral-600 mb-2">{value}</p>
        {onPrint && (
          <Button onClick={onPrint} size="sm" variant="secondary">
            Print Barcode
          </Button>
        )}
        <p className="text-xs text-neutral-500 mt-2">
          Barcode generation: Install jsbarcode library for production use
        </p>
      </div>
    </Card>
  );
}

