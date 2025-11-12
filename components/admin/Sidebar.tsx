"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Truck, 
  DollarSign, 
  BarChart3,
  Settings,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Stores", href: "/admin/stores", icon: Users },
  { name: "Deliveries", href: "/admin/deliveries", icon: Truck },
  { name: "Payments", href: "/admin/payments", icon: DollarSign },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-primary-50 to-primary-100 border-r border-primary-200 p-6 hidden md:block z-40 shadow-soft">
      <div className="mb-8">
        <h1 className="font-display text-xl text-primary-600">Pommy Foods</h1>
        <p className="text-xs text-neutral-600 mt-1">Admin Panel</p>
      </div>
      
      <nav className="space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
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

