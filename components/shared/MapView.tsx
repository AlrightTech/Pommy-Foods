"use client";

import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/Card";

interface MapViewProps {
  locations: Array<{ lat: number; lng: number; label: string }>;
  center?: { lat: number; lng: number };
  zoom?: number;
}

export function MapView({ locations, center, zoom = 12 }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Placeholder for map integration
    // In production, integrate with Google Maps or Mapbox
    if (mapRef.current) {
      mapRef.current.innerHTML = `
        <div style="width: 100%; height: 400px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
          <div style="text-align: center; color: #666;">
            <p style="font-size: 14px; margin-bottom: 8px;">Map View</p>
            <p style="font-size: 12px;">Map integration placeholder</p>
            <p style="font-size: 12px; margin-top: 4px;">Locations: ${locations.length}</p>
          </div>
        </div>
      `;
    }
  }, [locations]);

  return (
    <Card className="p-0 overflow-hidden">
      <div ref={mapRef} className="w-full h-[400px]" />
      <div className="p-4 border-t border-neutral-200">
        <p className="text-xs text-neutral-500">
          Map integration: Configure Google Maps or Mapbox API key to enable route visualization
        </p>
      </div>
    </Card>
  );
}

