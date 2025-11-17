"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/FormInput";
import { Loader } from "@/components/ui/Loader";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types/database.types";

interface LoginFormProps {
  role: UserRole;
  onSuccess?: () => void;
}

const roleRedirects: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  store_owner: "/customer/dashboard",
  driver: "/driver/dashboard",
  kitchen_staff: "/kitchen/dashboard",
};

export function LoginForm({ role, onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message || "Invalid email or password");
        setLoading(false);
        return;
      }

      if (!authData?.user) {
        setError("Failed to authenticate user");
        setLoading(false);
        return;
      }

      // Get user profile to verify role
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (profileError || !profile) {
        setError("User profile not found");
        setLoading(false);
        return;
      }

      if (!profile.is_active) {
        setError("Account is inactive. Please contact support.");
        setLoading(false);
        return;
      }

      // Verify role matches
      if (profile.role !== role) {
        setError(`Access denied. ${role} account required.`);
        setLoading(false);
        await supabase.auth.signOut();
        return;
      }

      // Success - redirect to appropriate dashboard
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(roleRedirects[role]);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <FormInput
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={loading}
        placeholder="Enter your email"
      />

      <FormInput
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={loading}
        placeholder="Enter your password"
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader text="" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
}

