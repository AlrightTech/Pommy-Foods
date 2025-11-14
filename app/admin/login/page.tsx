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
        // Check user role with proper error handling
        // Try querying with explicit headers to avoid 406 errors
        const profileQuery = supabase
          .from("user_profiles")
          .select("role, email, full_name, is_active")
          .eq("id", data.session.user.id);
        
        const { data: profile, error: profileError } = await profileQuery.maybeSingle();

        // Log for debugging
        console.log("Profile check:", { 
          profile, 
          profileError, 
          userId: data.session.user.id,
          errorCode: profileError?.code,
          errorMessage: profileError?.message,
          errorDetails: profileError?.details,
          errorHint: profileError?.hint
        });

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          console.error("Profile error details:", {
            code: profileError.code,
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint,
            userId: data.session.user.id
          });
          
          // If profile doesn't exist, provide helpful message
          if (profileError.code === 'PGRST116' || profileError.code === 'PGRST301') {
            await supabase.auth.signOut();
            const errorMsg = `Admin profile not found for user ID: ${data.session.user.id}. Please run the fix_admin_login.sql script in Supabase SQL Editor.`;
            setError(errorMsg);
            showError(errorMsg);
            return;
          }
          
          // Handle 406 or other HTTP errors
          if (profileError.message?.includes('406') || profileError.code === '406') {
            await supabase.auth.signOut();
            const errorMsg = `Database query failed. Please ensure your admin profile exists. User ID: ${data.session.user.id}. Run fix_admin_login.sql in Supabase SQL Editor.`;
            setError(errorMsg);
            showError(errorMsg);
            return;
          }
          
          // Show detailed error for debugging
          const errorMsg = `Profile query failed: ${profileError.message || 'Unknown error'}. Code: ${profileError.code || 'N/A'}. User ID: ${data.session.user.id}`;
          setError(errorMsg);
          showError(errorMsg);
          return;
        }

        if (!profile) {
          await supabase.auth.signOut();
          const errorMsg = "Admin profile not found. Please contact system administrator to set up your admin account.";
          setError(errorMsg);
          showError(errorMsg);
          return;
        }

        if (profile.role !== "admin") {
          await supabase.auth.signOut();
          const errorMsg = `Access denied. Your account has role "${profile.role || 'none'}" but admin role is required. Please contact system administrator.`;
          setError(errorMsg);
          showError(errorMsg);
          return;
        }

        if (!profile.is_active) {
          await supabase.auth.signOut();
          const errorMsg = "Access denied. Your admin account is inactive. Please contact system administrator.";
          setError(errorMsg);
          showError(errorMsg);
          return;
        }

        showSuccess("Login successful! Redirecting...");
        router.push("/admin/dashboard");
        router.refresh();
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

