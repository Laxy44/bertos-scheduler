import { redirect } from "next/navigation";
import { createClient as createServerSupabaseClient } from "../lib/supabase-server";
import AppShell from "../components/layout/AppShell";

export default async function Page() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  let profile: { role?: string | null; name?: string | null } | null = null;

  // Transitional fallback only.
  // Some environments may not have the final profiles shape yet,
  // so we fail softly instead of breaking the app at the root page.
  const profileQuery = await supabase
    .from("profiles")
    .select("role, name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profileQuery.error) {
    profile = profileQuery.data;
  }

  // Temporary fallback until company membership is introduced.
  // In the SaaS version, role must come from company_members, not profiles.
  const role = profile?.role ?? "employee";
  const employeeName = profile?.name ?? user.email ?? "Unknown user";

  return <AppShell role={role} employeeName={employeeName} />;
}
