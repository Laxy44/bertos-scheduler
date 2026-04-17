import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../lib/supabase-server";
import AppShell from "../components/layout/AppShell";
import { maybeSendWelcomeEmailForUser } from "../lib/welcome-email-trigger";

type ProfileRow = {
  role?: string | null;
  name?: string | null;
};

type CompanyMemberRow = {
  company_id?: string | null;
  role?: string | null;
  status?: string | null;
  companies?:
    | {
        name?: string | null;
        cvr?: string | null;
      }
    | {
    name?: string | null;
    cvr?: string | null;
      }[]
    | null;
};

export default async function Page() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  // First authenticated load hook: sends welcome email once after confirmed email.
  await maybeSendWelcomeEmailForUser(user);

  let profile: ProfileRow | null = null;
  let membership: CompanyMemberRow | null = null;

  const profileQuery = await supabase
    .from("profiles")
    .select("role, name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profileQuery.error) {
    profile = profileQuery.data;
  }

  // Transitional multi-company lookup.
  // This safely checks whether the user already belongs to a company workspace.
  // If the SaaS tables are not ready yet, the app still falls back gracefully.
  const membershipQuery = await supabase
    .from("company_members")
    .select(
      `
        company_id,
        role,
        status,
        companies (
          name,
          cvr
        )
      `
    )
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("company_id", { ascending: true })
    .limit(2);

  if (!membershipQuery.error) {
    const rows = membershipQuery.data || [];
    if (rows.length > 1) {
      redirect("/workspace-conflict");
    }
    membership = rows[0] ?? null;
  }

  // During transition:
  // 1. prefer company_members.role when available
  // 2. fall back to profiles.role for older data
  const role = membership?.role ?? profile?.role ?? "employee";
  const employeeName = profile?.name ?? user.email ?? "Unknown user";
  const activeCompanyId = membership?.company_id ?? null;
  const companyRow = Array.isArray(membership?.companies)
    ? membership?.companies[0]
    : membership?.companies;
  const companyName = companyRow?.name ?? null;
  const companyCvr = companyRow?.cvr ?? null;

  if (!activeCompanyId) {
    redirect("/create-company");
  }

  return (
    <AppShell
      role={role}
      employeeName={employeeName}
      companyName={companyName}
      companyCvr={companyCvr}
      activeCompanyId={activeCompanyId}
    />
  );
}
