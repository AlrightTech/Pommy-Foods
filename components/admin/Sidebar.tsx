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
  Users,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Stores", href: "/admin/stores", icon: Users },
  { name: "Kitchen Sheets", href: "/admin/kitchen-sheets", icon: FileText },
  { name: "Deliveries", href: "/admin/deliveries", icon: Truck },
  { name: "Payments", href: "/admin/payments", icon: DollarSign },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-80 neu rounded-r-premium-lg p-6 hidden md:block z-40 border-r border-white/30 overflow-y-auto">
      {/* Logo */}
      <div className="mb-10 pb-6 border-b border-white/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-premium bg-gradient-gold flex items-center justify-center shadow-premium gold-glow">
            <span className="font-bold font-body text-white text-lg">PF</span>
          </div>
          <div>
            <h1 className="font-bold font-body text-xl text-neutral-800">Pommy Foods</h1>
            <p className="text-xs font-body text-neutral-600 mt-0.5">Admin Dashboard</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-premium transition-all duration-300 group relative",
                isActive
                  ? "neu-inset bg-white/20 text-primary-600 shadow-neu-lg"
                  : "text-neutral-700 hover:bg-white/10 hover:text-primary-600"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-premium flex items-center justify-center transition-all",
                isActive 
                  ? "neu-inset bg-white/30 shadow-neu" 
                  : "neu group-hover:shadow-neu-lg"
              )}>
                <Icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-primary-600" : "text-neutral-600 group-hover:text-primary-600"
                )} />
              </div>
              <span className="font-semibold font-body">{item.name}</span>
              {isActive && (
                <div className="absolute right-4 w-1.5 h-8 bg-primary-500 rounded-full shadow-premium"></div>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
