import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { isCompanyAdminRole } from "@/lib/workspace-role";

export const metadata: Metadata = {
  title: "Pending requests",
  description: "Shift and swap requests awaiting review",
};

type CompanyMemberRow = {
  company_id?: string | null;
  role?: string | null;
  status?: string | null;
};

export default async function PendingRequestsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const membershipQuery = await supabase
    .from("company_members")
    .select("company_id, role, status")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("company_id", { ascending: true })
    .limit(2);

  if (!membershipQuery.error && (membershipQuery.data || []).length > 1) {
    redirect("/workspace-conflict");
  }

  const membership = membershipQuery.data?.[0] as CompanyMemberRow | undefined;
  const activeCompanyId = membership?.company_id ?? null;

  if (!activeCompanyId) {
    redirect("/create-company");
  }

  const workspaceRole = (membership?.role || "").trim();
  if (!isCompanyAdminRole(workspaceRole)) {
    redirect("/your-schedule");
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pending requests</h1>
            <p className="mt-1 max-w-xl text-sm text-slate-600">
              When team members request new shifts or swaps, they will show up here for a quick approve or decline.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex w-fit items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
          >
            Back to workspace
          </Link>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Shift requests</h2>
          <div className="mt-6 rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center">
            <p className="text-sm font-medium text-slate-700">No open shift requests</p>
            <p className="mt-1 text-xs text-slate-500">Nothing waiting on you right now.</p>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Swap requests</h2>
          <div className="mt-6 rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center">
            <p className="text-sm font-medium text-slate-700">No swap requests</p>
            <p className="mt-1 text-xs text-slate-500">Optional — swap flows can plug in here later.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
