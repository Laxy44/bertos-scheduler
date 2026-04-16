/**
 * Callback-first auth redirect targets for Supabase emails / APIs.
 * Use `new URL("/auth/callback", origin)` so the path is never omitted (never site root only).
 *
 * Supabase Dashboard → Authentication → URL Configuration:
 * - Site URL: `https://<host>` (no /login). Do not set Site URL to /login — fragments + redirects
 *   will strand tokens on /login; use `AuthEmailHashForward` as a safety net.
 * - Redirect URLs: MUST include `https://<host>/auth/callback` (and localhost for dev).
 *   If `/auth/callback` is missing, Supabase may fall back to Site URL only; implicit tokens
 *   then hit `/` and middleware redirects to `/login#access_token=…` (hash invisible to server).
 *
 * Email templates should use ConfirmationURL / redirect_to to this app’s `/auth/callback`, not raw Site URL only.
 */

function authCallbackUrl(origin: string): URL {
  const base = origin.trim().replace(/\/$/, "");
  if (!/^https?:\/\//i.test(base)) {
    throw new Error(`Invalid site origin for auth callback: ${origin}`);
  }
  return new URL("/auth/callback", `${base}/`);
}

/** Employee invite: session at /auth/callback, then /complete-account with email. */
export function buildInviteEmailRedirectUrl(origin: string, email: string): string {
  const url = authCallbackUrl(origin);
  const normalized = email.trim().toLowerCase();
  url.searchParams.set("next", "/complete-account");
  url.searchParams.set("email", normalized);
  url.searchParams.set("flow", "invite");
  return url.toString();
}

/** Owner email confirmation after signUp. */
export function buildSignupEmailRedirectUrl(origin: string): string {
  const url = authCallbackUrl(origin);
  url.searchParams.set("flow", "signup");
  return url.toString();
}

/** Password recovery email. */
export function buildRecoveryEmailRedirectUrl(origin: string): string {
  const url = authCallbackUrl(origin);
  url.searchParams.set("flow", "recovery");
  return url.toString();
}
