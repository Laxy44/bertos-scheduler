"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../../lib/supabase-server";
import { createCompanyForUser } from "../../lib/auth";

function getSiteOrigin() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export async function createCompany(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  const companyName = String(formData.get("companyName") || "").trim();
  const ownerEmail = String(formData.get("email") || "").trim();
  const ownerPassword = String(formData.get("password") || "");
  const origin = getSiteOrigin();

  if (!companyName) {
    redirect("/create-company?message=Company name is required");
  }

  const {
    data: { user: existingUser },
  } = await supabase.auth.getUser();

  if (existingUser) {
    try {
      await createCompanyForUser(supabase, { id: existingUser.id }, companyName);
      redirect("/");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create company";
      redirect(`/create-company?message=${encodeURIComponent(message)}`);
    }
  }

  if (!ownerEmail || !ownerPassword) {
    redirect("/create-company?message=Owner email and password are required");
  }

  if (ownerPassword.length < 6) {
    redirect("/create-company?message=Password must be at least 6 characters");
  }

  const signUpResult = await supabase.auth.signUp({
    email: ownerEmail,
    password: ownerPassword,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/create-company`,
    },
  });

  if (signUpResult.error) {
    redirect(`/create-company?message=${encodeURIComponent(signUpResult.error.message)}`);
  }

  const hasIdentity = (signUpResult.data.user?.identities || []).length > 0;
  if (!hasIdentity) {
    redirect(
      "/create-company?message=This email is already registered. Log in with that account or use another email."
    );
  }

  const signInResult = await supabase.auth.signInWithPassword({
    email: ownerEmail,
    password: ownerPassword,
  });

  if (signInResult.error) {
    redirect(
      "/login?message=Account created. Confirm email, then log in to finish company setup."
    );
  }

  const {
    data: { user: ownerUser },
    error: ownerUserError,
  } = await supabase.auth.getUser();

  if (ownerUserError || !ownerUser) {
    redirect("/create-company?message=Unable to resolve owner account");
  }

  try {
    await createCompanyForUser(supabase, { id: ownerUser.id }, companyName);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create company";
    redirect(`/create-company?message=${encodeURIComponent(message)}`);
  }

  redirect("/");
}
