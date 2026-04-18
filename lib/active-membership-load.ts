import type { SupabaseClient } from "@supabase/supabase-js";

import { authDebug } from "@/lib/auth-debug";

/** Active membership row (no embedded join — avoids RLS failures on nested `companies`). */
export type ActiveMembershipCore = {
  company_id: string;
  role: string | null;
  status: string | null;
};

/** Company row loaded in a second query when RLS allows. */
export type CompanyWorkspaceRow = {
  name: string | null;
  cvr: string | null;
  timezone: string | null;
  week_starts_on: string | null;
  currency: string | null;
  default_hourly_wage: number | null;
};

export type ActiveMembershipLoadResult =
  | { kind: "none" }
  | { kind: "conflict" }
  | { kind: "ok"; membership: ActiveMembershipCore; company: CompanyWorkspaceRow | null };

/**
 * Load the user's active workspace membership without embedding `companies`.
 * Nested selects can error or empty under RLS while `company_id` is still readable,
 * which previously caused `/` ↔ `/create-company` redirect loops with `proxy.ts`.
 */
export async function loadActiveMembershipAndCompany(
  supabase: SupabaseClient,
  userId: string
): Promise<ActiveMembershipLoadResult> {
  const base = await supabase
    .from("company_members")
    .select("company_id, role, status")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("company_id", { ascending: true })
    .limit(2);

  if (base.error) {
    authDebug("active-membership base query", {
      userId,
      error: base.error.message,
    });
    return { kind: "none" };
  }

  const rows = base.data || [];
  if (rows.length > 1) {
    return { kind: "conflict" };
  }

  const row = rows[0] as { company_id?: string | null; role?: string | null; status?: string | null } | undefined;
  const companyId = row?.company_id;
  if (!companyId) {
    return { kind: "none" };
  }

  const companyRes = await supabase
    .from("companies")
    .select("name, cvr, timezone, week_starts_on, currency, default_hourly_wage")
    .eq("id", companyId)
    .maybeSingle<CompanyWorkspaceRow>();

  if (companyRes.error) {
    authDebug("active-membership company query", {
      userId,
      companyId,
      error: companyRes.error.message,
    });
  }

  const company = companyRes.error || !companyRes.data ? null : companyRes.data;

  return {
    kind: "ok",
    membership: {
      company_id: companyId,
      role: row?.role ?? null,
      status: row?.status ?? null,
    },
    company,
  };
}
