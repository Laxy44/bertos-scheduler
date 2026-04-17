"use server";

import { redirect } from "next/navigation";

import { sendEmployeeInviteEmail } from "@/lib/invite-email";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getLatestInviteByEmail } from "@/lib/workspace-invite-admin";
import { getSiteUrl } from "@/lib/site-url";

type ResendResult = { ok: true } | { ok: false; error: string };

async function extendPendingInviteWindow(inviteId: string) {
  try {
    const admin = createSupabaseAdminClient();
    await admin
      .from("invites")
      .update({ expires_at: new Date(Date.now() + 14 * 86400000).toISOString() })
      .eq("id", inviteId)
      .eq("status", "pending");
  } catch {
    // non-fatal; email is still useful
  }
}

export async function requestFreshInviteFromExpiredPage(
  _prev: ResendResult | null,
  formData: FormData
): Promise<ResendResult> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email) {
    return { ok: false, error: "Enter the email address your invitation was sent to." };
  }

  const invite = await getLatestInviteByEmail(email);

  if (!invite) {
    return {
      ok: false,
      error:
        "No invitation on file for that address. Double-check the email or ask your workspace admin to send a new invite.",
    };
  }

  if (invite.status === "accepted") {
    redirect(
      `/login?message=${encodeURIComponent(
        "You have already joined this workspace. Sign in with your email and password."
      )}`
    );
  }

  if (invite.status === "revoked") {
    return {
      ok: false,
      error: "This invitation was revoked. Ask your admin to send a new invite from Planyo.",
    };
  }

  if (invite.status === "expired") {
    return {
      ok: false,
      error:
        "This workspace invitation has fully expired. Ask your admin to create a new invite from the Invites page.",
    };
  }

  if (invite.status !== "pending") {
    return { ok: false, error: "This invitation can no longer be resent. Contact your admin." };
  }

  await extendPendingInviteWindow(invite.id);

  const origin = getSiteUrl().replace(/\/$/, "");
  const sent = await sendEmployeeInviteEmail(email, origin);

  if (sent.error) {
    return {
      ok: false,
      error: sent.error.message || "Could not send email. Try again later or contact support.",
    };
  }

  redirect(
    `/complete-account?email=${encodeURIComponent(email)}&message=${encodeURIComponent(
      "A fresh sign-in link has been sent. Check your inbox (and spam) and open the newest email."
    )}`
  );
}
