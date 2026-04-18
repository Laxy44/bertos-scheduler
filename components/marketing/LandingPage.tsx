import Link from "next/link";

type LandingPageProps = {
  isAuthenticated?: boolean;
};

function ProductPreviewCard() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const rows = [
    { name: "Sarah K.", shifts: ["approved", "pending", "approved", "—", "approved"] },
    { name: "James M.", shifts: ["approved", "approved", "pending", "approved", "—"] },
    { name: "Maria L.", shifts: ["pending", "approved", "approved", "approved", "approved"] },
  ] as const;

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-indigo-200/40 via-white to-emerald-100/40 blur-2xl"
      />
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_24px_64px_-12px_rgba(15,23,42,0.18)] ring-1 ring-slate-900/[0.04]">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Live preview</span>
          </div>
          <span className="text-xs font-medium text-slate-400">Week of Apr 14</span>
        </div>

        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_repeat(5,minmax(0,1fr))] gap-x-1 gap-y-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">
            <div className="pl-1" />
            {days.map((d) => (
              <div key={d} className="text-center text-slate-500">
                {d}
              </div>
            ))}
            {rows.map((row) => (
              <div key={row.name} className="contents">
                <div className="flex items-center truncate border-t border-slate-100 py-2.5 pl-1 text-xs font-semibold text-slate-800 sm:text-sm">
                  {row.name}
                </div>
                {row.shifts.map((cell, i) => (
                  <div
                    key={`${row.name}-${i}`}
                    className="flex items-center justify-center border-t border-slate-100 py-2"
                  >
                    {cell === "—" ? (
                      <span className="text-slate-300">—</span>
                    ) : cell === "approved" ? (
                      <span className="h-7 w-[92%] max-w-[52px] rounded-md bg-emerald-100 ring-1 ring-emerald-200/80" title="Approved" />
                    ) : (
                      <span className="h-7 w-[92%] max-w-[52px] rounded-md bg-amber-100 ring-1 ring-amber-200/80" title="Pending" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
            <div className="rounded-xl bg-slate-50 px-2 py-2.5 text-center ring-1 ring-slate-100 sm:px-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Coverage</p>
              <p className="mt-0.5 text-lg font-bold tabular-nums text-slate-900 sm:text-xl">96%</p>
            </div>
            <div className="rounded-xl bg-amber-50/80 px-2 py-2.5 text-center ring-1 ring-amber-100 sm:px-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-800/80">Pending</p>
              <p className="mt-0.5 text-lg font-bold tabular-nums text-amber-950 sm:text-xl">4</p>
            </div>
            <div className="rounded-xl bg-indigo-50/80 px-2 py-2.5 text-center ring-1 ring-indigo-100 sm:px-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-700/80">Hours</p>
              <p className="mt-0.5 text-lg font-bold tabular-nums text-indigo-950 sm:text-xl">320h</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage({ isAuthenticated = false }: LandingPageProps) {
  const features = [
    {
      title: "Smart scheduling",
      body: "Plan shifts in seconds with a simple weekly view your team actually understands.",
    },
    {
      title: "Real-time approvals",
      body: "Approve, edit, and manage shifts instantly without back-and-forth messages.",
    },
    {
      title: "Payroll clarity",
      body: "Know exactly what you owe before payday — no surprises.",
    },
    {
      title: "Team visibility",
      body: "Everyone sees their schedule, availability, and hours in one place.",
    },
  ];

  const steps = [
    {
      title: "Create your workspace",
      body: "Add your business, roles, and team.",
    },
    {
      title: "Plan your week",
      body: "Assign shifts and avoid conflicts automatically.",
    },
    {
      title: "Track & pay",
      body: "Monitor hours and run payroll with confidence.",
    },
  ];

  const testimonials = [
    {
      quote: "We reduced scheduling time by 70% in the first week.",
      role: "Restaurant Owner",
    },
    {
      quote: "No more confusion. My staff always knows their shifts.",
      role: "Café Manager",
    },
    {
      quote: "Payroll used to take hours. Now it's instant.",
      role: "Small business owner",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/90 text-slate-900 antialiased">
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <span className="text-xl font-bold tracking-tight text-slate-900">Planyo</span>
          <nav className="flex flex-wrap items-center justify-end gap-2 sm:gap-3" aria-label="Marketing">
            {isAuthenticated ? (
              <Link
                href="/app"
                className="order-first rounded-xl px-3 py-2 text-sm font-semibold text-indigo-700 ring-1 ring-indigo-200/80 transition hover:bg-indigo-50 sm:order-none"
              >
                Open workspace
              </Link>
            ) : null}
            <Link
              href="/login"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Login
            </Link>
            <Link
              href="/create-company"
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/15 transition hover:bg-slate-800 hover:shadow-lg"
            >
              Start free
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-14 md:px-8 md:pb-28 md:pt-20 lg:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_min(440px,100%)] lg:gap-16">
            <div className="max-w-xl lg:max-w-none">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">For restaurants & small teams</p>
              <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem]">
                Run your staff scheduling without chaos
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-slate-600 sm:text-xl">
                Create shifts, track hours, and run payroll — all in one simple workspace built for restaurants and small
                teams.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Link
                  href="/create-company"
                  className="inline-flex justify-center rounded-2xl bg-slate-900 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 hover:shadow-xl"
                >
                  Start free workspace
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex justify-center rounded-2xl border border-slate-200 bg-white px-8 py-3.5 text-base font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
                >
                  See how it works
                </a>
              </div>
              <p className="mt-5 text-sm text-slate-500">
                No credit card required <span className="text-slate-300">•</span> Setup in under 2 minutes
              </p>
            </div>
            <div className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
              <ProductPreviewCard />
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-slate-200/60 bg-white/60 py-20 md:py-24" aria-labelledby="features-heading">
          <div className="mx-auto max-w-6xl px-4 md:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 id="features-heading" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Everything you need to run the floor
              </h2>
              <p className="mt-4 text-lg text-slate-600">One workspace. Less admin. More time with your customers.</p>
            </div>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group rounded-2xl border border-slate-200/90 bg-white p-7 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                >
                  <h3 className="text-lg font-semibold text-slate-900">{f.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="scroll-mt-24 border-t border-slate-200/60 py-20 md:py-24"
          aria-labelledby="how-heading"
        >
          <div className="mx-auto max-w-6xl px-4 md:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 id="how-heading" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                How it works
              </h2>
              <p className="mt-4 text-lg text-slate-600">From blank slate to a week your team can rely on.</p>
            </div>
            <ol className="mx-auto mt-14 grid max-w-4xl gap-8 md:grid-cols-3">
              {steps.map((step, i) => (
                <li
                  key={step.title}
                  className="relative rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/80 p-8 shadow-sm"
                >
                  <span className="absolute -left-1 -top-1 flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white shadow-md">
                    {i + 1}
                  </span>
                  <p className="mt-4 text-lg font-semibold text-slate-900">{step.title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Social proof */}
        <section className="border-t border-slate-200/60 bg-slate-50/80 py-20 md:py-24" aria-labelledby="social-heading">
          <div className="mx-auto max-w-6xl px-4 md:px-8">
            <h2 id="social-heading" className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Trusted by busy operators
            </h2>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <blockquote
                  key={t.role}
                  className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm transition hover:shadow-md"
                >
                  <p className="text-base font-medium leading-relaxed text-slate-800">&ldquo;{t.quote}&rdquo;</p>
                  <footer className="mt-6 text-sm font-semibold text-indigo-700">— {t.role}</footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="border-t border-slate-200/60 py-20 md:py-28" aria-labelledby="cta-heading">
          <div className="mx-auto max-w-3xl px-4 text-center md:px-8">
            <h2 id="cta-heading" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Ready to stop wasting time on schedules?
            </h2>
            <p className="mt-5 text-lg text-slate-600">
              Start your Planyo workspace today and manage your team the smart way.
            </p>
            <Link
              href="/create-company"
              className="mt-10 inline-flex rounded-2xl bg-slate-900 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 hover:shadow-xl"
            >
              Create free workspace
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/80 py-10 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Planyo
      </footer>
    </div>
  );
}
