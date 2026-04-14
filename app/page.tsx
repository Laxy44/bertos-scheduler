import { redirect } from "next/navigation";
import { createClient as createServerSupabaseClient } from "../lib/supabase-server";
import AppShell from "../components/layout/AppShell";

export default async function Page() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, name")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "employee";
  const employeeName = profile?.name ?? user.email ?? null;

  return (
    <AppShell
      role={role}
      employeeName={employeeName}
    />
  );
}