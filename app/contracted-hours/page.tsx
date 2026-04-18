import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ContractedHoursClient from "@/components/contracted-hours/ContractedHoursClient";
import { isCompanyAdminRole } from "@/lib/workspace-role";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { addDays, getDayNameFromDate, startOfWeek, toDateInputValue } from "@/lib/utils";
import type { Shift } from "@/types/schedule";

export const metadata: Metadata = {
  title: "Contracted hours",
  description: "Weekly targets vs planned hours from the schedule",
};

type CompanyMemberRow = {
  company_id?: string | null;
  role?: string | null;
  status?: string | null;
  companies?: { name?: string | null } | { name?: string | null }[] | null;
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

  const membershipQuery = await supabase
    .from("company_members")
    .select(
      `
        company_id,
        role,
        status,
        companies ( name )
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

  const workspaceRole = (membership?.role || "").trim();
  if (!isCompanyAdminRole(workspaceRole)) {
    redirect("/your-schedule");
  }

  const { data: empRows, error: empError } = await supabase
    .from("employees")
    .select("name, active")
    .eq("company_id", activeCompanyId)
    .order("name", { ascending: true });

  if (empError) {
    redirect("/");
  }

  const employees = (empRows || []).map((r) => ({
    name: String(r.name),
    active: Boolean(r.active),
  }));

  const ws = startOfWeek(new Date());
  const from = toDateInputValue(ws);
  const to = toDateInputValue(addDays(ws, 6));

  const { data: shiftRows, error: shiftError } = await supabase
    .from("shifts")
    .select("*")
    .eq("company_id", activeCompanyId)
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: true })
    .order("start", { ascending: true });

  const shiftsThisWeek: Shift[] =
    !shiftError && shiftRows ? shiftRows.map((row) => mapRowToShift(row as Record<string, unknown>)) : [];

  return (
    <ContractedHoursClient
      companyId={activeCompanyId}
      companyName={companyName}
      employees={employees}
      shiftsThisWeek={shiftsThisWeek}
    />
  );
}
