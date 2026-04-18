import Link from "next/link";
import { redirect } from "next/navigation";

import { getActiveMembership } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function AccountReadyPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const companyId = await getActiveMembership(supabase, user.id);
    if (companyId) {
      redirect("/app");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Your account is ready</h1>
        <p className="mt-4 text-sm text-slate-600">
          Your Planyo account has been activated successfully.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          You can now open your workspace with the same email and password you just set.
        </p>
        <Link
          href="/login"
          className="mt-8 block rounded-2xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-slate-800"
        >
          Open workspace
        </Link>
      </div>
    </main>
  );
}
