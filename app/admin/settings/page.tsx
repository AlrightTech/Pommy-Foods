"use client";

import { Card } from "@/components/ui/Card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-neutral-900 dark:text-neutral-100">
          Settings
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Configure system settings
        </p>
      </div>

      <Card>
        <p className="text-neutral-600 dark:text-neutral-400">
          Settings page coming soon...
        </p>
      </Card>
    </div>
  );
}

