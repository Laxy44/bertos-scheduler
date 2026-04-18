import Link from "next/link";

import SettingsSubnav from "@/components/settings/SettingsSubnav";
import { requireSettingsAdmin } from "@/lib/settings/require-settings-admin";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  await requireSettingsAdmin();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 md:flex-row md:px-8 md:py-10">
        <aside className="w-full shrink-0 md:w-56">
          <div className="sticky top-6 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Settings</p>
              <h1 className="mt-1 text-lg font-bold text-slate-900">Workspace</h1>
              <p className="mt-1 text-xs text-slate-500">
                Core preferences only. Integrations, leave, and advanced payroll can be added later.
              </p>
            </div>
            <SettingsSubnav />
            <Link
              href="/"
              className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
            >
              ← Back to app
            </Link>
          </div>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
