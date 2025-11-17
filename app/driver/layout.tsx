"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { MobileNav } from "@/components/driver/MobileNav";
import { Loader } from "@/components/ui/Loader";

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
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push("/driver/login");
          return;
        }

        // Verify driver role
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role, is_active")
          .eq("id", session.user.id)
          .single();

        if (!profile || profile.role !== "driver") {
          await supabase.auth.signOut();
          router.push("/driver/login");
          return;
        }

        if (!profile.is_active) {
          await supabase.auth.signOut();
          router.push("/driver/login");
          return;
        }

        setAuthenticated(true);
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/driver/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname]);

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
    <div className="min-h-screen bg-base pb-20">
      <main className="p-4">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
