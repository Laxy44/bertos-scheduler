import Link from "next/link";

import { requireSettingsAdmin } from "@/lib/settings/require-settings-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function SecuritySettingsPage() {
  await requireSettingsAdmin();
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Security</h2>
      <p className="mt-1 text-sm text-slate-500">Sign-in and password for your account.</p>

      <dl className="mt-6 space-y-3 text-sm">
        <div>
          <dt className="font-medium text-slate-700">Signed in as</dt>
          <dd className="mt-0.5 text-slate-600">{user?.email ?? "Unknown"}</dd>
        </div>
      </dl>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/reset-password"
          className="inline-flex justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
        >
          Change password
        </Link>
        <Link
          href="/app/profile"
          className="inline-flex justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
        >
          Profile
        </Link>
      </div>

      <p className="mt-6 text-xs text-slate-400">Use a strong, unique password for this workspace.</p>
    </section>
  );
}
