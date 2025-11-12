"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

export default function StoresPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-neutral-900 dark:text-neutral-100">
            Stores
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Manage convenience stores and restaurants
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Store
        </Button>
      </div>

      <Card>
        <p className="text-neutral-600 dark:text-neutral-400">
          Stores management coming soon...
        </p>
      </Card>
    </div>
  );
}

