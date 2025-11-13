"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, ChefHat } from "lucide-react";

export const Header = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/kitchen/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 md:left-64 h-20 bg-white border-b border-neutral-200 shadow-sm z-30">
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <ChefHat className="w-5 h-5 text-primary-600" />
            <span className="font-semibold text-neutral-900">Kitchen</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

