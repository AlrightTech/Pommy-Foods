"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Sidebar } from "@/components/kitchen/Sidebar";
import { Header } from "@/components/kitchen/Header";
import { Loader } from "@/components/ui/Loader";

export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  // Exclude login and register pages from auth check
  const isAuthPage = pathname === "/kitchen/login" || pathname === "/kitchen/register";

  useEffect(() => {
    // Skip auth check for login/register pages
    if (isAuthPage) {
      setLoading(false);
      setAuthenticated(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push("/kitchen/login");
          return;
        }

        // Verify kitchen_staff role
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role, is_active")
          .eq("id", session.user.id)
          .single();

        if (!profile || profile.role !== "kitchen_staff") {
          await supabase.auth.signOut();
          router.push("/kitchen/login");
          return;
        }

        if (!profile.is_active) {
          await supabase.auth.signOut();
          router.push("/kitchen/login");
          return;
        }

        setAuthenticated(true);
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/kitchen/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname, isAuthPage]);

  // For auth pages, render without layout wrapper
  if (isAuthPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <Loader text="Loading..." fullScreen />
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-base overflow-hidden">
      <div className="flex h-screen">
        {/* Sidebar - Fixed on desktop */}
        <aside className="hidden md:block fixed left-0 top-0 h-screen z-40">
          <Sidebar />
        </aside>

        {/* Main Content Area - Grid Layout */}
        <div className="flex-1 flex flex-col md:ml-64 min-w-0">
          {/* Header - Sticky */}
          <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-sm">
            <Header />
          </header>

          {/* Scrollable Main Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
            <div className="max-w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
