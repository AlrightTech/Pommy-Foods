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
  { name: "Kitchen Sheets", href: "/admin/kitchen-sheets", icon: Package },
  { name: "Deliveries", href: "/admin/deliveries", icon: Truck },
  { name: "Payments", href: "/admin/payments", icon: DollarSign },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-gradient-to-br from-white via-primary-50/80 to-accent-50/40 backdrop-blur-md border-r border-primary-200/60 p-6 hidden md:block z-40 shadow-food">
      <div className="mb-8 pb-6 border-b border-primary-200/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-food bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-food">
            <span className="font-display text-xs text-white">PF</span>
          </div>
          <div>
            <h1 className="font-display text-lg text-primary-700">Pommy Foods</h1>
            <p className="text-xs font-body text-neutral-600 mt-0.5">Admin Panel</p>
          </div>
        </div>
      </div>
      
      <nav className="space-y-1.5">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-food transition-all duration-300 group",
                isActive
                  ? "bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-food-lg scale-[1.02]"
                  : "text-neutral-700 hover:bg-primary-100/60 hover:text-primary-700 hover:translate-x-1"
              )}
            >
              <Icon className={cn("w-5 h-5 transition-transform", isActive ? "" : "group-hover:scale-110")} />
              <span className="font-medium font-body">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
