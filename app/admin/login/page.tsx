"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ToastProvider, useToast } from "@/components/ui/ToastProvider";
import { Shield, Package } from "lucide-react";

function AdminLoginForm() {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.session) {
        // Check user role
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", data.session.user.id)
          .single();

        if (profile && profile.role === "admin") {
          showSuccess("Login successful! Redirecting...");
          router.push("/admin/dashboard");
          router.refresh();
        } else {
          await supabase.auth.signOut();
          const errorMsg = "Access denied. Admin account required.";
          setError(errorMsg);
          showError(errorMsg);
        }
      }
    } catch (err: any) {
      const errorMsg = err.message || "Failed to login";
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-gold rounded-premium flex items-center justify-center shadow-premium">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Package className="w-6 h-6 text-primary-600" />
            <h1 className="font-display text-3xl text-neutral-900">
              Pommy Foods
            </h1>
          </div>
          <h2 className="font-body text-xl font-semibold text-neutral-700 mb-2">
            Admin Portal
          </h2>
          <p className="text-neutral-600">
            Sign in to access the admin dashboard
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-premium text-sm font-body">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold font-body text-neutral-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 glass rounded-premium focus:shadow-glass-lg focus:bg-white/35 border border-white/50 text-sm font-body text-neutral-900 transition-all"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold font-body text-neutral-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 glass rounded-premium focus:shadow-glass-lg focus:bg-white/35 border border-white/50 text-sm font-body text-neutral-900 transition-all"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            variant="glass"
            disabled={loading}
            className="w-full"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <ToastProvider>
      <AdminLoginForm />
    </ToastProvider>
  );
}

