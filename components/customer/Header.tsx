"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Search, LogOut, Store } from "lucide-react";

export const Header = () => {
  const router = useRouter();
  const [storeName, setStoreName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: profile } = await supabase
          .from("user_profiles")
          .select("store_id")
          .eq("id", session.user.id)
          .single();

        if (profile?.store_id) {
          const { data: store } = await supabase
            .from("stores")
            .select("name")
            .eq("id", profile.store_id)
            .single();

          if (store) {
            setStoreName(store.name || "");
          }
        }
      } catch (error) {
        console.error("Error fetching store info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreInfo();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/customer/login");
  };

  return (
    <header className="fixed top-0 z-30 h-20 bg-white border-b border-neutral-200 shadow-sm" style={{ left: '256px', right: '0', width: 'calc(100% - 256px)' }}>
      <div className="h-full px-4 md:px-6 flex items-center justify-between w-full">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Store className="w-5 h-5 text-primary" />
            {!loading && storeName && (
              <span className="font-semibold text-neutral-900">{storeName}</span>
            )}
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

