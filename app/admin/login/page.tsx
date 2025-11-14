"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/ui/Loader";

export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Authentication disabled - redirect directly to dashboard
    router.replace("/admin/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <Loader text="Redirecting to dashboard..." fullScreen />
    </div>
  );
}

