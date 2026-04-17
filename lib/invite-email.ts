import "server-only";
import { createClient } from "@supabase/supabase-js";
import { buildInviteEmailRedirectUrl } from "@/lib/auth-callback-urls";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function createAnonAuthClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}

function isInviteEmailAlreadyRegisteredError(error: { message?: string; status?: number }) {
  const msg = (error.message || "").toLowerCase();
  return (
    msg.includes("already been registered") ||
    msg.includes("already registered") ||
    msg.includes("user already exists") ||
    error.status === 422
  );
}

/**
 * Sends the Supabase **Invite user** email via `inviteUserByEmail` (correct template + redirect).
 * Requires `SUPABASE_SERVICE_ROLE_KEY` — without it we error instead of falling back to
 * `signInWithOtp` (which uses the Magic Link template and is often confused with owner signup).
 * Fallback: `signInWithOtp` only when the auth user already exists (resend to registered email).
 * OTP is sent with a **fresh anon** client so the inviter’s session never blocks delivery.
 */
export async function sendEmployeeInviteEmail(
  email: string,
  origin: string
): Promise<{ error: Error | null }> {
  const redirectTo = buildInviteEmailRedirectUrl(origin, email);

  let admin;
  try {
    admin = createSupabaseAdminClient();
  } catch (e) {
    return {
      error: e instanceof Error ? e : new Error(String(e)),
    };
  }

  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo,
  });
  if (!error) {
    return { error: null };
  }
  if (!isInviteEmailAlreadyRegisteredError(error)) {
    return { error: new Error(error.message || "Invite email failed") };
  }

  const otp = await createAnonAuthClient().auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
      shouldCreateUser: false,
    },
  });

  return { error: otp.error ? (otp.error as Error) : null };
}
