"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Save } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    companyName: 'Pommy Foods',
    email: 'admin@pommyfoods.com',
    phone: '',
    address: '',
    defaultCreditLimit: '5000',
    autoApproveOrders: false,
    lowStockThreshold: '10',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // TODO: Save settings to database
    setTimeout(() => {
      setSaving(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="font-display text-xl text-neutral-900 dark:text-neutral-100 mb-4">
              Company Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-neutral-700 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-neutral-700 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-display text-xl text-neutral-900 dark:text-neutral-100 mb-4">
              Order Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Default Credit Limit
                </label>
                <input
                  type="number"
                  value={settings.defaultCreditLimit}
                  onChange={(e) => setSettings({ ...settings, defaultCreditLimit: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-neutral-700 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  value={settings.lowStockThreshold}
                  onChange={(e) => setSettings({ ...settings, lowStockThreshold: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-neutral-700 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
                />
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="autoApprove"
                  checked={settings.autoApproveOrders}
                  onChange={(e) => setSettings({ ...settings, autoApproveOrders: e.target.checked })}
                  className="w-5 h-5 text-primary-500 border-2 border-neutral-300 dark:border-neutral-700 rounded focus:ring-2 focus:ring-primary-500"
                />
                <label htmlFor="autoApprove" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Auto-approve orders
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving} className="flex items-center space-x-2">
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

