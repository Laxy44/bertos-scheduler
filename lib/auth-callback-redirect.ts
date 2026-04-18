import type { SupabaseClient, User } from "@supabase/supabase-js";

import type { WorkspaceInviteRow } from "@/lib/workspace-invite-types";
import { isInviteRowExpired } from "@/lib/workspace-invite-types";

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

type InviteLookup = (email: string) => Promise<WorkspaceInviteRow | null>;

/**
 * Where to send the user after /auth/callback once a session exists.
 * - Server callback: pass `lookupInvite` = getLatestInviteByEmail (service role).
 * - Client hash fallback: omit `lookupInvite` — URL params (next, flow, email) still route
 *   invitees correctly; DB-backed expiry checks run on the next server navigation.
 */
export async function resolveAuthCallbackDestination(
  supabase: SupabaseClient,
  sp: URLSearchParams,
  user: User,
  lookupInvite?: InviteLookup
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

    if (nextPath === "/complete-account" && lookupInvite) {
      const targetEmail = (out.get("email") || emailFromQuery || user.email || "")
        .trim()
        .toLowerCase();
      if (targetEmail) {
        const inv = await lookupInvite(targetEmail);
        if (inv?.status === "pending" && isInviteRowExpired(inv)) {
          return `/invite-link-expired?email=${encodeURIComponent(targetEmail)}&reason=window`;
        }
        if (inv?.status === "accepted") {
          return `/login?message=${encodeURIComponent(
            "You have already joined this workspace. Sign in with your email and password."
          )}`;
        }
        if (inv?.status === "expired" || inv?.status === "revoked") {
          return `/invite-link-expired?email=${encodeURIComponent(targetEmail)}&reason=${encodeURIComponent(inv.status)}`;
        }
      }
    }

    const q = out.toString();
    return q ? `${nextPath}?${q}` : nextPath;
  }

  if (flow === "invite" || typeParam === "invite") {
    const safeEmail = (emailFromQuery || user.email || "").trim().toLowerCase();
    if (safeEmail && lookupInvite) {
      const inv = await lookupInvite(safeEmail);
      if (inv?.status === "pending" && isInviteRowExpired(inv)) {
        return `/invite-link-expired?email=${encodeURIComponent(safeEmail)}&reason=window`;
      }
      if (inv?.status === "pending") {
        return `/complete-account?email=${encodeURIComponent(safeEmail)}&verified=1`;
      }
      if (inv?.status === "accepted") {
        return `/login?message=${encodeURIComponent(
          "You have already joined this workspace. Sign in with your email and password."
        )}`;
      }
      if (inv?.status === "expired" || inv?.status === "revoked") {
        return `/invite-link-expired?email=${encodeURIComponent(safeEmail)}&reason=${encodeURIComponent(inv.status)}`;
      }
    }
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
    return "/app";
  }

  const authEmail = (user.email || "").trim().toLowerCase();
  if (authEmail && lookupInvite) {
    const inv = await lookupInvite(authEmail);
    if (inv?.status === "pending") {
      if (isInviteRowExpired(inv)) {
        return `/invite-link-expired?email=${encodeURIComponent(authEmail)}&reason=window`;
      }
      return `/complete-account?email=${encodeURIComponent(authEmail)}&verified=1`;
    }
    if (inv?.status === "accepted") {
      return `/login?message=${encodeURIComponent(
        "You have already joined this workspace. Sign in with your email and password."
      )}`;
    }
    if (inv?.status === "expired" || inv?.status === "revoked") {
      return `/invite-link-expired?email=${encodeURIComponent(authEmail)}&reason=${encodeURIComponent(inv.status)}`;
    }
  }

  return "/create-company";
}
