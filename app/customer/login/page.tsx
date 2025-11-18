"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { LoginForm } from "@/components/auth/LoginForm";
import { Card } from "@/components/ui/Card";

export default function CustomerLoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Verify role
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (profile?.role === "store_owner") {
          router.replace("/customer/dashboard");
        }
      }
    };
    checkSession();
  }, [router]);

  return (
    <div className="min-h-screen bg-base flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl font-bold text-neutral-900">
              Store Owner Login
            </h1>
            <p className="text-neutral-600">
              Sign in to access your store dashboard
            </p>
          </div>

          <LoginForm role="store_owner" />
        </div>
      </Card>
    </div>
  );
}
