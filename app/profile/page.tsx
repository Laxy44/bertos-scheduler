import Link from "next/link";

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10">
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Profile
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Your account and preferences will appear here.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center self-start rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900 sm:self-auto"
          >
            Back
          </Link>
        </header>

        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <aside className="lg:col-span-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                —
              </div>
              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                Signed in
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">Planyo user</p>
              <p className="mt-2 text-xs text-slate-500">
                Full profile editing is coming soon. Use the dashboard to manage your workspace.
              </p>
            </div>
          </aside>
          <div className="space-y-6 lg:col-span-8">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">Personal info</h2>
              <p className="mt-1 text-xs text-slate-500">
                This section is a placeholder — same layout as employee profile will use.
              </p>
              <p className="mt-4 text-sm text-slate-600">
                We&apos;ve added this as a safe route from the user menu. Nothing is stored here yet.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
