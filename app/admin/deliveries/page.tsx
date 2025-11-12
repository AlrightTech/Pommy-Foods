"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function DeliveriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-neutral-900 dark:text-neutral-100">
          Deliveries
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Track and manage deliveries
        </p>
      </div>

      <Card>
        <p className="text-neutral-600 dark:text-neutral-400">
          Deliveries management coming soon...
        </p>
      </Card>
    </div>
  );
}

