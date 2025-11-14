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
    const checkAuth = async () => {
      // Allow access to login page without auth
      if (pathname === "/admin/login") {
        setLoading(false);
        return;
      }

      // DEVELOPMENT MODE: Skip authentication check
      // TODO: Re-enable authentication for production
      setAuthenticated(true);
      setLoading(false);
      return;

      // PRODUCTION CODE (commented out for development):
      /*
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (!session) {
          router.push("/admin/login");
          return;
        }

        // Check if user has admin role with proper error handling
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching profile in layout:", profileError);
          await supabase.auth.signOut();
          router.push("/admin/login");
          return;
        }

        if (!profile || profile.role !== "admin") {
          await supabase.auth.signOut();
          router.push("/admin/login");
          return;
        }

        setAuthenticated(true);
      } catch (error) {
        console.error("Auth error:", error);
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
      */
    };

    checkAuth();

    // DEVELOPMENT MODE: Skip auth state change listener
    // TODO: Re-enable for production
    /*
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          if (pathname !== "/admin/login") {
            router.push("/admin/login");
          }
        } else if (session) {
          // Verify admin role on auth state change
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("role")
            .eq("id", session.user.id)
            .maybeSingle();

          if (!profile || profile.role !== "admin") {
            await supabase.auth.signOut();
            router.push("/admin/login");
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
    */
  }, [router, pathname]);

  if (loading) {
    return (
      <ToastProvider>
        <div className="min-h-screen bg-base flex items-center justify-center">
          <Loader text="Loading..." fullScreen />
        </div>
      </ToastProvider>
    );
  }

  // Don't show layout for login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!authenticated) {
    return null;
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-base">
        <Sidebar />
        <Header />
        <main className="md:ml-80 pt-16 p-6 md:p-8 min-h-screen">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
