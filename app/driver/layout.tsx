"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { MobileNav } from "@/components/driver/MobileNav";

export default function DriverLayout({
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
      if (pathname === "/driver/login") {
        setLoading(false);
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (!session) {
          router.push("/driver/login");
          return;
        }

        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (!profile || profile.role !== "driver") {
          router.push("/driver/login");
          return;
        }

        setAuthenticated(true);
      } catch (error) {
        console.error("Auth error:", error);
        router.push("/driver/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          router.push("/driver/login");
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

  if (pathname === "/driver/login") {
    return <>{children}</>;
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-base pb-20">
      <main className="p-4">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}

