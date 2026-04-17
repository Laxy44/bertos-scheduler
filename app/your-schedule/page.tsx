import type { Metadata } from "next";
import { redirect } from "next/navigation";
import EmployeeHomeSchedulePage from "@/components/employee-schedule/EmployeeHomeSchedulePage";
import { getLinkedProfileEmployee } from "@/lib/profile-employee";
import { isCompanyAdminRole } from "@/lib/workspace-role";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getDayNameFromDate } from "@/lib/utils";
import type { Shift } from "@/types/schedule";

export const metadata: Metadata = {
  title: "Your schedule",
  description: "Personal read-only schedule overview",
};

type ProfileRow = {
  role?: string | null;
  name?: string | null;
};

type CompanyMemberRow = {
  company_id?: string | null;
  role?: string | null;
  status?: string | null;
  companies?:
    | { name?: string | null; cvr?: string | null }
    | { name?: string | null; cvr?: string | null }[]
    | null;
};

function mapRowToShift(shift: Record<string, unknown>): Shift {
  return {
    id: String(shift.id),
    employee: String(shift.employee ?? ""),
    day: getDayNameFromDate(String(shift.date)),
    role: String(shift.role ?? ""),
    start: String(shift.start ?? ""),
    end: String(shift.end ?? ""),
    notes: String(shift.notes ?? ""),
    date: String(shift.date ?? ""),
    actualStart: shift.actual_start ? String(shift.actual_start) : undefined,
    actualEnd: shift.actual_end ? String(shift.actual_end) : undefined,
    approved: Boolean(shift.approved),
  };
}

export default async function YourSchedulePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  let profile: ProfileRow | null = null;
  const profileQuery = await supabase.from("profiles").select("role, name").eq("id", user.id).maybeSingle();
  if (!profileQuery.error) {
    profile = profileQuery.data;
  }

  const membershipQuery = await supabase
    .from("company_members")
    .select(
      `
        company_id,
        role,
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
  const role = membership?.role ?? profile?.role ?? "employee";
  const companyRow = Array.isArray(membership?.companies) ? membership?.companies[0] : membership?.companies;
  const companyName = companyRow?.name ?? null;

  if (!activeCompanyId) {
    redirect("/create-company");
  }

  if (isCompanyAdminRole(role)) {
    redirect("/");
  }

  const employeeRow = await getLinkedProfileEmployee(supabase, {
    userId: user.id,
    authEmail: user.email ?? null,
    companyId: activeCompanyId,
  });

  const employeeName = (employeeRow?.name || profile?.name || user.email || "").trim();
  const hourlyRate = Number(employeeRow?.hourly_rate ?? 0);

  let shifts: Shift[] = [];
  if (employeeName) {
    const { data, error } = await supabase
      .from("shifts")
      .select("*")
      .eq("company_id", activeCompanyId)
      .eq("employee", employeeName)
      .order("date", { ascending: true })
      .order("start", { ascending: true });

    if (!error && data) {
      shifts = data.map((row) => mapRowToShift(row as Record<string, unknown>));
    }
  }

  const displayName = (profile?.name || user.email || "Team member").trim();

  return (
    <EmployeeHomeSchedulePage
      shifts={shifts}
      hourlyRate={hourlyRate}
      employeeDisplayName={displayName}
      companyName={companyName}
    />
  );
}
