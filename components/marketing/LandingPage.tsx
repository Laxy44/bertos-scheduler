import Link from "next/link";

type LandingPageProps = {
  isAuthenticated?: boolean;
};

/** Single accent: emerald — used sparingly for premium, calm feel */
const accent = {
  text: "text-emerald-700",
  glow: "from-emerald-300/25 via-indigo-200/20 to-transparent",
  step: "bg-emerald-600",
};

function ProductPreviewCard() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const rows = [
    { name: "Sarah K.", shifts: ["approved", "pending", "approved", "—", "approved"] },
    { name: "James M.", shifts: ["approved", "approved", "pending", "approved", "—"] },
    { name: "Maria L.", shifts: ["pending", "approved", "approved", "approved", "approved"] },
  ] as const;

  return (
    <div className="relative mx-auto w-full max-w-xl perspective-[1200px] lg:max-w-none">
      {/* Radial glow behind preview */}
      <div
        aria-hidden
        className={`pointer-events-none absolute left-1/2 top-1/2 h-[min(520px,90vw)] w-[min(520px,90vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr ${accent.glow} blur-3xl`}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 bottom-8 hidden w-[72%] rotate-[-2deg] rounded-3xl border border-slate-200/70 bg-white/60 shadow-lg lg:block"
        style={{ height: "88%" }}
      />

      <div className="relative rotate-[1.5deg] transition-transform duration-500 ease-out lg:rotate-2">
        <div
          className={`overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-[0_32px_80px_-16px_rgba(15,23,42,0.22),0_0_0_1px_rgba(15,23,42,0.04)_inset] ring-1 ring-slate-900/[0.03]`}
        >
          <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4 sm:px-6">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/40" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Live preview
              </span>
            </div>
            <span className="text-xs font-medium text-slate-400">Week of Apr 14</span>
          </div>

          <div className="p-5 sm:p-7 md:p-8">
            <div className="grid grid-cols-[minmax(0,1.1fr)_repeat(5,minmax(0,1fr))] gap-x-1.5 gap-y-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:gap-x-2 sm:text-xs">
              <div className="pl-0.5" />
              {days.map((d) => (
                <div key={d} className="pb-1 text-center text-slate-500">
                  {d}
                </div>
              ))}
              {rows.map((row) => (
                <div key={row.name} className="contents">
                  <div className="flex items-center truncate border-t border-slate-100 py-3.5 pl-0.5 text-sm font-semibold text-slate-900 sm:text-[15px]">
                    {row.name}
                  </div>
                  {row.shifts.map((cell, i) => (
                    <div
                      key={`${row.name}-${i}`}
                      className="flex items-center justify-center border-t border-slate-100 py-3"
                    >
                      {cell === "—" ? (
                        <span className="text-slate-300">—</span>
                      ) : cell === "approved" ? (
                        <span
                          className="h-9 w-[94%] max-w-[60px] rounded-lg bg-emerald-100 ring-1 ring-emerald-200/90 sm:h-10 sm:max-w-[68px]"
                          title="Approved"
                        />
                      ) : (
                        <span
                          className="h-9 w-[94%] max-w-[60px] rounded-lg bg-amber-100 ring-1 ring-amber-200/90 sm:h-10 sm:max-w-[68px]"
                          title="Pending"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-slate-100 pt-6">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/90 px-3 py-3 text-center shadow-sm sm:py-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Coverage</p>
                <p className="mt-1 text-xl font-bold tabular-nums tracking-tight text-slate-950 sm:text-2xl">96%</p>
              </div>
              <div className="rounded-2xl border border-amber-100/90 bg-amber-50/90 px-3 py-3 text-center shadow-sm sm:py-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-900/70">Pending</p>
                <p className="mt-1 text-xl font-bold tabular-nums tracking-tight text-amber-950 sm:text-2xl">4</p>
              </div>
              <div className="rounded-2xl border border-emerald-100/80 bg-emerald-50/60 px-3 py-3 text-center shadow-sm sm:py-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-800/70">Hours</p>
                <p className="mt-1 text-xl font-bold tabular-nums tracking-tight text-emerald-950 sm:text-2xl">320h</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureIcon({ type }: { type: "schedule" | "approve" | "payroll" | "team" }) {
  const common = "h-11 w-11 rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white to-slate-50 p-2.5 text-slate-800 shadow-sm";
  if (type === "schedule") {
    return (
      <div className={common} aria-hidden>
        <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" d="M4 6h16M4 12h10M4 18h7" />
        </svg>
      </div>
    );
  }
  if (type === "approve") {
    return (
      <div className={common} aria-hidden>
        <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </div>
    );
  }
  if (type === "payroll") {
    return (
      <div className={common} aria-hidden>
        <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" d="M12 6v12M8 10h8M8 14h5" />
        </svg>
      </div>
    );
  }
  return (
    <div className={common} aria-hidden>
      <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.433-2.535M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    </div>
  );
}

function TrustBar() {
  const labels = ["Restaurant", "Café", "Retail", "Kitchen"];
  return (
    <div className="border-y border-slate-200/70 bg-white/50 py-10 backdrop-blur-sm md:py-12">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Trusted by growing teams
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 md:gap-8">
          {labels.map((label) => (
            <div
              key={label}
              className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-7 py-3.5 text-sm font-semibold tracking-wide text-slate-500 shadow-sm transition duration-300 hover:border-slate-300 hover:bg-white hover:shadow-md"
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LandingPage({ isAuthenticated = false }: LandingPageProps) {
  const features = [
    {
      icon: "schedule" as const,
      title: "Smart scheduling",
      body: "Plan shifts in seconds with a simple weekly view your team actually understands.",
    },
    {
      icon: "approve" as const,
      title: "Real-time approvals",
      body: "Approve, edit, and manage shifts instantly without back-and-forth messages.",
    },
    {
      icon: "payroll" as const,
      title: "Payroll clarity",
      body: "Know exactly what you owe before payday — no surprises.",
    },
    {
      icon: "team" as const,
      title: "Team visibility",
      body: "Everyone sees their schedule, availability, and hours in one place.",
    },
  ];

  const steps = [
    { title: "Create your workspace", body: "Add your business, roles, and team." },
    { title: "Plan your week", body: "Assign shifts and avoid conflicts automatically." },
    { title: "Track & pay", body: "Monitor hours and run payroll with confidence." },
  ];

  const testimonials = [
    { quote: "We reduced scheduling time by 70% in the first week.", role: "Restaurant Owner", initials: "RO" },
    { quote: "No more confusion. My staff always knows their shifts.", role: "Café Manager", initials: "CM" },
    { quote: "Payroll used to take hours. Now it's instant.", role: "Small business owner", initials: "SB" },
  ];

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-white via-slate-50/90 to-emerald-50/[0.35] text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-900`}
    >
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <span className="text-lg font-bold tracking-tight text-slate-950 md:text-xl">Planyo</span>
          <nav className="flex flex-wrap items-center justify-end gap-2 sm:gap-3" aria-label="Marketing">
            {isAuthenticated ? (
              <Link
                href="/app"
                className="order-first rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition duration-200 hover:border-slate-300 hover:shadow-md sm:order-none"
              >
                Open workspace
              </Link>
            ) : null}
            <Link
              href="/login"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition duration-200 hover:bg-slate-100 hover:text-slate-900"
            >
              Login
            </Link>
            <Link
              href="/create-company"
              className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/20 transition duration-200 hover:scale-[1.02] hover:bg-slate-900 hover:shadow-lg active:scale-[0.98]"
            >
              Start free
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero — tall, premium */}
        <section className="relative overflow-hidden pb-24 pt-16 md:pb-32 md:pt-20 lg:pb-40 lg:pt-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.08),transparent)]"
          />
          <div className="relative mx-auto max-w-6xl px-4 md:px-8">
            <div className="grid items-center gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(320px,1.05fr)] lg:gap-20 xl:gap-24">
              <div className="max-w-[600px]">
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.22em] ${accent.text} sm:text-sm`}
                >
                  For restaurants & small teams
                </p>
                <h1 className="mt-6 text-[2.5rem] font-semibold leading-[1.05] tracking-tight text-slate-950 sm:text-5xl md:text-6xl lg:text-[3.5rem]">
                  Run your staff scheduling without chaos
                </h1>
                <p className="mt-8 max-w-[540px] text-lg leading-relaxed text-slate-500 md:text-xl md:leading-relaxed">
                  Create shifts, track hours, and run payroll — all in one simple workspace built for restaurants and
                  small teams.
                </p>
                <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
                  <Link
                    href="/create-company"
                    className="inline-flex justify-center rounded-2xl bg-slate-950 px-9 py-4 text-base font-semibold text-white shadow-xl shadow-slate-900/25 transition duration-200 hover:scale-[1.02] hover:bg-slate-900 hover:shadow-2xl active:scale-[0.98]"
                  >
                    Start free workspace
                  </Link>
                  <a
                    href="#how-it-works"
                    className="inline-flex justify-center rounded-2xl border border-slate-200/90 bg-white/90 px-9 py-4 text-base font-semibold text-slate-800 shadow-md shadow-slate-900/5 transition duration-200 hover:scale-[1.02] hover:border-slate-300 hover:bg-white hover:shadow-lg active:scale-[0.98]"
                  >
                    See how it works
                  </a>
                </div>
                <p className="mt-6 text-sm text-slate-500">
                  No credit card required <span className="text-slate-300">•</span> Setup in under 2 minutes
                </p>
              </div>
              <div className="relative min-h-[320px] w-full lg:min-h-[420px]">
                <ProductPreviewCard />
              </div>
            </div>
          </div>
        </section>

        <TrustBar />

        {/* Features — 2×2 large cards */}
        <section
          className="border-t border-slate-200/60 bg-white/40 py-24 md:py-32 lg:py-[7.5rem]"
          aria-labelledby="features-heading"
        >
          <div className="mx-auto max-w-6xl px-4 md:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2
                id="features-heading"
                className="text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-4xl md:text-5xl md:leading-[1.1]"
              >
                Everything you need to run the floor
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-slate-500 md:text-xl">
                One workspace. Less admin. More time with your customers.
              </p>
            </div>
            <div className="mt-16 grid gap-6 sm:gap-8 md:grid-cols-2">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group rounded-3xl border border-slate-200/90 bg-white p-10 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.08)] transition duration-300 ease-out hover:-translate-y-1 hover:border-slate-300/90 hover:shadow-[0_24px_48px_-12px_rgba(15,23,42,0.12)] md:p-12"
                >
                  <FeatureIcon type={f.icon} />
                  <h3 className="mt-8 text-2xl font-semibold tracking-tight text-slate-950">{f.title}</h3>
                  <p className="mt-4 text-base leading-relaxed text-slate-500">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works — horizontal + connectors (desktop) */}
        <section
          id="how-it-works"
          className="scroll-mt-28 border-t border-slate-200/60 bg-gradient-to-b from-slate-50/50 to-white py-24 md:py-32 lg:py-[7.5rem]"
          aria-labelledby="how-heading"
        >
          <div className="mx-auto max-w-6xl px-4 md:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2
                id="how-heading"
                className="text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-4xl md:text-5xl md:leading-[1.1]"
              >
                How it works
              </h2>
              <p className="mt-6 text-lg text-slate-500 md:text-xl">From blank slate to a week your team can rely on.</p>
            </div>

            <div className="mx-auto mt-20 max-w-5xl">
              {/* Mobile: vertical timeline */}
              <ol className="relative space-y-12 border-l-2 border-slate-200 pl-10 md:hidden">
                {steps.map((step, i) => (
                  <li key={step.title} className="relative">
                    <span
                      className={`absolute -left-[calc(2.5rem+4px)] top-0 flex h-14 w-14 -translate-x-px items-center justify-center rounded-2xl ${accent.step} text-lg font-bold text-white shadow-lg shadow-emerald-900/20`}
                    >
                      {i + 1}
                    </span>
                    <p className="text-xl font-semibold tracking-tight text-slate-950">{step.title}</p>
                    <p className="mt-3 text-base leading-relaxed text-slate-500">{step.body}</p>
                  </li>
                ))}
              </ol>

              {/* Desktop: horizontal line + circles + copy row */}
              <div className="hidden md:block">
                <div className="relative px-4 lg:px-8">
                  <div
                    className="absolute left-[12%] right-[12%] top-7 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"
                    aria-hidden
                  />
                  <div className="relative flex justify-between">
                    {steps.map((_, i) => (
                      <div
                        key={`n-${i}`}
                        className={`z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${accent.step} text-lg font-bold text-white shadow-lg shadow-emerald-900/25 ring-4 ring-white`}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-14 grid grid-cols-3 gap-8 lg:gap-12">
                  {steps.map((step) => (
                    <div key={step.title} className="text-center">
                      <p className="text-xl font-semibold tracking-tight text-slate-950 lg:text-[1.35rem]">{step.title}</p>
                      <p className="mt-4 text-base leading-relaxed text-slate-500">{step.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section
          className="border-t border-slate-200/60 bg-slate-100/40 py-24 md:py-32 lg:py-[7.5rem]"
          aria-labelledby="social-heading"
        >
          <div className="mx-auto max-w-6xl px-4 md:px-8">
            <h2
              id="social-heading"
              className="text-center text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-4xl md:text-5xl md:leading-[1.1]"
            >
              Trusted by busy operators
            </h2>
            <div className="mt-16 grid gap-8 md:grid-cols-3 md:gap-6 lg:gap-8">
              {testimonials.map((t) => (
                <blockquote
                  key={t.role}
                  className="flex flex-col rounded-3xl border border-slate-200/80 bg-white/90 p-10 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.1)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-16px_rgba(15,23,42,0.12)] md:p-11"
                >
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200/80 bg-gradient-to-br from-slate-100 to-white text-sm font-bold text-slate-600 shadow-inner"
                    aria-hidden
                  >
                    {t.initials}
                  </div>
                  <p className="mt-8 text-xl font-medium leading-snug tracking-tight text-slate-950 md:text-2xl md:leading-snug">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <footer className="mt-8 text-sm font-semibold text-slate-500">— {t.role}</footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* CTA — dark band */}
        <section
          className="border-t border-emerald-950/20 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 py-24 md:py-32 lg:py-36"
          aria-labelledby="cta-heading"
        >
          <div className="mx-auto max-w-3xl px-4 text-center md:px-8">
            <h2
              id="cta-heading"
              className="text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl md:leading-[1.1]"
            >
              Ready to stop wasting time on schedules?
            </h2>
            <p className="mt-8 text-lg leading-relaxed text-slate-300 md:text-xl">
              Start your Planyo workspace today and manage your team the smart way.
            </p>
            <Link
              href="/create-company"
              className="mt-12 inline-flex rounded-2xl bg-white px-11 py-4 text-base font-semibold text-slate-950 shadow-xl shadow-black/25 transition duration-200 hover:scale-[1.03] hover:bg-slate-50 hover:shadow-2xl active:scale-[0.98]"
            >
              Create free workspace
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/80 bg-white py-12 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Planyo
      </footer>
    </div>
  );
}
