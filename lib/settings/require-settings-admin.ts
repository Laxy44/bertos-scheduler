import { redirect } from "next/navigation";

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

  const membershipQuery = await supabase
    .from("company_members")
    .select(
      `
        company_id,
        role,
        companies (
          id,
          name,
          cvr,
          timezone,
          week_starts_on,
          currency,
          default_hourly_wage,
          workspace_settings
        )
      `
    )
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("company_id", { ascending: true })
    .limit(2);

  if (membershipQuery.error) {
    console.error("[settings] membership", membershipQuery.error.message);
    redirect("/?message=Could not load workspace");
  }

  const rows = membershipQuery.data || [];
  if (rows.length > 1) {
    redirect("/workspace-conflict");
  }

  const row = rows[0];
  const companyId = row?.company_id ?? null;
  const membershipRole = (row?.role || "").trim();
  if (!companyId || !isCompanyAdminRole(membershipRole)) {
    redirect("/?message=Only workspace admins can change settings");
  }

  const rawCompany = row?.companies;
  const companyBundle = Array.isArray(rawCompany) ? rawCompany[0] : rawCompany;
  if (!companyBundle || typeof companyBundle !== "object" || !("id" in companyBundle)) {
    redirect("/create-company?message=Create a workspace first");
  }

  const company = companyBundle as CompanySettingsRow;
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
