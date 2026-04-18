import Link from "next/link";

import LandingHeader from "./LandingHeader";
import { TrustLogosRow } from "./TrustLogos";

/** Tiled SVG film grain — CSS-only (feTurbulence), very low alpha */
const HERO_NOISE_BG = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.78" numOctaves="4" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#g)" opacity="0.045"/></svg>'
)}")`;

type LandingPageProps = {
  isAuthenticated?: boolean;
};

/** Stripe-like: tight max width, near-black, single blue accent */
const shell = "mx-auto w-full max-w-[1200px] px-5 md:px-8";
const sectionY = "py-20 md:py-[100px]";

const blueGlow =
  "pointer-events-none absolute rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(37,99,235,0.14)_0%,_transparent_68%)] blur-3xl";

function ScheduleGridMock({ className = "" }: { className?: string }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const rows = [
    { name: "Alex R.", cells: ["ok", "pend", "ok", "—", "ok"] },
    { name: "Jordan T.", cells: ["ok", "ok", "pend", "ok", "—"] },
    { name: "Sam K.", cells: ["pend", "ok", "ok", "ok", "ok"] },
  ] as const;

  return (
    <div className={className}>
      <div className="grid grid-cols-[minmax(0,1.05fr)_repeat(5,minmax(0,1fr))] gap-x-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]">
        <div />
        {days.map((d) => (
          <div key={d} className="pb-1.5 text-center text-slate-500">
            {d}
          </div>
        ))}
        {rows.map((row) => (
          <div key={row.name} className="contents">
            <div className="truncate border-t border-slate-100 py-3 text-left text-[13px] font-semibold text-[#0a0a0a] sm:text-sm">
              {row.name}
            </div>
            {row.cells.map((c, i) => (
              <div key={i} className="flex items-center justify-center border-t border-slate-100 py-2.5">
                {c === "—" ? (
                  <span className="text-slate-200">—</span>
                ) : c === "ok" ? (
                  <span className="h-8 w-[90%] max-w-[52px] rounded-md bg-blue-50 ring-1 ring-blue-100/80" />
                ) : (
                  <span className="h-8 w-[90%] max-w-[52px] rounded-md bg-amber-50 ring-1 ring-amber-100/90" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[560px] lg:max-w-none">
      <div aria-hidden className={`${blueGlow} -right-4 top-0 h-[min(420px,85vw)] w-[min(420px,85vw)] translate-x-1/4`} />
      <div aria-hidden className={`${blueGlow} left-0 top-1/3 h-[min(360px,75vw)] w-[min(360px,75vw)] -translate-x-1/4`} />

      {/* Floating stats card — back layer */}
      <div
        aria-hidden
        className="absolute -right-2 top-6 z-0 hidden w-[200px] scale-[0.96] rounded-2xl border border-slate-200/50 bg-white/95 p-4 shadow-[0_18px_50px_-20px_rgba(15,23,42,0.25)] sm:block lg:right-4 lg:top-10"
      >
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">This week</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-[#0a0a0a]">96%</p>
        <p className="text-xs text-slate-500">Coverage</p>
        <div className="mt-3 h-px bg-slate-100" />
        <p className="mt-3 text-xs font-medium text-slate-600">320h planned</p>
      </div>

      {/* Approvals badge */}
      <div className="absolute -left-1 top-24 z-20 sm:left-0 lg:top-28">
        <div className="rounded-2xl border border-blue-100/80 bg-white/95 px-3 py-2 shadow-[0_12px_40px_-16px_rgba(37,99,235,0.35)] backdrop-blur-sm sm:px-4 sm:py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-700/90">Approvals</p>
          <p className="text-sm font-semibold text-[#0a0a0a]">4 pending</p>
        </div>
      </div>

      {/* Main dashboard card */}
      <div className="relative z-10 translate-y-2 rounded-2xl border border-slate-200/60 bg-white shadow-[0_24px_80px_-24px_rgba(15,23,42,0.2),0_0_0_1px_rgba(15,23,42,0.03)] transition duration-500 ease-out hover:shadow-[0_32px_90px_-28px_rgba(15,23,42,0.22)] sm:translate-y-4">
        <div className="flex items-center justify-between border-b border-slate-100/90 px-5 py-3.5 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-[11px] font-medium text-slate-500">Schedule</span>
          </div>
          <span className="text-xs text-slate-400">Apr 14–20</span>
        </div>
        <div className="p-5 sm:p-7">
          <ScheduleGridMock />
          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-5 sm:gap-3">
            <div className="rounded-xl bg-slate-50/90 py-3 text-center">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Coverage</p>
              <p className="mt-0.5 text-lg font-semibold text-[#0a0a0a]">96%</p>
            </div>
            <div className="rounded-xl bg-amber-50/60 py-3 text-center">
              <p className="text-[10px] font-medium uppercase tracking-wide text-amber-800/70">Pending</p>
              <p className="mt-0.5 text-lg font-semibold text-[#0a0a0a]">4</p>
            </div>
            <div className="rounded-xl bg-blue-50/50 py-3 text-center">
              <p className="text-[10px] font-medium uppercase tracking-wide text-blue-800/70">Hours</p>
              <p className="mt-0.5 text-lg font-semibold text-[#0a0a0a]">320h</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureIcon({ type }: { type: "schedule" | "approve" | "payroll" | "team" }) {
  const box =
    "flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200/70 bg-white text-[#0a0a0a] shadow-[0_2px_8px_-2px_rgba(15,23,42,0.08)]";
  if (type === "schedule") {
    return (
      <div className={box} aria-hidden>
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" d="M4 6h16M4 12h10M4 18h7" />
        </svg>
      </div>
    );
  }
  if (type === "approve") {
    return (
      <div className={box} aria-hidden>
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </div>
    );
  }
  if (type === "payroll") {
    return (
      <div className={box} aria-hidden>
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" d="M12 6v12M9 10h6M9 14h5" />
        </svg>
      </div>
    );
  }
  return (
    <div className={box} aria-hidden>
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.433-2.535M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
        />
      </svg>
    </div>
  );
}

export default function LandingPage({ isAuthenticated = false }: LandingPageProps) {
  const features = [
    {
      icon: "schedule" as const,
      title: "Smart scheduling",
      body: "Plan coverage in a weekly view built for speed.\nYour team always knows what “good” looks like.",
    },
    {
      icon: "approve" as const,
      title: "Real-time approvals",
      body: "Approve or edit shifts in one place.\nNo screenshots, no chasing threads.",
    },
    {
      icon: "payroll" as const,
      title: "Payroll clarity",
      body: "See planned hours and cost before payday.\nFewer surprises, fewer spreadsheets.",
    },
    {
      icon: "team" as const,
      title: "Team visibility",
      body: "Schedules, availability, and hours stay aligned.\nEveryone works from the same truth.",
    },
  ];

  const steps = [
    { title: "Create your workspace", body: "Add your business, roles, and team in minutes." },
    { title: "Plan your week", body: "Assign shifts and catch conflicts early." },
    { title: "Track & pay", body: "Monitor hours and run payroll with confidence." },
  ];

  const testimonials = [
    { quote: "We cut scheduling admin by more than half in week one.", role: "Operations lead", initials: "OL" },
    { quote: "Finally one place for shifts and hours. The team gets it.", role: "General manager", initials: "GM" },
    { quote: "Payroll prep went from hours to a quick review.", role: "Owner", initials: "OW" },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#0a0a0a] antialiased selection:bg-blue-100 selection:text-blue-950">
      <LandingHeader isAuthenticated={isAuthenticated} />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-slate-200/40 bg-gradient-to-b from-white via-[#fafafa] to-[#f3f6fb]/80">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_70%_20%,rgba(37,99,235,0.06),transparent)]" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 mix-blend-multiply opacity-[0.35]"
            style={{
              backgroundImage: HERO_NOISE_BG,
              backgroundRepeat: "repeat",
              backgroundSize: "192px 192px",
            }}
          />
          <div className={`${shell} relative pb-16 pt-14 md:pb-24 md:pt-20 lg:pb-28 lg:pt-24`}>
            <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16 xl:gap-20">
              <div className="max-w-[560px]">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700/90">Planyo</p>
                <h1 className="mt-5 text-[2.5rem] font-semibold leading-[1.08] tracking-tight text-[#0a0a0a] sm:text-5xl md:text-[3.25rem] lg:text-[3.5rem]">
                  Run your team without scheduling chaos
                </h1>
                <p className="mt-8 text-lg leading-relaxed text-slate-600 md:text-xl md:leading-relaxed">
                  Plan shifts, track hours, and run payroll in one calm, powerful workspace.
                </p>
                <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    href="/create-company"
                    className="inline-flex justify-center rounded-xl bg-[#0a0a0a] px-8 py-3.5 text-[15px] font-medium text-white shadow-[0_8px_30px_-8px_rgba(0,0,0,0.35)] transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-[0_14px_40px_-12px_rgba(0,0,0,0.35)] active:translate-y-0"
                  >
                    Start free workspace
                  </Link>
                  <a
                    href="#product"
                    className="inline-flex justify-center rounded-xl border border-slate-200/90 bg-white px-8 py-3.5 text-[15px] font-medium text-[#0a0a0a] shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md active:translate-y-0"
                  >
                    See product
                  </a>
                </div>
                <p className="mt-6 text-sm text-slate-500">No credit card • Setup in 2 minutes</p>
              </div>
              <HeroVisual />
            </div>
          </div>
        </section>

        {/* Trust */}
        <div className="border-b border-slate-200/30 bg-white/60">
          <div className={`${shell} py-12 md:py-14`}>
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Trusted by growing teams
            </p>
            <TrustLogosRow />
          </div>
        </div>

        {/* Features */}
        <section className={`${sectionY} border-b border-slate-200/30 bg-white`} aria-labelledby="features-heading">
          <div className={shell}>
            <h2
              id="features-heading"
              className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-[#0a0a0a] md:text-4xl md:leading-[1.12]"
            >
              Built for operators who need clarity fast
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              Fewer tools. Fewer mistakes. More time running the business.
            </p>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:gap-8">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl bg-[#fafafa] p-9 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition duration-300 ease-out hover:-translate-y-1 hover:bg-white hover:shadow-[0_20px_50px_-24px_rgba(15,23,42,0.12)] md:p-10"
                >
                  <FeatureIcon type={f.icon} />
                  <h3 className="mt-8 text-xl font-semibold tracking-tight text-[#0a0a0a]">{f.title}</h3>
                  <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-slate-600">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Product — tangible UI */}
        <section
          id="product"
          className={`${sectionY} scroll-mt-24 border-b border-slate-200/30 bg-[#fafafa]`}
          aria-labelledby="product-heading"
        >
          <div className={shell}>
            <h2
              id="product-heading"
              className="text-3xl font-semibold leading-tight tracking-tight text-[#0a0a0a] md:text-4xl md:leading-[1.12]"
            >
              Everything in one place
            </h2>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              One workspace connects planning, approvals, and hours — so nothing falls through the cracks.
            </p>

            <div className="relative mt-14 rounded-2xl border border-slate-200/50 bg-white p-6 shadow-[0_20px_60px_-28px_rgba(15,23,42,0.12)] md:p-10 lg:p-12">
              <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-4">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                </div>
                <span className="text-xs text-slate-400">planyo.app / schedule</span>
              </div>

              <div className="relative">
                <ScheduleGridMock />

                <div className="pointer-events-none absolute -right-1 top-[18%] hidden max-w-[140px] rounded-xl border-l-2 border-blue-500/60 bg-white/95 pl-3 py-2 text-left shadow-sm md:block">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700/80">Approve shifts</p>
                  <p className="text-xs leading-snug text-slate-600">One click, one source of truth.</p>
                </div>
                <div className="pointer-events-none absolute bottom-[28%] left-0 hidden max-w-[140px] rounded-xl border-l-2 border-blue-500/60 bg-white/95 pl-3 py-2 text-left shadow-sm md:block">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700/80">Track hours</p>
                  <p className="text-xs leading-snug text-slate-600">Planned vs. worked, always visible.</p>
                </div>
                <div className="pointer-events-none absolute right-[8%] top-0 hidden max-w-[140px] rounded-xl border-l-2 border-blue-500/60 bg-white/95 pl-3 py-2 text-left shadow-sm lg:block">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700/80">Avoid conflicts</p>
                  <p className="text-xs leading-snug text-slate-600">See gaps before they hit service.</p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 text-sm text-slate-600 md:hidden">
                <p>
                  <span className="font-semibold text-[#0a0a0a]">Approve shifts</span> — one click, one source of truth.
                </p>
                <p>
                  <span className="font-semibold text-[#0a0a0a]">Track hours</span> — planned vs. worked, visible.
                </p>
                <p>
                  <span className="font-semibold text-[#0a0a0a]">Avoid conflicts</span> — catch gaps early.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className={`${sectionY} scroll-mt-24 border-b border-slate-200/30 bg-white`}
          aria-labelledby="how-heading"
        >
          <div className={shell}>
            <h2
              id="how-heading"
              className="text-3xl font-semibold leading-tight tracking-tight text-[#0a0a0a] md:text-4xl md:leading-[1.12]"
            >
              How it works
            </h2>
            <p className="mt-5 max-w-xl text-lg text-slate-600">Three calm steps from signup to a week you can trust.</p>

            <div className="mx-auto mt-16 hidden max-w-4xl md:block">
              <div className="relative px-6 lg:px-10">
                <div
                  className="absolute left-[14%] right-[14%] top-7 h-px bg-slate-200"
                  aria-hidden
                />
                <div className="relative flex justify-between">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className="z-10 flex h-14 w-14 items-center justify-center rounded-full bg-[#0a0a0a] text-lg font-semibold text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)] ring-4 ring-white"
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-12 grid grid-cols-3 gap-8 lg:gap-12">
                {steps.map((s) => (
                  <div key={s.title} className="text-center">
                    <p className="text-lg font-semibold tracking-tight text-[#0a0a0a]">{s.title}</p>
                    <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{s.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <ol className="mt-12 space-y-10 border-l-2 border-slate-200 pl-8 md:hidden">
              {steps.map((s, i) => (
                <li key={s.title} className="relative">
                  <span className="absolute -left-[calc(2rem+5px)] top-0 flex h-10 w-10 items-center justify-center rounded-full bg-[#0a0a0a] text-sm font-semibold text-white">
                    {i + 1}
                  </span>
                  <p className="text-lg font-semibold text-[#0a0a0a]">{s.title}</p>
                  <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Testimonials */}
        <section className={`${sectionY} bg-[#f4f4f5]/80`} aria-labelledby="quotes-heading">
          <div className={shell}>
            <h2
              id="quotes-heading"
              className="text-3xl font-semibold leading-tight tracking-tight text-[#0a0a0a] md:text-4xl md:leading-[1.12]"
            >
              Teams stay calmer with one system
            </h2>
            <div className="mt-14 grid gap-6 md:grid-cols-3 md:gap-5">
              {testimonials.map((t) => (
                <figure
                  key={t.role}
                  className="rounded-2xl bg-white/90 p-8 shadow-[0_2px_12px_rgba(15,23,42,0.04)] transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_16px_40px_-20px_rgba(15,23,42,0.1)] md:p-9"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                    {t.initials}
                  </div>
                  <blockquote className="mt-6 text-lg font-medium leading-snug tracking-tight text-[#0a0a0a] md:text-xl md:leading-snug">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-6 text-sm text-slate-500">— {t.role}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section
          className={`${sectionY} bg-[#0c1f2e]`}
          aria-labelledby="cta-heading"
        >
          <div className={`${shell} text-center`}>
            <h2
              id="cta-heading"
              className="text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl md:leading-[1.12]"
            >
              Stop wasting hours on scheduling
            </h2>
            <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-slate-300">
              Start your Planyo workspace today.
            </p>
            <Link
              href="/create-company"
              className="mt-10 inline-flex rounded-xl bg-white px-10 py-3.5 text-[15px] font-semibold text-[#0c1f2e] shadow-lg shadow-black/20 transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-xl active:translate-y-0"
            >
              Create free workspace
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/60 bg-white py-10 text-center text-sm text-slate-500">
        <div className={shell}>© {new Date().getFullYear()} Planyo</div>
      </footer>
    </div>
  );
}
