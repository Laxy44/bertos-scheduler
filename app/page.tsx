import { after } from "next/server";
import { redirect } from "next/navigation";
import AppShell from "../components/layout/AppShell";
import LandingPage from "@/components/marketing/LandingPage";
import { getCachedWorkspaceForUser } from "@/lib/cached-workspace-load";
import { getLinkedProfileEmployee } from "@/lib/profile-employee";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { maybeSendWelcomeEmailForUser } from "../lib/welcome-email-trigger";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(value: string | string[] | undefined) {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

type ProfileRow = {
  role?: string | null;
  name?: string | null;
};

export default async function Page({ searchParams }: PageProps) {
  const sp = searchParams ? await searchParams : {};
  const launchGuidedSetup = readParam(sp.guided) === "1";

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return <LandingPage />;
  }

  const [profileQuery, workspace] = await Promise.all([
    supabase.from("profiles").select("role, name").eq("id", user.id).maybeSingle(),
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

  const { membership, company } = workspace;
  // Do not block first paint on welcome email (network) or invite link-up (admin round-trips).
  after(() => void maybeSendWelcomeEmailForUser(user));
  after(() =>
    void getLinkedProfileEmployee(supabase, {
      userId: user.id,
      authEmail: user.email ?? null,
      companyId: membership.company_id,
    })
  );

  const role = membership.role ?? profile?.role ?? "employee";
  const employeeName = profile?.name ?? user.email ?? "Unknown user";
  const activeCompanyId = membership.company_id;
  const companyName = company?.name ?? null;
  const companyCvr = company?.cvr ?? null;
  const companyWeekStartsOn =
    (company?.week_starts_on || "monday").toLowerCase() === "sunday" ? "sunday" : "monday";
  const companyCurrency = company?.currency ?? null;
  const rawWage = company?.default_hourly_wage;
  const companyDefaultHourlyWage =
    rawWage != null && !Number.isNaN(Number(rawWage)) ? Number(rawWage) : null;

  return (
    <AppShell
      role={role}
      employeeName={employeeName}
      companyName={companyName}
      companyCvr={companyCvr}
      activeCompanyId={activeCompanyId}
      companyWeekStartsOn={companyWeekStartsOn}
      companyCurrency={companyCurrency}
      companyDefaultHourlyWage={companyDefaultHourlyWage}
      launchGuidedSetup={launchGuidedSetup}
    />
  );
}
