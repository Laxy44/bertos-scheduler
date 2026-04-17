import type { SupabaseClient } from "@supabase/supabase-js";
import { getSiteUrl } from "@/lib/site-url";
import { sendEmployeeInviteEmail } from "@/lib/invite-email";

type ActiveMembership = {
  company_id: string | null;
  role: string | null;
};

export type AppInviteRole = "employee" | "admin";

export type CreatePendingInviteResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Inserts a pending invite for the inviter's company and sends the Supabase invite email.
 * Mirrors server rules from `app/invites/actions.ts` `createInvite`.
 */
export async function createPendingInviteAndSendEmail(
  supabase: SupabaseClient,
  userId: string,
  params: { email: string; role: AppInviteRole }
): Promise<CreatePendingInviteResult> {
  const email = params.email.trim().toLowerCase();
  const role = params.role;
  const origin = getSiteUrl();

  if (!email) {
    return { ok: false, error: "Employee email is required" };
  }

  const membership = await supabase
    .from("company_members")
    .select("company_id, role")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("company_id", { ascending: true })
    .limit(2);

  if (membership.error || !(membership.data || []).length) {
    return { ok: false, error: "Create a company before inviting employees" };
  }

  if ((membership.data || []).length > 1) {
    return { ok: false, error: "Workspace conflict" };
  }

  const activeMembership = membership.data![0] as ActiveMembership;

  const allowedRoles = new Set(["owner", "admin"]);
  if (!allowedRoles.has((activeMembership.role || "").toLowerCase())) {
    return { ok: false, error: "Only company owners or admins can create invites" };
  }

  const existingPending = await supabase
    .from("invites")
    .select("id")
    .eq("company_id", activeMembership.company_id)
    .eq("email", email)
    .eq("status", "pending")
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (!existingPending.error && existingPending.data?.id) {
    return { ok: false, error: "Pending invite already exists for this email" };
  }

  const inviteInsert = await supabase.from("invites").insert({
    email,
    company_id: activeMembership.company_id,
    role,
    status: "pending",
  });

  if (inviteInsert.error) {
    return { ok: false, error: inviteInsert.error.message };
  }

  const inviteEmail = await sendEmployeeInviteEmail(supabase, email, origin);

  if (inviteEmail.error) {
    return {
      ok: false,
      error: `Invite saved, but email failed: ${inviteEmail.error.message}`,
    };
  }

  return { ok: true };
}
