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

  // Exclude login and register pages from auth check
  const isAuthPage = pathname === "/admin/login" || pathname === "/admin/register";

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
          router.push("/admin/login");
          return;
        }

        // Verify admin role
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role, is_active")
          .eq("id", session.user.id)
          .single();

        if (!profile || profile.role !== "admin") {
          await supabase.auth.signOut();
          router.push("/admin/login");
          return;
        }

        if (!profile.is_active) {
          await supabase.auth.signOut();
          router.push("/admin/login");
          return;
        }

        setAuthenticated(true);
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname]); // Removed isAuthPage from deps to avoid unnecessary re-runs

  // For auth pages, render without layout wrapper
  if (isAuthPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <ToastProvider>
        <div className="min-h-screen bg-base flex items-center justify-center">
          <Loader text="Loading..." fullScreen />
        </div>
      </ToastProvider>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-base overflow-hidden">
        <div className="flex h-screen">
          {/* Sidebar - Fixed on desktop */}
          <aside className="hidden md:block fixed left-0 top-0 h-screen z-40">
            <Sidebar />
          </aside>

          {/* Main Content Area - Flex Layout */}
          <div className="flex-1 flex flex-col md:ml-80 min-w-0">
            {/* Header - Sticky */}
            <header className="sticky top-0 z-40 w-full">
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
    </ToastProvider>
  );
}
