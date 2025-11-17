"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { LoginForm } from "@/components/auth/LoginForm";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default function KitchenLoginPage() {
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

        if (profile?.role === "kitchen_staff") {
          router.replace("/kitchen/dashboard");
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
              Kitchen Staff Login
            </h1>
            <p className="text-neutral-600">
              Sign in to access the kitchen dashboard
            </p>
          </div>

          <LoginForm role="kitchen_staff" />

          <div className="text-center text-sm text-neutral-600">
            Don't have an account?{" "}
            <Link
              href="/kitchen/register"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              Register here
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
