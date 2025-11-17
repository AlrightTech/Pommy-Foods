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
      let { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      // If profile doesn't exist, try to create it via API (for admin accounts)
      if (profileError || !profile) {
        // Try to auto-create profile for admin accounts or if role matches user metadata
        const userMetadata = authData.user.user_metadata || {};
        const metadataRole = userMetadata.role;
        
        // Only auto-create if role matches or if it's an admin account
        if (role === metadataRole || role === "admin") {
          try {
            const response = await fetch("/api/auth/fix-profile", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: authData.user.id,
                role: role,
                email: authData.user.email,
                fullName: userMetadata.full_name || authData.user.email?.split("@")[0] || "User",
              }),
            });

            if (response.ok) {
              const result = await response.json();
              profile = result.profile;
            } else {
              // If API fails, try direct insert as fallback (may fail due to RLS)
              const profileData: any = {
                id: authData.user.id,
                email: authData.user.email || "",
                full_name: userMetadata.full_name || authData.user.email?.split("@")[0] || "User",
                role: role,
                is_active: true,
              };

              const { data: newProfile, error: createError } = await supabase
                .from("user_profiles")
                .insert(profileData)
                .select()
                .single();

              if (createError || !newProfile) {
                console.error("Failed to create user profile:", createError);
                setError(
                  "User profile not found. Please contact an administrator to create your profile, or use the admin creation script."
                );
                setLoading(false);
                return;
              }

              profile = newProfile;
            }
          } catch (apiError) {
            console.error("Error calling fix-profile API:", apiError);
            setError(
              "User profile not found. Please contact an administrator to create your profile."
            );
            setLoading(false);
            return;
          }
        } else {
          setError(
            "User profile not found. Please contact an administrator to create your profile."
          );
          setLoading(false);
          return;
        }
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

