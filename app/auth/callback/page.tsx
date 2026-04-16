import { redirect } from "next/navigation";
import { resolveAuthCallbackDestination } from "../../../lib/auth-callback-redirect";
import { authDebug } from "../../../lib/auth-debug";
import { createServerSupabaseClient } from "../../../lib/supabase-server";
import { CallbackClientFallback } from "./callback-client-fallback";

function recordToURLSearchParams(
  record: Record<string, string | string[] | undefined>
): URLSearchParams {
  const u = new URLSearchParams();
  for (const [key, value] of Object.entries(record)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      value.forEach((v) => u.append(key, v));
    } else {
      u.set(key, value);
    }
  }
  return u;
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AuthCallbackPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams;
  const sp = recordToURLSearchParams(raw);
  const code = sp.get("code");
  const tokenHash = sp.get("token_hash");
  const typeParam = sp.get("type");

  const supabase = await createServerSupabaseClient();

  // Case 1: PKCE (?code=) — exchange on the server so session cookies are set before redirect.
  if (code) {
    const {
      data: { session: existing },
    } = await supabase.auth.getSession();
    if (!existing) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        redirect(`/auth/error?message=${encodeURIComponent(error.message)}`);
      }
    }
  } else if (tokenHash && typeParam) {
    // Email link with token_hash + type in query (no fragment)
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: typeParam as
        | "signup"
        | "invite"
        | "magiclink"
        | "recovery"
        | "email_change"
        | "email",
    });
    if (error) {
      redirect(`/auth/error?message=${encodeURIComponent(error.message)}`);
    }
  } else {
    // Case 2: Hash fragment (#access_token= / #refresh_token=) is never sent to the server — client must setSession.
    return <CallbackClientFallback />;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  authDebug("callback server after exchange", {
    hasSession: Boolean(session),
    userId: session?.user?.id ?? null,
  });
  if (process.env.NEXT_PUBLIC_AUTH_DEBUG === "1") {
    console.log("SESSION:", session);
  }

  if (!session) {
    return <CallbackClientFallback />;
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(
      `/auth/error?message=${encodeURIComponent(
        "Unable to verify this session. Try opening the link again."
      )}`
    );
  }

  const destination = await resolveAuthCallbackDestination(supabase, sp, user);
  redirect(destination);
}
