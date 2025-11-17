"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Sidebar } from "@/components/kitchen/Sidebar";
import { Header } from "@/components/kitchen/Header";

export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Authentication disabled - allow direct access to all kitchen pages
    setAuthenticated(true);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="text-neutral-600">Loading...</div>
      </div>
    );
  }

  // Always show layout (authentication disabled)

  return (
    <div className="min-h-screen bg-base" style={{ overflowX: 'hidden', width: '100%' }}>
      <Sidebar />
      <Header />
      <main className="md:ml-64 pt-20 p-4 md:p-6" style={{ overflowX: 'auto', width: '100%' }}>
        {children}
      </main>
    </div>
  );
}

