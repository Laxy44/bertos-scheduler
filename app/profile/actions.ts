"use server";

import { revalidatePath } from "next/cache";

import {
  getLinkedProfileEmployee,
  mapEmployeeRowToView,
  type ProfileEmployeeRow,
} from "@/lib/profile-employee";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export type ProfileEmployeeView = ReturnType<typeof mapEmployeeRowToView>;

export type SaveProfileEmployeeResult =
  | { ok: true; employee: ProfileEmployeeView }
  | { ok: false; error: string };

function isMissingColumnError(message: string) {
  const m = message.toLowerCase();
  return m.includes("column") && m.includes("does not exist");
}

export async function saveProfileEmployeeAction(input: {
  name: string;
  email: string;
  phone: string;
  hourlyRate: number;
  defaultRole: string;
}): Promise<SaveProfileEmployeeResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: "You must be signed in to save your profile." };
  }

  const membership = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("company_id", { ascending: true })
    .limit(1)
    .maybeSingle<{ company_id: string | null }>();

  const companyId = membership.data?.company_id;
  if (membership.error || !companyId) {
    return { ok: false, error: "No active workspace found for your account." };
  }

  const linked = await getLinkedProfileEmployee(supabase, {
    userId: user.id,
    authEmail: user.email ?? null,
    companyId,
  });

  if (!linked) {
    return {
      ok: false,
      error:
        "No employee record is linked to your login. Ask an admin to add your email to your employee profile, or ensure your workspace was set up with your account linked.",
    };
  }

  const name = String(input.name || "").trim();
  if (!name) {
    return { ok: false, error: "Name is required." };
  }

  const email = String(input.email || "").trim().toLowerCase() || null;
  const phone = String(input.phone || "").trim() || null;
  const defaultRole = String(input.defaultRole || "").trim() || "Service";
  const hourlyRate = Number(input.hourlyRate);
  if (Number.isNaN(hourlyRate) || hourlyRate < 0) {
    return { ok: false, error: "Hourly rate must be a valid number (0 or greater)." };
  }

  const oldName = linked.name;

  const updatePayload: Record<string, unknown> = {
    name,
    email,
    phone,
    hourly_rate: hourlyRate,
    default_role: defaultRole,
  };

  const updated = await supabase
    .from("employees")
    .update(updatePayload)
    .eq("id", linked.id)
    .eq("company_id", companyId)
    .select("*")
    .maybeSingle();

  if (updated.error) {
    if (isMissingColumnError(updated.error.message)) {
      return {
        ok: false,
        error:
          "Your database is missing profile columns on employees. Apply the latest Supabase migration (employees user_id, email, phone) and try again.",
      };
    }
    return { ok: false, error: updated.error.message || "Could not save profile." };
  }

  if (!updated.data) {
    return { ok: false, error: "Could not save profile (no row returned)." };
  }

  if (oldName !== name) {
    const shiftPatch = await supabase
      .from("shifts")
      .update({ employee: name })
      .eq("company_id", companyId)
      .eq("employee", oldName);

    if (shiftPatch.error) {
      await supabase
        .from("employees")
        .update({ name: oldName })
        .eq("id", linked.id)
        .eq("company_id", companyId);
      return {
        ok: false,
        error: `Could not update scheduled shifts to use the new name: ${shiftPatch.error.message}. Your display name was reverted.`,
      };
    }
  }

  const profileUpsert = await supabase.from("profiles").upsert(
    {
      id: user.id,
      name,
    },
    { onConflict: "id" }
  );

  if (profileUpsert.error && !isMissingColumnError(profileUpsert.error.message)) {
    const retry = await supabase.from("profiles").upsert(
      {
        id: user.id,
        full_name: name,
      },
      { onConflict: "id" }
    );
    if (retry.error && !isMissingColumnError(retry.error.message)) {
      console.warn("[profile] profiles sync skipped", retry.error.message);
    }
  }

  revalidatePath("/");
  revalidatePath("/profile");

  return { ok: true, employee: mapEmployeeRowToView(updated.data as ProfileEmployeeRow) };
}
