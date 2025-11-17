"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, ChefHat } from "lucide-react";

export const Header = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/kitchen/login");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="h-20 w-full">
      <div className="h-full px-4 md:px-6 flex items-center justify-between w-full">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <ChefHat className="w-5 h-5 text-primary" />
            <span className="font-semibold text-neutral-900">Kitchen</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors relative z-50"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

