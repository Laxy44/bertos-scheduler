import type { Metadata } from "next";
import { redirect } from "next/navigation";
import EmployeeHomeSchedulePage from "@/components/employee-schedule/EmployeeHomeSchedulePage";
import { getCachedWorkspaceForUser } from "@/lib/cached-workspace-load";
import { getLinkedProfileEmployee } from "@/lib/profile-employee";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getDayNameFromDate } from "@/lib/utils";
import type { Shift } from "@/types/schedule";

export const metadata: Metadata = {
  title: "Your schedule",
  description: "Personal read-only schedule (your shifts only) for every workspace member",
};

type ProfileRow = {
  role?: string | null;
  name?: string | null;
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

  const activeCompanyId = workspace.membership.company_id;
  const companyName = workspace.company?.name ?? null;

  const employeeRow = await getLinkedProfileEmployee(supabase, {
    userId: user.id,
    authEmail: user.email ?? null,
    companyId: activeCompanyId,
  });

  // Personal page for every company member: shifts match linked employee row name, then profile name.
  const employeeName = (employeeRow?.name || profile?.name || user.email || "").trim();
  const hourlyRate = Number(employeeRow?.hourly_rate ?? 0);

  let shifts: Shift[] = [];
  if (employeeName) {
    const { data, error } = await supabase
      .from("shifts")
      .select("id, employee, date, role, start, end, notes, actual_start, actual_end, approved")
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
