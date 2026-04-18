import { redirect } from "next/navigation";

import { getCachedWorkspaceForUser } from "@/lib/cached-workspace-load";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { isCompanyAdminRole } from "@/lib/workspace-role";

import { parseWorkspaceSettings, type WorkspaceSettingsDoc } from "./workspace-settings";

export type CompanySettingsRow = {
  id: string;
  name: string | null;
  cvr: string | null;
  timezone: string | null;
  week_starts_on: string | null;
  currency: string | null;
  default_hourly_wage: number | null;
  workspace_settings: unknown;
};

export type SettingsAdminContext = {
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;
  userId: string;
  companyId: string;
  membershipRole: string;
  company: CompanySettingsRow;
  workspaceSettings: WorkspaceSettingsDoc;
};

export async function requireSettingsAdmin(): Promise<SettingsAdminContext> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?message=Please log in to open settings");
  }

  const workspace = await getCachedWorkspaceForUser(user.id);
  if (workspace.kind === "conflict") {
    redirect("/workspace-conflict");
  }
  if (workspace.kind === "none") {
    redirect("/create-company?message=Create a workspace first");
  }

  const companyId = workspace.membership.company_id;
  const membershipRole = (workspace.membership.role || "").trim();
  if (!isCompanyAdminRole(membershipRole)) {
    redirect("/app?message=Only workspace admins can change settings");
  }

  const companyRes = await supabase
    .from("companies")
    .select(
      "id, name, cvr, timezone, week_starts_on, currency, default_hourly_wage, workspace_settings"
    )
    .eq("id", companyId)
    .maybeSingle<CompanySettingsRow>();

  if (companyRes.error) {
    console.error("[settings] company", companyRes.error.message);
    redirect("/app?message=Could not load workspace");
  }

  if (!companyRes.data) {
    redirect("/app?message=Could not load workspace");
  }

  const company = companyRes.data;
  const workspaceSettings = parseWorkspaceSettings(company.workspace_settings);

  return {
    supabase,
    userId: user.id,
    companyId,
    membershipRole,
    company,
    workspaceSettings,
  };
}
