import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";

type CreateEmployeeBody = {
  companyId?: string;
  name?: string;
  hourlyRate?: number;
  defaultRole?: string;
};

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateEmployeeBody;
  try {
    body = (await request.json()) as CreateEmployeeBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const companyId = String(body.companyId || "").trim();
  const name = String(body.name || "").trim();
  const hourlyRate = Number(body.hourlyRate);
  const defaultRole = String(body.defaultRole || "").trim() || "Service";

  if (!companyId || !name || Number.isNaN(hourlyRate) || hourlyRate < 0) {
    return NextResponse.json({ error: "Invalid employee payload" }, { status: 400 });
  }

  const membership = await supabase
    .from("company_members")
    .select("role")
    .eq("company_id", companyId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle<{ role: string | null }>();

  const role = (membership.data?.role || "").toLowerCase();
  if (membership.error || !["owner", "admin"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let admin;
  try {
    admin = createSupabaseAdminClient();
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }

  const created = await admin
    .from("employees")
    .insert({
      company_id: companyId,
      name,
      hourly_rate: hourlyRate,
      default_role: defaultRole,
      unavailable_dates: [],
      active: true,
    })
    .select()
    .single();

  if (created.error || !created.data) {
    return NextResponse.json(
      { error: created.error?.message || "Could not create employee" },
      { status: 400 }
    );
  }

  return NextResponse.json({ employee: created.data });
}
