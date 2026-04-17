"use server";

import { redirect } from "next/navigation";
import { buildSignupEmailRedirectUrl } from "../../../lib/auth-callback-urls";
import { createServerSupabaseClient } from "../../../lib/supabase-server";
import { getSiteUrlFromHeaders } from "../../../lib/site-url-server";

export async function resendOwnerConfirmation(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const mode = String(formData.get("mode") || "new").trim().toLowerCase();
  const encodedEmail = encodeURIComponent(email);
  const encodedMode = encodeURIComponent(mode);

  if (!email) {
    redirect(`/create-company/success?mode=${encodedMode}&message=Owner email is missing`);
  }

  const supabase = await createServerSupabaseClient();
  const origin = await getSiteUrlFromHeaders();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: buildSignupEmailRedirectUrl(origin),
    },
  });

  if (error) {
    redirect(
      `/create-company/success?mode=${encodedMode}&email=${encodedEmail}&message=${encodeURIComponent(
        `Resend failed: ${error.message}`
      )}`
    );
  }

  redirect(
    `/create-company/success?mode=${encodedMode}&email=${encodedEmail}&message=${encodeURIComponent(
      "Confirmation email sent. Please check your inbox."
    )}`
  );
}
