"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../../lib/supabase-server";

function getSiteOrigin() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export async function login(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    redirect("/login?message=Email and password are required");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?message=${encodeURIComponent(error.message)}`);
  }

  redirect("/");
}

export async function sendPasswordReset(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  const email = String(formData.get("email") || "");
  const origin = getSiteOrigin();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/login?mode=recovery`,
  });

  if (error) {
    redirect(`/login?message=${encodeURIComponent(error.message)}`);
  }

  redirect(
    `/login?message=${encodeURIComponent(
      "Password reset email sent. Please check your inbox"
    )}`
  );
}

export async function updatePassword(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!password || password.length < 6) {
    redirect(
      `/login?message=${encodeURIComponent(
        "Password must be at least 6 characters"
      )}`
    );
  }

  if (password !== confirmPassword) {
    redirect(
      `/login?message=${encodeURIComponent("Passwords do not match")}`
    );
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    redirect(`/login?message=${encodeURIComponent(error.message)}`);
  }

  redirect(
    `/login?message=${encodeURIComponent(
      "Password updated successfully. Please log in."
    )}`
  );
}