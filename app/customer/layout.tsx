"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Sidebar } from "@/components/customer/Sidebar";
import { Header } from "@/components/customer/Header";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Authentication disabled - allow direct access to all customer pages
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
    <div className="min-h-screen bg-base">
      <Sidebar />
      <Header />
      <main className="md:ml-64 pt-20 p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}

