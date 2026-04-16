import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-side Supabase client.
// Keep this file focused only on creating the SSR client.
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ignored in places where setting cookies is not allowed
          }
        },
      },
    }
  );

  // Hydrate in-memory session from cookie storage so getUser/updateUser see the same session.
  await client.auth.getSession();

  return client;
}

// Backward-compatible alias while the app is being refactored.
export const createClient = createServerSupabaseClient;
