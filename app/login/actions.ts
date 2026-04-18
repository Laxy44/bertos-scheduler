"use server";

import { redirect } from "next/navigation";
import { buildRecoveryEmailRedirectUrl } from "../../lib/auth-callback-urls";
import { authDebug } from "../../lib/auth-debug";
import { createServerSupabaseClient } from "../../lib/supabase-server";
import { getSiteUrl } from "../../lib/site-url";

function getSiteOrigin() {
  return getSiteUrl();
}

function authErrorMessage(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) {
    return "This email exists, but the password is incorrect. Try again or reset your password.";
  }
  return message;
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
    redirect(`/login?message=${encodeURIComponent(authErrorMessage(error.message))}`);
  }

  redirect("/app");
}

export async function sendPasswordReset(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  const email = String(formData.get("email") || "");
  const origin = getSiteOrigin();

  // Supabase Dashboard → Authentication → URL Configuration: allowlist …/auth/callback.
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: buildRecoveryEmailRedirectUrl(origin),
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
  const {
    data: { user: actionUser },
  } = await supabase.auth.getUser();
  authDebug("updatePassword server action", {
    hasUser: Boolean(actionUser),
    userId: actionUser?.id ?? null,
  });

  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!password || password.length < 6) {
    redirect(
      `/reset-password?message=${encodeURIComponent(
        "Password must be at least 6 characters"
      )}`
    );
  }

  if (password !== confirmPassword) {
    redirect(
      `/reset-password?message=${encodeURIComponent("Passwords do not match")}`
    );
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    redirect(`/reset-password?message=${encodeURIComponent(error.message)}`);
  }

  redirect(
    `/login?message=${encodeURIComponent(
      "Password updated. Sign in with your new password."
    )}`
  );
}