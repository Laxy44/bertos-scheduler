import type { Metadata } from "next";
import { redirect } from "next/navigation";
import YourAvailabilityClient from "@/components/availability/YourAvailabilityClient";
import { getLinkedProfileEmployee } from "@/lib/profile-employee";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Your availability",
  description: "Set your daily availability for scheduling",
};

type ProfileRow = {
  name?: string | null;
};

type CompanyMemberRow = {
  company_id?: string | null;
  status?: string | null;
  companies?:
    | { name?: string | null; cvr?: string | null }
    | { name?: string | null; cvr?: string | null }[]
    | null;
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

  let profile: ProfileRow | null = null;
  const profileQuery = await supabase.from("profiles").select("name").eq("id", user.id).maybeSingle();
  if (!profileQuery.error) {
    profile = profileQuery.data;
  }

  const membershipQuery = await supabase
    .from("company_members")
    .select(
      `
        company_id,
        status,
        companies ( name, cvr )
      `
    )
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("company_id", { ascending: true })
    .limit(2);

  if (!membershipQuery.error && (membershipQuery.data || []).length > 1) {
    redirect("/workspace-conflict");
  }

  const membership = membershipQuery.data?.[0] as CompanyMemberRow | undefined;
  const activeCompanyId = membership?.company_id ?? null;
  const companyRow = Array.isArray(membership?.companies) ? membership?.companies[0] : membership?.companies;
  const companyName = companyRow?.name ?? null;

  if (!activeCompanyId) {
    redirect("/create-company");
  }

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
