import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

// This endpoint helps fix missing user profiles
// It should be called server-side or with proper authentication
export async function POST(request: NextRequest) {
  try {
    const { userId, role, email, fullName } = await request.json();

    if (!userId || !role) {
      return NextResponse.json(
        { error: "userId and role are required" },
        { status: 400 }
      );
    }

    // Use admin client for profile creation
    const supabase = getSupabaseAdmin();

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (existingProfile) {
      return NextResponse.json({
        message: "Profile already exists",
        profile: existingProfile,
      });
    }

    // Create profile
    const profileData: any = {
      id: userId,
      email: email || "",
      full_name: fullName || "User",
      role: role,
      is_active: true,
    };

    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .insert(profileData)
      .select()
      .single();

    if (profileError) {
      console.error("Error creating profile:", profileError);
      return NextResponse.json(
        { error: "Failed to create profile", details: profileError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Profile created successfully",
      profile: profile,
    });
  } catch (error: any) {
    console.error("Error in fix-profile:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fix profile" },
      { status: 500 }
    );
  }
}

