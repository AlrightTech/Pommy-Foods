"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FileText,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/customer/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/customer/products", icon: Package },
  { name: "Orders", href: "/customer/orders", icon: ShoppingCart },
  { name: "Stock", href: "/customer/stock", icon: TrendingUp },
  { name: "Invoices", href: "/customer/invoices", icon: FileText },
  { name: "Payments", href: "/customer/payments", icon: DollarSign },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="h-full w-64 bg-gradient-to-b from-primary-50 to-primary-100 border-r border-primary-200 p-6 shadow-soft">
      <div className="mb-8">
        <h1 className="font-display text-xl text-primary-600">Pommy Foods</h1>
        <p className="text-xs text-neutral-600 mt-1">Store Portal</p>
      </div>

      <nav className="space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-primary-500 text-white shadow-soft"
                  : "text-neutral-700 hover:bg-primary-200 hover:text-primary-700"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

