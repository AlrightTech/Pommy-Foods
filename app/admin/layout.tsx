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
      <div 
        className="min-h-screen bg-base"
        style={{
          display: 'grid',
          gridTemplateRows: '64px 1fr',
          gridTemplateColumns: 'auto 1fr',
          width: '100%',
          height: '100vh',
          overflow: 'hidden'
        }}
      >
        {/* Sidebar - spans both rows on desktop */}
        <div
          className="hidden md:block"
          style={{
            gridRow: '1 / -1',
            gridColumn: '1 / 2',
            zIndex: 40,
            width: '320px'
          }}
        >
          <Sidebar />
        </div>

        {/* Header - spans full width on mobile, excludes sidebar on desktop */}
        <header
          className="w-full md:col-start-2"
          style={{
            gridRow: '1 / 2',
            gridColumn: '1 / -1',
            zIndex: 50,
            position: 'relative',
            overflow: 'visible'
          }}
        >
          <Header />
        </header>

        {/* Main Content Area */}
        <main
          className="w-full overflow-y-auto overflow-x-hidden md:col-start-2"
          style={{
            gridRow: '2 / -1',
            gridColumn: '1 / -1',
            padding: '1rem',
            paddingTop: '1rem',
            paddingBottom: '2rem',
            overflow: 'visible'
          }}
        >
          <div 
            className="w-full max-w-full h-full"
            style={{
              paddingLeft: '0.5rem',
              paddingRight: '0.5rem'
            }}
          >
            <div className="md:pl-4 md:pr-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
