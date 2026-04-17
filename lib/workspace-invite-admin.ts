import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { WorkspaceInviteRow } from "@/lib/workspace-invite-types";

/**
 * Latest invite row for an email (any status), using the service role so it works
 * before the user has company membership or when RLS hides `invites`.
 */
export async function getLatestInviteByEmail(email: string): Promise<WorkspaceInviteRow | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;

  let admin: ReturnType<typeof createSupabaseAdminClient>;
  try {
    admin = createSupabaseAdminClient();
  } catch {
    return null;
  }

  const { data, error } = await admin
    .from("invites")
    .select("id, email, company_id, role, status, created_at, expires_at")
    .eq("email", normalized)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<WorkspaceInviteRow>();

  if (error || !data) return null;
  return data;
}

export async function linkEmployeeUserToAuthUser(params: {
  companyId: string;
  userId: string;
  email: string;
}): Promise<void> {
  const email = params.email.trim().toLowerCase();
  if (!email) return;

  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin
      .from("employees")
      .update({ user_id: params.userId })
      .eq("company_id", params.companyId)
      .eq("email", email)
      .is("user_id", null);

    if (error) {
      console.warn("[workspace-invite-admin] employee user_id link skipped", error.message);
    }
  } catch (e) {
    console.warn("[workspace-invite-admin] employee user_id link failed", e);
  }
}
