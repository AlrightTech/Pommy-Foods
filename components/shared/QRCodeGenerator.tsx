"use client";

import { useRef, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  onPrint?: () => void;
}

export function QRCodeGenerator({ value, size = 200, onPrint }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Placeholder for QR code generation
    // In production, use a library like qrcode.react or qrcode
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.fillStyle = "#000";
        ctx.font = "12px monospace";
        ctx.textAlign = "center";
        ctx.fillText("QR Code", canvasRef.current.width / 2, canvasRef.current.height / 2 - 10);
        ctx.fillText(value.substring(0, 20), canvasRef.current.width / 2, canvasRef.current.height / 2 + 10);
      }
    }
  }, [value, size]);

  return (
    <Card className="p-4">
      <div className="text-center">
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="border border-neutral-300 rounded bg-white mx-auto mb-4"
        />
        <p className="text-xs text-neutral-600 mb-2">{value}</p>
        {onPrint && (
          <Button onClick={onPrint} size="sm" variant="secondary">
            Print QR Code
          </Button>
        )}
        <p className="text-xs text-neutral-500 mt-2">
          QR code generation: Install qrcode.react library for production use
        </p>
      </div>
    </Card>
  );
}

