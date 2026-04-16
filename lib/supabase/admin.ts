import { createClient } from "@supabase/supabase-js";

/**
 * Server-only admin client. Never use anon or publishable keys here.
 *
 * URL: `NEXT_PUBLIC_SUPABASE_URL` (required at build time for client) or `SUPABASE_URL` (server-only fallback).
 * Secret: `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SECRET_KEY`.
 *
 * If this throws in production, set these in your host (e.g. Vercel) — `.env.local` is not deployed.
 */
export function createSupabaseAdminClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim();

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim();

  if (!url) {
    throw new Error(
      "Missing Supabase URL: set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) in .env.local and restart the dev server; on Vercel add it to Environment Variables."
    );
  }
  if (!serviceRoleKey) {
    throw new Error(
      "Missing service role key: set SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) in .env.local and restart; on Vercel add it to Environment Variables (never NEXT_PUBLIC_*)."
    );
  }

  return createClient(url, serviceRoleKey);
}
