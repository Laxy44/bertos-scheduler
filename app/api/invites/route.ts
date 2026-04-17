import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getSiteUrlFromRequest } from "@/lib/site-url";
import {
  createPendingInviteAndSendEmail,
  type AppInviteRole,
} from "@/lib/employee-invite-flow";

type Body = {
  email?: string;
  role?: string;
};

function httpStatusForInviteError(message: string): number {
  if (message === "Workspace conflict") return 409;
  if (message.startsWith("Only company owners")) return 403;
  if (message.startsWith("Create a company")) return 400;
  if (message.startsWith("Pending invite already exists")) return 409;
  return 400;
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = String(body.email || "").trim().toLowerCase();
  const requestedRole = String(body.role || "employee").trim().toLowerCase();
  const allowedInviteRoles = new Set(["employee", "admin"]);
  const role = (
    allowedInviteRoles.has(requestedRole) ? requestedRole : "employee"
  ) as AppInviteRole;

  if (!email) {
    return NextResponse.json({ error: "Employee email is required" }, { status: 400 });
  }

  const origin = getSiteUrlFromRequest(request);

  const result = await createPendingInviteAndSendEmail(supabase, user.id, {
    email,
    role,
    origin,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: httpStatusForInviteError(result.error) }
    );
  }

  return NextResponse.json({ ok: true });
}
