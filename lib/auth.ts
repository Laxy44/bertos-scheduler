import type { SupabaseClient } from "@supabase/supabase-js";

type UserRef = {
  id: string;
};

type CompanyMemberRow = {
  company_id: string | null;
};

export async function createCompanyForUser(
  supabase: SupabaseClient,
  user: UserRef,
  companyName: string
) {
  const existingMembership = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle<CompanyMemberRow>();

  if (!existingMembership.error && existingMembership.data?.company_id) {
    throw new Error(
      "This account already belongs to an active company. Use a different account to create a new company."
    );
  }

  const companyInsert = await supabase
    .from("companies")
    .insert({
      name: companyName,
      cvr: null,
    })
    .select("id")
    .single<{ id: string }>();

  if (companyInsert.error || !companyInsert.data?.id) {
    throw new Error(companyInsert.error?.message || "Failed to create company");
  }

  const memberInsert = await supabase.from("company_members").insert({
    company_id: companyInsert.data.id,
    user_id: user.id,
    role: "owner",
    status: "active",
  });

  if (memberInsert.error) {
    throw new Error(memberInsert.error.message);
  }

  return companyInsert.data.id;
}

export async function getActiveMembership(
  supabase: SupabaseClient,
  userId: string
) {
  const membership = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("company_id", { ascending: true })
    .limit(1)
    .maybeSingle<CompanyMemberRow>();

  if (membership.error) {
    return null;
  }

  return membership.data?.company_id ?? null;
}
