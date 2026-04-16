"use client";

import { useLayoutEffect } from "react";

/**
 * Supabase implicit/link flows put tokens in the URL *fragment* (#access_token=…).
 * The server and proxy never see the hash, so users can be redirected to /login?message=…
 * while tokens remain only in the fragment. /login must not complete auth; forward once to
 * /auth/callback (single place for setSession + redirect).
 */
export function AuthEmailHashForward() {
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const path = window.location.pathname;
    if (path.startsWith("/auth/callback")) return;

    const hash = window.location.hash;
    if (!hash || hash.length < 2) return;

    const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
    if (!params.has("access_token") && !params.has("refresh_token")) return;

    window.location.replace(`/auth/callback${window.location.search}${hash}`);
  }, []);

  return null;
}
