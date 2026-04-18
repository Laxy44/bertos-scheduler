"use server";

import { revalidatePath } from "next/cache";

import { requireSettingsAdmin } from "@/lib/settings/require-settings-admin";
import {
  newShiftTypeId,
  type EmployeeWorkspaceSlice,
  type ScheduleWorkspaceSlice,
  type WorkspaceSettingsDoc,
} from "@/lib/settings/workspace-settings";

type ActionResult = { ok: true } | { ok: false; error: string };

function isMissingColumnError(message: string) {
  const m = message.toLowerCase();
  return m.includes("column") && m.includes("does not exist");
}

export async function updateGeneralSettingsAction(input: {
  companyName: string;
  timezone: string;
  weekStartsOn: "monday" | "sunday";
}): Promise<ActionResult> {
  const { supabase, companyId } = await requireSettingsAdmin();
  const name = String(input.companyName || "").trim();
  if (!name) {
    return { ok: false, error: "Company name is required." };
  }
  const tz = String(input.timezone || "").trim() || "Europe/Copenhagen";
  const week = input.weekStartsOn === "sunday" ? "sunday" : "monday";

  const { error } = await supabase
    .from("companies")
    .update({
      name,
      timezone: tz,
      week_starts_on: week,
    })
    .eq("id", companyId);

  if (error) {
    if (isMissingColumnError(error.message)) {
      return {
        ok: false,
        error:
          "Database is missing new columns. Apply migration `20260423_company_workspace_settings.sql` in Supabase.",
      };
    }
    return { ok: false, error: error.message };
  }
  revalidatePath("/app");
  revalidatePath("/app/settings");
  return { ok: true };
}

export async function updatePayrollSettingsAction(input: {
  currency: string;
  defaultHourlyWage: string;
}): Promise<ActionResult> {
  const { supabase, companyId } = await requireSettingsAdmin();
  const currency = String(input.currency || "DKK")
    .trim()
    .toUpperCase()
    .slice(0, 8);
  if (!/^[A-Z]{3}$/.test(currency)) {
    return { ok: false, error: "Use a 3-letter currency code (e.g. DKK, EUR)." };
  }
  const wageRaw = String(input.defaultHourlyWage || "").trim();
  const default_hourly_wage =
    wageRaw === "" ? null : Number.parseFloat(wageRaw.replace(",", "."));
  if (default_hourly_wage != null && (Number.isNaN(default_hourly_wage) || default_hourly_wage < 0)) {
    return { ok: false, error: "Default wage must be empty or a valid number ≥ 0." };
  }

  const { error } = await supabase
    .from("companies")
    .update({
      currency,
      default_hourly_wage: default_hourly_wage,
    })
    .eq("id", companyId);

  if (error) {
    if (isMissingColumnError(error.message)) {
      return {
        ok: false,
        error:
          "Database is missing new columns. Apply migration `20260423_company_workspace_settings.sql` in Supabase.",
      };
    }
    return { ok: false, error: error.message };
  }
  revalidatePath("/app");
  revalidatePath("/app/settings");
  return { ok: true };
}

function mergeWorkspaceSettings(
  current: WorkspaceSettingsDoc,
  patch: Partial<WorkspaceSettingsDoc>
): WorkspaceSettingsDoc {
  return {
    ...current,
    schedule: patch.schedule
      ? { ...current.schedule, ...patch.schedule }
      : current.schedule,
    employee: patch.employee
      ? { ...current.employee, ...patch.employee }
      : current.employee,
  };
}

export async function updateScheduleSettingsAction(input: {
  schedule: ScheduleWorkspaceSlice;
}): Promise<ActionResult> {
  const { supabase, companyId, workspaceSettings } = await requireSettingsAdmin();
  const next = mergeWorkspaceSettings(workspaceSettings, { schedule: input.schedule });

  const { error } = await supabase
    .from("companies")
    .update({ workspace_settings: next })
    .eq("id", companyId);

  if (error) {
    if (isMissingColumnError(error.message)) {
      return {
        ok: false,
        error:
          "Database is missing workspace_settings. Apply migration `20260423_company_workspace_settings.sql`.",
      };
    }
    return { ok: false, error: error.message };
  }
  revalidatePath("/app/settings");
  return { ok: true };
}

export async function addShiftTypeAction(input: { name: string }): Promise<ActionResult> {
  const name = String(input.name || "").trim();
  if (!name) return { ok: false, error: "Name is required." };
  const { workspaceSettings } = await requireSettingsAdmin();
  const schedule = workspaceSettings.schedule || {};
  const shiftTypes = [...(schedule.shiftTypes || [])];
  shiftTypes.push({ id: newShiftTypeId(), name });
  return updateScheduleSettingsAction({ schedule: { ...schedule, shiftTypes } });
}

export async function updateShiftTypeAction(input: { id: string; name: string }): Promise<ActionResult> {
  const name = String(input.name || "").trim();
  if (!name) return { ok: false, error: "Name is required." };
  const { workspaceSettings } = await requireSettingsAdmin();
  const schedule = workspaceSettings.schedule || {};
  const shiftTypes = (schedule.shiftTypes || []).map((s) =>
    s.id === input.id ? { ...s, name } : s
  );
  return updateScheduleSettingsAction({ schedule: { ...schedule, shiftTypes } });
}

export async function deleteShiftTypeAction(input: { id: string }): Promise<ActionResult> {
  const { workspaceSettings } = await requireSettingsAdmin();
  const schedule = workspaceSettings.schedule || {};
  const shiftTypes = (schedule.shiftTypes || []).filter((s) => s.id !== input.id);
  return updateScheduleSettingsAction({ schedule: { ...schedule, shiftTypes } });
}

export async function updateBreakRulesAction(input: {
  defaultBreakMinutes: string;
  minGapBetweenShiftsMinutes: string;
}): Promise<ActionResult> {
  const { workspaceSettings } = await requireSettingsAdmin();
  const schedule = workspaceSettings.schedule || {};
  const parseOpt = (v: string) => {
    const t = String(v || "").trim();
    if (t === "") return undefined;
    const n = Number.parseInt(t, 10);
    return Number.isNaN(n) || n < 0 ? undefined : n;
  };
  const breakRules = {
    defaultBreakMinutes: parseOpt(input.defaultBreakMinutes),
    minGapBetweenShiftsMinutes: parseOpt(input.minGapBetweenShiftsMinutes),
  };
  return updateScheduleSettingsAction({
    schedule: { ...schedule, breakRules },
  });
}

export async function updateEmployeeWorkspaceSettingsAction(
  input: EmployeeWorkspaceSlice
): Promise<ActionResult> {
  const { supabase, companyId, workspaceSettings } = await requireSettingsAdmin();
  const next = mergeWorkspaceSettings(workspaceSettings, {
    employee: {
      showEmailField: Boolean(input.showEmailField),
      showPhoneField: Boolean(input.showPhoneField),
    },
  });
  const { error } = await supabase
    .from("companies")
    .update({ workspace_settings: next })
    .eq("id", companyId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/settings");
  return { ok: true };
}

export type MemberRow = {
  userId: string;
  role: string;
  displayName: string | null;
};

export async function getWorkspaceMembers(): Promise<MemberRow[]> {
  const { supabase, companyId } = await requireSettingsAdmin();
  const { data, error } = await supabase
    .from("company_members")
    .select(
      `
        user_id,
        role,
        profiles ( name )
      `
    )
    .eq("company_id", companyId)
    .eq("status", "active")
    .order("role", { ascending: true });

  if (error) {
    console.error("[settings] members", error.message);
    return [];
  }

  type MemberQueryRow = {
    user_id: string;
    role: string | null;
    profiles: { name: string | null } | { name: string | null }[] | null;
  };

  return ((data as MemberQueryRow[] | null) ?? []).map((row) => {
    const prof = row.profiles;
    const name = Array.isArray(prof) ? prof[0]?.name : prof?.name;
    return {
      userId: row.user_id,
      role: row.role || "employee",
      displayName: name ?? null,
    };
  });
}

export async function updateWorkspaceMemberRoleAction(input: {
  userId: string;
  access: "admin" | "staff";
}): Promise<ActionResult> {
  const { supabase, companyId, userId: actorId } = await requireSettingsAdmin();

  if (input.userId === actorId) {
    return { ok: false, error: "You cannot change your own role here." };
  }

  const { data: target, error: tErr } = await supabase
    .from("company_members")
    .select("role")
    .eq("company_id", companyId)
    .eq("user_id", input.userId)
    .eq("status", "active")
    .maybeSingle<{ role: string | null }>();

  if (tErr || !target) {
    return { ok: false, error: "Member not found." };
  }

  const r = (target.role || "").toLowerCase();
  if (r === "owner") {
    return { ok: false, error: "The workspace owner role cannot be changed." };
  }

  const nextRole = input.access === "admin" ? "admin" : "employee";

  const { error } = await supabase
    .from("company_members")
    .update({ role: nextRole })
    .eq("company_id", companyId)
    .eq("user_id", input.userId)
    .eq("status", "active");

  if (error) return { ok: false, error: error.message };
  revalidatePath("/app");
  revalidatePath("/app/settings");
  return { ok: true };
}
