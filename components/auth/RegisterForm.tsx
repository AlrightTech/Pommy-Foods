"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/FormInput";
import { Loader } from "@/components/ui/Loader";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types/database.types";

interface RegisterFormProps {
  role: UserRole;
  storeId?: string;
  onSuccess?: () => void;
}

const roleRedirects: Record<UserRole, string> = {
  admin: "/admin/login",
  store_owner: "/customer/login",
  driver: "/driver/login",
  kitchen_staff: "/kitchen/login",
};

export function RegisterForm({ role, storeId, onSuccess }: RegisterFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (role === "store_owner" && !storeId) {
      setError("Store ID is required for store owner registration");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
          role,
          phone: phone || undefined,
          store_id: storeId || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Success - redirect to login
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(roleRedirects[role]);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during registration");
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
        label="Full Name"
        type="text"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
        disabled={loading}
        placeholder="Enter your full name"
      />

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
        label="Phone (Optional)"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        disabled={loading}
        placeholder="Enter your phone number"
      />

      <FormInput
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={loading}
        placeholder="Enter your password (min 6 characters)"
      />

      <FormInput
        label="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        disabled={loading}
        placeholder="Confirm your password"
      />

      {role === "store_owner" && storeId && (
        <div className="bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-lg text-sm text-neutral-600">
          Registering for store: {storeId}
        </div>
      )}

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
            Creating account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  );
}


