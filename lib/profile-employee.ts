import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type ProfileEmployeeRow = {
  id: string;
  company_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  hourly_rate: number | null;
  default_role: string | null;
  unavailable_dates: unknown;
  active: boolean | null;
  user_id: string | null;
};

export function mapEmployeeRowToView(row: ProfileEmployeeRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? "",
    phone: row.phone ?? "",
    hourlyRate: Number(row.hourly_rate ?? 0),
    defaultRole: row.default_role ?? "Service",
    active: row.active !== false,
  };
}

/**
 * Returns the employee row for the current user in the given company.
 * If none is linked by user_id but exactly one row matches the auth email (case-insensitive)
 * with user_id still null, links that row to the user (via service role) and returns it.
 */
export async function getLinkedProfileEmployee(
  supabase: SupabaseClient,
  params: { userId: string; authEmail: string | null; companyId: string }
): Promise<ProfileEmployeeRow | null> {
  const { userId, authEmail, companyId } = params;

  const byUser = await supabase
    .from("employees")
    .select("*")
    .eq("company_id", companyId)
    .eq("user_id", userId)
    .maybeSingle<ProfileEmployeeRow>();

  if (byUser.error) {
    console.error("[profile-employee] load by user_id", byUser.error.message);
    return null;
  }

  if (byUser.data) {
    return byUser.data;
  }

  const normalizedEmail = (authEmail || "").trim().toLowerCase();
  if (!normalizedEmail) {
    return null;
  }

  let admin: ReturnType<typeof createSupabaseAdminClient>;
  try {
    admin = createSupabaseAdminClient();
  } catch {
    return null;
  }

  const candidates = await admin
    .from("employees")
    .select("*")
    .eq("company_id", companyId)
    .is("user_id", null);

  if (candidates.error || !candidates.data?.length) {
    return null;
  }

  const pool = candidates.data as ProfileEmployeeRow[];
  const rows = pool.filter(
    (row) => (row.email || "").trim().toLowerCase() === normalizedEmail
  );
  if (rows.length !== 1) {
    return null;
  }

  const claimed = await admin
    .from("employees")
    .update({ user_id: userId })
    .eq("id", rows[0].id)
    .eq("company_id", companyId)
    .is("user_id", null)
    .select("*")
    .maybeSingle<ProfileEmployeeRow>();

  if (claimed.error || !claimed.data) {
    console.error("[profile-employee] claim by email", claimed.error?.message);
    return null;
  }

  return claimed.data;
}
