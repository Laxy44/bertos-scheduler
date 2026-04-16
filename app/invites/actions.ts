"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../../lib/supabase-server";
import { getSiteUrl } from "../../lib/site-url";
import { sendEmployeeInviteEmail } from "../../lib/invite-email";

type ActiveMembership = {
  company_id: string | null;
  role: string | null;
};

export async function createInvite(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const requestedRole = String(formData.get("role") || "employee").trim().toLowerCase();
  const allowedInviteRoles = new Set(["employee", "admin"]);
  const role = allowedInviteRoles.has(requestedRole) ? requestedRole : "employee";
  const origin = getSiteUrl();

  if (!email) {
    redirect("/invites?message=Employee email is required");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?message=Please log in to create invites");
  }

  const membership = await supabase
    .from("company_members")
    .select("company_id, role")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("company_id", { ascending: true })
    .limit(2);

  if (membership.error || !(membership.data || []).length) {
    redirect("/create-company?message=Create a company before inviting employees");
  }

  if ((membership.data || []).length > 1) {
    redirect("/workspace-conflict");
  }

  const activeMembership = membership.data![0] as ActiveMembership;

  const allowedRoles = new Set(["owner", "admin"]);
  if (!allowedRoles.has((activeMembership.role || "").toLowerCase())) {
    redirect("/invites?message=Only company owners or admins can create invites");
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
    redirect("/invites?message=Pending invite already exists for this email");
  }

  const inviteInsert = await supabase.from("invites").insert({
    email,
    company_id: activeMembership.company_id,
    role,
    status: "pending",
  });

  if (inviteInsert.error) {
    redirect(`/invites?message=${encodeURIComponent(inviteInsert.error.message)}`);
  }

  const inviteEmail = await sendEmployeeInviteEmail(supabase, email, origin);

  if (inviteEmail.error) {
    redirect(
      `/invites?message=Invite saved, but email failed: ${encodeURIComponent(inviteEmail.error.message)}`
    );
  }

  redirect("/invites?message=Invite created and email sent");
}

export async function cancelInvite(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const inviteId = String(formData.get("inviteId") || "").trim();

  if (!inviteId) {
    redirect("/invites?message=Invite id is required");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?message=Please log in to manage invites");
  }

  const membership = await supabase
    .from("company_members")
    .select("company_id, role")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("company_id", { ascending: true })
    .limit(2);

  if (membership.error || !(membership.data || []).length) {
    redirect("/create-company?message=Create a company first");
  }

  if ((membership.data || []).length > 1) {
    redirect("/workspace-conflict");
  }

  const activeMembership = membership.data![0] as ActiveMembership;

  const allowedRoles = new Set(["owner", "admin"]);
  if (!allowedRoles.has((activeMembership.role || "").toLowerCase())) {
    redirect("/invites?message=Only company owners or admins can manage invites");
  }

  const deleteResult = await supabase
    .from("invites")
    .delete()
    .eq("id", inviteId)
    .eq("company_id", activeMembership.company_id)
    .eq("status", "pending");

  if (deleteResult.error) {
    redirect(`/invites?message=${encodeURIComponent(deleteResult.error.message)}`);
  }

  redirect("/invites?message=Invite cancelled");
}

export async function resendInvite(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const inviteId = String(formData.get("inviteId") || "").trim();
  const inviteEmail = String(formData.get("inviteEmail") || "").trim().toLowerCase();
  const origin = getSiteUrl();

  if (!inviteId || !inviteEmail) {
    redirect("/invites?message=Invite id and email are required");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?message=Please log in to manage invites");
  }

  const membership = await supabase
    .from("company_members")
    .select("company_id, role")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("company_id", { ascending: true })
    .limit(2);

  if (membership.error || !(membership.data || []).length) {
    redirect("/create-company?message=Create a company first");
  }

  if ((membership.data || []).length > 1) {
    redirect("/workspace-conflict");
  }

  const activeMembership = membership.data![0] as ActiveMembership;
  const allowedRoles = new Set(["owner", "admin"]);
  if (!allowedRoles.has((activeMembership.role || "").toLowerCase())) {
    redirect("/invites?message=Only company owners or admins can manage invites");
  }

  const invite = await supabase
    .from("invites")
    .select("id")
    .eq("id", inviteId)
    .eq("company_id", activeMembership.company_id)
    .eq("email", inviteEmail)
    .eq("status", "pending")
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (invite.error || !invite.data?.id) {
    redirect("/invites?message=Pending invite not found");
  }

  const resend = await sendEmployeeInviteEmail(supabase, inviteEmail, origin);

  if (resend.error) {
    redirect(`/invites?message=Resend failed: ${encodeURIComponent(resend.error.message)}`);
  }

  redirect("/invites?message=Invite email resent");
}
