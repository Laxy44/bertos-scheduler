"use server";

import { redirect } from "next/navigation";
import { createCompanyForUser } from "../../lib/auth";
import { buildSignupEmailRedirectUrl } from "../../lib/auth-callback-urls";
import { createPendingInviteAndSendEmail } from "../../lib/employee-invite-flow";
import { createSupabaseAdminClient } from "../../lib/supabase/admin";
import { createServerSupabaseClient } from "../../lib/supabase-server";
import { getSiteUrlFromHeaders } from "../../lib/site-url-server";

type ActionState = {
  error: string | null;
};

type TeamEmployee = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

function isMissingProfileColumnError(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("column") &&
    normalized.includes("profiles") &&
    normalized.includes("schema cache")
  );
}

function isMissingProfilesTableError(message: string) {
  const normalized = message.toLowerCase();
  return normalized.includes('relation "profiles" does not exist');
}

async function upsertOwnerProfileSafely(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  params: { ownerId: string; profileName: string }
) {
  const byName = await admin.from("profiles").upsert(
    {
      id: params.ownerId,
      name: params.profileName,
    },
    { onConflict: "id" }
  );
  if (!byName.error) return null;

  if (isMissingProfilesTableError(byName.error.message)) {
    return null;
  }
  if (!isMissingProfileColumnError(byName.error.message)) {
    return byName.error.message;
  }

  const byFullName = await admin.from("profiles").upsert(
    {
      id: params.ownerId,
      full_name: params.profileName,
    },
    { onConflict: "id" }
  );
  if (!byFullName.error) return null;

  if (
    isMissingProfilesTableError(byFullName.error.message) ||
    isMissingProfileColumnError(byFullName.error.message)
  ) {
    // Some projects keep profiles minimal or without a display-name field.
    return null;
  }
  return byFullName.error.message;
}

function readRequired(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function parseEmployees(value: string): TeamEmployee[] {
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => ({
        firstName: String(item?.firstName || "").trim(),
        lastName: String(item?.lastName || "").trim(),
        email: String(item?.email || "").trim().toLowerCase(),
        role: String(item?.role || "").trim(),
      }))
      .filter((item) => item.firstName || item.lastName || item.email || item.role);
  } catch {
    return [];
  }
}

function normalizeEmployeeName(employee: TeamEmployee) {
  return [employee.firstName, employee.lastName].filter(Boolean).join(" ").trim();
}

export async function finishOwnerOnboarding(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createServerSupabaseClient();

  const firstName = readRequired(formData, "first_name");
  const lastName = readRequired(formData, "last_name");
  const submittedEmail = readRequired(formData, "email").toLowerCase();
  const password = String(formData.get("password") || "");

  const companyName = readRequired(formData, "company_name");
  const skipTeam = String(formData.get("skip_team") || "") === "true";
  const sendInvites = String(formData.get("send_invites") || "") === "true";
  const employeesJson = String(formData.get("employees_json") || "[]");
  const employees = skipTeam ? [] : parseEmployees(employeesJson);
  const origin = await getSiteUrlFromHeaders();

  if (!firstName || !lastName) {
    return { error: "First name and last name are required." };
  }
  if (!companyName) {
    return { error: "Company name is required." };
  }

  const {
    data: { user: existingUser },
  } = await supabase.auth.getUser();

  const isExistingAccount = Boolean(existingUser);
  let ownerId = existingUser?.id || "";
  let ownerEmail = (existingUser?.email || "").trim().toLowerCase();

  if (!existingUser) {
    if (!submittedEmail || !password) {
      return { error: "Email and password are required." };
    }
    if (password.length < 6) {
      return { error: "Password must be at least 6 characters." };
    }

    const signUpResult = await supabase.auth.signUp({
      email: submittedEmail,
      password,
      options: {
        emailRedirectTo: buildSignupEmailRedirectUrl(origin),
      },
    });

    if (signUpResult.error) {
      return { error: signUpResult.error.message };
    }

    const hasIdentity = (signUpResult.data.user?.identities || []).length > 0;
    if (!hasIdentity) {
      return {
        error:
          "This email is already registered. Log in with that account or use another email.",
      };
    }

    const ownerUser = signUpResult.data.user;
    if (!ownerUser?.id) {
      return { error: "Unable to resolve owner account." };
    }

    ownerId = ownerUser.id;
    ownerEmail = (ownerUser.email || submittedEmail).trim().toLowerCase();
  }

  if (!ownerId) {
    return { error: "Unable to resolve owner account." };
  }

  let admin;
  try {
    admin = createSupabaseAdminClient();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { error: message };
  }

  let companyId = "";
  try {
    companyId = await createCompanyForUser(admin, { id: ownerId }, companyName);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to create company.",
    };
  }

  const profileName = `${firstName} ${lastName}`.trim() || ownerEmail || "Owner";
  const profileError = await upsertOwnerProfileSafely(admin, {
    ownerId,
    profileName,
  });
  if (profileError) {
    return { error: profileError };
  }

  const employeeRows = employees
    .map((employee) => ({
      name: normalizeEmployeeName(employee),
      role: employee.role || "Service",
      email: employee.email,
    }))
    .filter((employee) => employee.name);

  if (employeeRows.length > 0) {
    const insertEmployees = await admin.from("employees").insert(
      employeeRows.map((employee) => ({
        company_id: companyId,
        name: employee.name,
        hourly_rate: 130,
        default_role: employee.role,
        unavailable_dates: [],
        active: true,
      }))
    );

    if (insertEmployees.error) {
      return { error: insertEmployees.error.message };
    }
  }

  if (sendInvites) {
    for (const employee of employeeRows) {
      if (!employee.email) continue;
      const inviteResult = await createPendingInviteAndSendEmail(admin, ownerId, {
        email: employee.email,
        role: "employee",
        origin,
      });
      if (!inviteResult.ok) {
        console.warn("[onboarding] employee invite skipped", {
          email: employee.email,
          error: inviteResult.error,
        });
      }
    }
  }

  if (isExistingAccount) {
    redirect("/create-company/success?mode=existing");
  }

  redirect("/create-company/success?mode=new");
}
