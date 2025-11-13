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
    const checkAuth = async () => {
      // Allow access to login page without auth
      if (pathname === "/customer/login") {
        setLoading(false);
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (!session) {
          router.push("/customer/login");
          return;
        }

        // Check if user has store_owner role
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role, store_id")
          .eq("id", session.user.id)
          .single();

        if (!profile || profile.role !== "store_owner") {
          router.push("/customer/login");
          return;
        }

        setAuthenticated(true);
      } catch (error) {
        console.error("Auth error:", error);
        router.push("/customer/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          router.push("/customer/login");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="text-neutral-600">Loading...</div>
      </div>
    );
  }

  if (pathname === "/customer/login") {
    return <>{children}</>;
  }

  if (!authenticated) {
    return null;
  }

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

