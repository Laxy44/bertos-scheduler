import type { SupabaseClient, User } from "@supabase/supabase-js";

/** Only allow same-origin path redirects (SaaS-safe, no open redirects). */
export function getSafeNextPath(nextParam: string | null): string | null {
  if (!nextParam) return null;
  let path: string;
  try {
    path = decodeURIComponent(nextParam.trim());
  } catch {
    return null;
  }
  const pathOnly = path.split("?")[0] ?? "";
  if (!pathOnly.startsWith("/") || pathOnly.startsWith("//") || pathOnly.includes("://")) {
    return null;
  }
  return pathOnly;
}

/**
 * Where to send the user after /auth/callback once a session exists.
 * Shared by server callback page and client hash fallback.
 */
export async function resolveAuthCallbackDestination(
  supabase: SupabaseClient,
  sp: URLSearchParams,
  user: User
): Promise<string> {
  const flowRaw = sp.get("flow");
  const flow = flowRaw || "default";
  const typeParam = sp.get("type");
  const nextRaw = sp.get("next");
  const emailFromQuery = sp.get("email");

  if (flow === "recovery" || typeParam === "recovery") {
    return "/reset-password";
  }

  const nextPath = getSafeNextPath(nextRaw);
  if (nextPath) {
    const out = new URLSearchParams();
    sp.forEach((value, key) => {
      if (key === "code" || key === "next" || key === "state" || key === "flow") return;
      out.set(key, value);
    });
    if (
      (nextPath === "/join-invite" || nextPath === "/complete-account") &&
      !out.has("verified")
    ) {
      out.set("verified", "1");
    }
    const q = out.toString();
    return q ? `${nextPath}?${q}` : nextPath;
  }

  if (flow === "invite" || typeParam === "invite") {
    const safeEmail = (emailFromQuery || user.email || "").trim().toLowerCase();
    return safeEmail
      ? `/complete-account?email=${encodeURIComponent(safeEmail)}&verified=1`
      : "/complete-account?verified=1";
  }

  if (flow === "signup" || typeParam === "signup") {
    return "/login?confirmed=1";
  }

  if (flow === "account-ready") {
    return `/login?message=${encodeURIComponent(
      "Your account is active. Sign in with your email and password."
    )}`;
  }

  const membership = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle<{ company_id: string | null }>();

  if (!membership.error && membership.data?.company_id) {
    return "/";
  }

  return "/create-company";
}
