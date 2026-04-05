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