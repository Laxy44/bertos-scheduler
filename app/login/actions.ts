"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase-server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/login?message=Could not authenticate user");
  }

  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    redirect("/login?message=Could not sign up user");
  }

  redirect("/login?message=Check your email to confirm your account");
}

export async function sendPasswordReset(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email") || "").trim();

  if (!email) {
    redirect("/login?message=Please enter your email first");
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/login?mode=recovery`,
  });

  if (error) {
    redirect(`/login?message=${encodeURIComponent(error.message)}`);
  }

 redirect(`/login?message=${encodeURIComponent("Password reset email sent. Please check your inbox")}`);
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();

  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!password || !confirmPassword) {
    redirect("/login?mode=recovery&message=Please fill both fields");
  }

  if (password !== confirmPassword) {
    redirect("/login?mode=recovery&message=Passwords do not match");
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    redirect(`/login?mode=recovery&message=${encodeURIComponent(error.message)}`);
  }

  redirect("/login?message=Password updated successfully. You can now login");
}
