import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";

import { resolveAuthCallbackDestination } from "@/lib/auth-callback-redirect";
import { getLatestInviteByEmail } from "@/lib/workspace-invite-admin";

export async function resolveAuthCallbackDestinationServer(
  supabase: SupabaseClient,
  sp: URLSearchParams,
  user: User
): Promise<string> {
  return resolveAuthCallbackDestination(supabase, sp, user, getLatestInviteByEmail);
}
