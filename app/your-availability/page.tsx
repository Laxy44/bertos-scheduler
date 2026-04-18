import type { Metadata } from "next";
import { redirect } from "next/navigation";
import YourAvailabilityClient from "@/components/availability/YourAvailabilityClient";
import { getCachedWorkspaceForUser } from "@/lib/cached-workspace-load";
import { getLinkedProfileEmployee } from "@/lib/profile-employee";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Your availability",
  description: "Set your daily availability for scheduling",
};

type ProfileRow = {
  name?: string | null;
};

export default async function YourAvailabilityPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const [profileQuery, workspace] = await Promise.all([
    supabase.from("profiles").select("name").eq("id", user.id).maybeSingle(),
    getCachedWorkspaceForUser(user.id),
  ]);

  let profile: ProfileRow | null = null;
  if (!profileQuery.error) {
    profile = profileQuery.data;
  }

  if (workspace.kind === "conflict") {
    redirect("/workspace-conflict");
  }
  if (workspace.kind === "none") {
    redirect("/create-company");
  }

  const activeCompanyId = workspace.membership.company_id;
  const companyName = workspace.company?.name ?? null;

  const employeeRow = await getLinkedProfileEmployee(supabase, {
    userId: user.id,
    authEmail: user.email ?? null,
    companyId: activeCompanyId,
  });

  const employeeName = (employeeRow?.name || profile?.name || user.email || "").trim();
  const displayName = (profile?.name || user.email || "Team member").trim();

  const now = new Date();

  return (
    <YourAvailabilityClient
      userId={user.id}
      companyId={activeCompanyId}
      displayName={displayName}
      companyName={companyName}
      employeeName={employeeName}
      initialYear={now.getFullYear()}
      initialMonth={now.getMonth() + 1}
    />
  );
}
