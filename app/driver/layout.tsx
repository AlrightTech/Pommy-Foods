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
    // Authentication disabled - allow direct access to all driver pages
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
    <div className="min-h-screen bg-base pb-20">
      <main className="p-4">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}

