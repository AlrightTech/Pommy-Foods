"use client";

import { RegisterForm } from "@/components/auth/RegisterForm";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default function KitchenRegisterPage() {
  return (
    <div className="min-h-screen bg-base flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl font-bold text-neutral-900">
              Kitchen Staff Registration
            </h1>
            <p className="text-neutral-600">
              Create an account to manage kitchen operations
            </p>
          </div>

          <RegisterForm role="kitchen_staff" />

          <div className="text-center text-sm text-neutral-600">
            Already have an account?{" "}
            <Link
              href="/kitchen/login"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              Sign in here
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

