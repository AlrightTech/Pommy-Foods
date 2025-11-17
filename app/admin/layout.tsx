"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { Loader } from "@/components/ui/Loader";
import { Card } from "@/components/ui/Card";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

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
        // Check if Supabase client is properly initialized
        if (!supabase) {
          console.error("Supabase client not initialized");
          setLoading(false);
          return;
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          // If it's a configuration error, show helpful message
          if (sessionError.message?.includes("Host is not valid") || sessionError.message?.includes("Invalid API key")) {
            const errorMsg = "Supabase configuration error. Please check your .env.local file and ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set correctly, then restart your dev server.";
            console.error("❌", errorMsg);
            setConfigError(errorMsg);
          }
          setLoading(false);
          return;
        }

        if (!session) {
          router.push("/admin/login");
          return;
        }

        // Verify admin role
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("role, is_active")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          // If it's a network/configuration error, don't redirect
          if (profileError.message?.includes("Host is not valid") || profileError.message?.includes("Invalid API key")) {
            const errorMsg = "Supabase configuration error. Please check your .env.local file and ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set correctly, then restart your dev server.";
            setConfigError(errorMsg);
            setLoading(false);
            return;
          }
        }

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
      } catch (error: any) {
        console.error("Auth check error:", error);
        // Don't redirect on configuration errors - let user see the error
        if (error.message?.includes("Host is not valid") || error.message?.includes("Missing Supabase") || error.message?.includes("Invalid Supabase URL")) {
          const errorMsg = error.message || "Supabase configuration error. Please check your .env.local file.";
          setConfigError(errorMsg);
          setLoading(false);
          return;
        }
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

  // Show configuration error if present
  if (configError) {
    return (
      <ToastProvider>
        <div className="min-h-screen bg-base flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full p-8">
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-error-600">Configuration Error</h1>
              <p className="text-neutral-700">{configError}</p>
              <div className="bg-neutral-100 p-4 rounded-lg space-y-2">
                <p className="font-semibold text-sm">Required environment variables in <code className="bg-white px-2 py-1 rounded">.env.local</code>:</p>
                <ul className="list-disc list-inside text-sm space-y-1 text-neutral-600">
                  <li><code>NEXT_PUBLIC_SUPABASE_URL</code> - Your Supabase project URL</li>
                  <li><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> - Your Supabase anon/public key</li>
                </ul>
                <p className="text-sm text-neutral-600 mt-4">
                  <strong>Note:</strong> After updating .env.local, you must restart your development server.
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Reload Page
              </button>
            </div>
          </Card>
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
