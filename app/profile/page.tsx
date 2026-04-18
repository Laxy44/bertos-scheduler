import Link from "next/link";
import { redirect } from "next/navigation";

import ProfileForm from "@/components/profile/ProfileForm";
import { loadActiveMembershipAndCompany } from "@/lib/active-membership-load";
import { getLinkedProfileEmployee, mapEmployeeRowToView } from "@/lib/profile-employee";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const workspace = await loadActiveMembershipAndCompany(supabase, user.id);
  if (workspace.kind === "conflict") {
    redirect("/workspace-conflict");
  }
  if (workspace.kind === "none") {
    redirect("/create-company");
  }

  const companyId = workspace.membership.company_id;
  const companyName = workspace.company?.name ?? null;

  const linked = await getLinkedProfileEmployee(supabase, {
    userId: user.id,
    authEmail: user.email ?? null,
    companyId,
  });

  const initialEmployee = linked ? mapEmployeeRowToView(linked) : null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200/80 text-slate-900">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8 md:py-10">
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Profile</h1>
            <p className="mt-1 text-sm text-slate-600">
              Your work profile is loaded from Supabase and stays in sync after each save.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center self-start rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 sm:self-auto"
          >
            Back to app
          </Link>
        </header>

        <ProfileForm
          authEmail={user.email ?? null}
          companyName={companyName}
          initialEmployee={initialEmployee}
        />
      </div>
    </main>
  );
}
