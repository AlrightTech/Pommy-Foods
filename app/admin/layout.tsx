"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { Loader } from "@/components/ui/Loader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Authentication disabled - allow direct access to all admin pages
    setAuthenticated(true);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <ToastProvider>
        <div className="min-h-screen bg-base flex items-center justify-center">
          <Loader text="Loading..." fullScreen />
        </div>
      </ToastProvider>
    );
  }

  // Always show layout (authentication disabled)

  return (
    <ToastProvider>
      <div className="min-h-screen bg-base" style={{ overflowX: 'hidden' }}>
        <Sidebar />
        <Header />
        <main className="md:ml-80 pt-16 p-6 md:p-8 min-h-screen" style={{ overflowX: 'auto' }}>
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
