import "server-only";

import type { User } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "./supabase/admin";
import { sendWelcomeEmail } from "./welcome-email";

type ProfileRecord = {
  id?: string;
  name?: string | null;
  full_name?: string | null;
  first_name?: string | null;
  welcome_email_sent?: boolean | null;
};

function extractFirstName(profile: ProfileRecord): string | null {
  const direct = (profile.first_name || "").trim();
  if (direct) return direct;

  const fromName = (profile.name || profile.full_name || "").trim();
  if (!fromName) return null;
  return fromName.split(/\s+/)[0] || null;
}

export async function maybeSendWelcomeEmailForUser(user: User): Promise<void> {
  console.log("[WELCOME] Trigger started");
  console.log("[WELCOME] User ID:", user.id);

  if (!user.id || !user.email || !user.email_confirmed_at) {
    console.log("[WELCOME] Session/user check failed; skipping trigger.");
    return;
  }

  const admin = createSupabaseAdminClient();
  const profileQuery = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .limit(1)
    .maybeSingle<ProfileRecord>();

  if (profileQuery.error) {
    console.warn("[welcome-email] profile lookup failed", {
      userId: user.id,
      error: profileQuery.error.message,
    });
    return;
  }

  let profile = profileQuery.data;
  if (!profile?.id) {
    // Some environments do not create profiles eagerly. Create a minimal row so
    // welcome-email delivery can still be tracked with the sent flag.
    const createProfile = await admin.from("profiles").upsert(
      {
        id: user.id,
        welcome_email_sent: false,
      },
      { onConflict: "id" }
    );

    if (createProfile.error) {
      console.warn("[welcome-email] profile bootstrap failed", {
        userId: user.id,
        error: createProfile.error.message,
      });
      return;
    }

    const profileReload = await admin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .limit(1)
      .maybeSingle<ProfileRecord>();

    if (profileReload.error || !profileReload.data?.id) {
      console.warn("[welcome-email] profile reload failed after bootstrap", {
        userId: user.id,
        error: profileReload.error?.message || "Profile row not found",
      });
      return;
    }

    profile = profileReload.data;
  }

  console.log("[WELCOME] Profile:", profile);
  console.log("[WELCOME] welcome_email_sent:", profile?.welcome_email_sent);

  if (profile.welcome_email_sent) {
    return;
  }

  // Atomic claim: only one request flips false -> true and is allowed to send.
  const claim = await admin
    .from("profiles")
    .update({ welcome_email_sent: true })
    .eq("id", user.id)
    .eq("welcome_email_sent", false)
    .select("id")
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (claim.error) {
    console.warn("[welcome-email] welcome claim failed", {
      userId: user.id,
      error: claim.error.message,
    });
    return;
  }

  if (!claim.data?.id) {
    // Another request already claimed/sent.
    return;
  }

  try {
    console.log("[WELCOME] Sending email...");
    await sendWelcomeEmail({
      to: user.email,
      firstName: extractFirstName(profile),
    });
    console.log("[WELCOME] Email sent successfully");
    console.log("[welcome-email] sent", { userId: user.id, email: user.email });
  } catch (err) {
    // Revert claim on send failure so it can retry later.
    await admin.from("profiles").update({ welcome_email_sent: false }).eq("id", user.id);
    console.error("[WELCOME ERROR]", err);
    console.warn("[welcome-email] send failed", {
      userId: user.id,
      email: user.email,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
