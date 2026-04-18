import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ContractedHoursClient from "@/components/contracted-hours/ContractedHoursClient";
import { getCachedWorkspaceForUser } from "@/lib/cached-workspace-load";
import { isCompanyAdminRole } from "@/lib/workspace-role";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { addDays, getDayNameFromDate, startOfWeek, toDateInputValue } from "@/lib/utils";
import type { Shift } from "@/types/schedule";

export const metadata: Metadata = {
  title: "Contracted hours",
  description: "Weekly targets vs planned hours from the schedule",
};

function mapRowToShift(row: Record<string, unknown>): Shift {
  return {
    id: String(row.id),
    employee: String(row.employee ?? ""),
    day: getDayNameFromDate(String(row.date)),
    role: String(row.role ?? ""),
    start: String(row.start ?? ""),
    end: String(row.end ?? ""),
    notes: String(row.notes ?? ""),
    date: String(row.date ?? ""),
    actualStart: row.actual_start ? String(row.actual_start) : undefined,
    actualEnd: row.actual_end ? String(row.actual_end) : undefined,
    approved: Boolean(row.approved),
  };
}

export default async function ContractedHoursPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const workspace = await getCachedWorkspaceForUser(user.id);
  if (workspace.kind === "conflict") {
    redirect("/workspace-conflict");
  }
  if (workspace.kind === "none") {
    redirect("/create-company");
  }

  const activeCompanyId = workspace.membership.company_id;
  const companyName = workspace.company?.name ?? null;

  const workspaceRole = (workspace.membership.role || "").trim();
  if (!isCompanyAdminRole(workspaceRole)) {
    redirect("/your-schedule");
  }

  const ws = startOfWeek(new Date());
  const from = toDateInputValue(ws);
  const to = toDateInputValue(addDays(ws, 6));

  const [empResult, shiftResult] = await Promise.all([
    supabase
      .from("employees")
      .select("name, active")
      .eq("company_id", activeCompanyId)
      .order("name", { ascending: true }),
    supabase
      .from("shifts")
      .select("*")
      .eq("company_id", activeCompanyId)
      .gte("date", from)
      .lte("date", to)
      .order("date", { ascending: true })
      .order("start", { ascending: true }),
  ]);

  if (empResult.error) {
    redirect("/");
  }

  const employees = (empResult.data || []).map((r) => ({
    name: String(r.name),
    active: Boolean(r.active),
  }));

  const shiftsThisWeek: Shift[] =
    !shiftResult.error && shiftResult.data
      ? shiftResult.data.map((row) => mapRowToShift(row as Record<string, unknown>))
      : [];

  return (
    <ContractedHoursClient
      companyId={activeCompanyId}
      companyName={companyName}
      employees={employees}
      shiftsThisWeek={shiftsThisWeek}
    />
  );
}
