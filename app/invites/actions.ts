"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../../lib/supabase-server";

type ActiveMembership = {
  company_id: string | null;
  role: string | null;
};

export async function createInvite(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const role = String(formData.get("role") || "employee").trim() || "employee";

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
    .limit(1)
    .maybeSingle<ActiveMembership>();

  if (membership.error || !membership.data?.company_id) {
    redirect("/create-company?message=Create a company before inviting employees");
  }

  const allowedRoles = new Set(["owner", "admin"]);
  if (!allowedRoles.has((membership.data.role || "").toLowerCase())) {
    redirect("/invites?message=Only company owners or admins can create invites");
  }

  const existingPending = await supabase
    .from("invites")
    .select("id")
    .eq("company_id", membership.data.company_id)
    .eq("email", email)
    .eq("status", "pending")
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (!existingPending.error && existingPending.data?.id) {
    redirect("/invites?message=Pending invite already exists for this email");
  }

  const inviteInsert = await supabase.from("invites").insert({
    email,
    company_id: membership.data.company_id,
    role,
    status: "pending",
  });

  if (inviteInsert.error) {
    redirect(`/invites?message=${encodeURIComponent(inviteInsert.error.message)}`);
  }

  redirect("/invites?message=Invite created");
}
