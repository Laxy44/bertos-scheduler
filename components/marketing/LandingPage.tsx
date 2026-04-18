import Link from "next/link";

type LandingPageProps = {
  isAuthenticated?: boolean;
};

export default function LandingPage({ isAuthenticated = false }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6 md:px-8">
        <span className="text-xl font-bold tracking-tight text-slate-900">Planyo</span>
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          {isAuthenticated ? (
            <Link
              href="/app"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              Open workspace
            </Link>
          ) : null}
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Login
          </Link>
          <Link
            href="/create-company"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            Get started
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-20 pt-8 md:px-8 md:pt-14">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Staff scheduling</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Simple shifts, clear hours, calm teams
          </h1>
          <p className="mt-5 text-lg text-slate-600 md:text-xl">
            Build weekly schedules, track time, and keep payroll visibility in one focused workspace.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/create-company"
              className="inline-flex rounded-2xl bg-slate-900 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-slate-900/15 hover:bg-slate-800"
            >
              Get started free
            </Link>
            <Link
              href="/login"
              className="inline-flex rounded-2xl border border-slate-200 bg-white px-6 py-3 text-base font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            >
              Log in
            </Link>
          </div>
        </div>

        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Schedule fast",
              body: "Week-based planner with shifts, roles, and approvals your team can trust.",
            },
            {
              title: "Self-service",
              body: "Employees see their own schedule, availability, and hours without admin noise.",
            },
            {
              title: "Payroll-ready",
              body: "Hours and rates roll into clear totals so you always know where you stand.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-100"
            >
              <h2 className="text-lg font-semibold text-slate-900">{f.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.body}</p>
            </div>
          ))}
        </div>

        <ol className="mx-auto mt-16 max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">How it works</p>
          {[
            "Create your workspace and invite your team.",
            "Add employees, groups, and build the week.",
            "Publish shifts, track time, and review payroll.",
          ].map((step, i) => (
            <li key={step} className="flex gap-3 text-sm text-slate-700">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-800">
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </main>

      <footer className="border-t border-slate-200/80 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Planyo
      </footer>
    </div>
  );
}
