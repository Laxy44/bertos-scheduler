"use client";

import Link from "next/link";
import { useState } from "react";

const shell = "mx-auto w-full max-w-[1200px] px-5 md:px-8";
const sectionY = "py-20 md:py-24 lg:py-28";

const starterFeatures = [
  "Up to 5 employees",
  "Basic scheduling",
  "Availability tracking",
  "Limited reports",
];

const premiumFeatures = [
  "Unlimited employees",
  "Shift approvals",
  "Payroll calculations",
  "Reports & insights",
  "Priority support",
];

const faqs = [
  {
    q: "What's included in Starter?",
    a: "Starter is free for small teams: scheduling, availability, and core reports for up to five employees. No credit card required.",
  },
  {
    q: "When will Premium launch?",
    a: "We're finishing Premium for teams that need more control and scale. Join the waitlist to hear first when it's ready.",
  },
  {
    q: "Do employees need accounts?",
    a: "Yes. Invited employees get secure access to their schedule, hours, and availability.",
  },
  {
    q: "Does payroll include taxes?",
    a: "No. Planyo focuses on hours and pay estimates. Use exports with your accountant or payroll tool.",
  },
  {
    q: "Can we change plans later?",
    a: "Yes. You'll be able to move to Premium when it launches — we'll keep migrations simple.",
  },
];

export default function PricingPageContent() {
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSent, setWaitlistSent] = useState(false);

  function handleWaitlistSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!waitlistEmail.trim()) return;
    setWaitlistSent(true);
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#0a0a0a] antialiased">
      <main>
        {/* Hero */}
        <section className={`${sectionY} border-b border-slate-200/60 bg-white`}>
          <div className={`${shell} text-center`}>
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-[#0a0a0a] sm:text-5xl md:text-[3rem]">
              Start free. Premium coming soon.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600 md:text-xl">
              We're building advanced features for growing teams.
            </p>
            <p className="mx-auto mt-4 max-w-md text-sm text-slate-500">
              No credit card for Starter. Upgrade when Premium is ready.
            </p>
          </div>
        </section>

        {/* Plans */}
        <section className={`${sectionY} bg-[#fafafa]`} aria-labelledby="plans-heading">
          <div className={shell}>
            <h2 id="plans-heading" className="sr-only">
              Plans
            </h2>
            <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2 md:items-stretch md:gap-10">
              {/* Starter — Free */}
              <div className="flex flex-col rounded-2xl border border-slate-200/90 bg-white p-8 shadow-[0_4px_24px_-8px_rgba(15,23,42,0.06)] md:p-10">
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Starter</p>
                <p className="mt-4 text-4xl font-semibold tracking-tight text-[#0a0a0a]">Free</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Perfect for small teams getting started
                </p>
                <ul className="mt-8 flex flex-col gap-3 text-sm text-slate-600">
                  {starterFeatures.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="shrink-0 text-emerald-600" aria-hidden>
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-10">
                  <Link
                    href="/create-company"
                    className="block w-full rounded-xl border border-slate-200 bg-white py-3.5 text-center text-sm font-semibold text-[#0a0a0a] shadow-sm transition duration-200 hover:border-slate-300 hover:bg-slate-50"
                  >
                    Get started free
                  </Link>
                </div>
              </div>

              {/* Premium — Coming soon */}
              <div className="relative flex flex-col rounded-2xl border border-indigo-200/80 bg-white p-8 shadow-[0_0_0_1px_rgba(99,102,241,0.08),0_8px_40px_-12px_rgba(79,70,229,0.2),0_24px_48px_-20px_rgba(15,23,42,0.08)] ring-1 ring-indigo-500/10 md:p-10">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-indigo-200/80 bg-indigo-50 px-3.5 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-800 shadow-sm">
                  Coming soon
                </span>
                <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600/90">Premium</p>
                <p className="mt-4 text-4xl font-semibold tracking-tight text-[#0a0a0a]">Coming soon</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  For growing teams that need more control
                </p>
                <ul className="mt-8 flex flex-col gap-3 text-sm text-slate-600">
                  {premiumFeatures.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="shrink-0 text-indigo-500" aria-hidden>
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-10 flex flex-col gap-3">
                  <button
                    type="button"
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 py-3.5 text-center text-sm font-semibold text-slate-400 opacity-70"
                  >
                    Coming soon
                  </button>
                </div>

                <div className="mt-10 border-t border-slate-100 pt-8">
                  <p className="text-center text-sm font-medium text-slate-700">Want early access?</p>
                  {waitlistSent ? (
                    <p className="mt-3 text-center text-sm text-emerald-700" role="status">
                      Thanks — we'll reach out when Premium opens.
                    </p>
                  ) : (
                    <form
                      onSubmit={handleWaitlistSubmit}
                      className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-stretch"
                    >
                      <label htmlFor="waitlist-email" className="sr-only">
                        Email for waitlist
                      </label>
                      <input
                        id="waitlist-email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@company.com"
                        value={waitlistEmail}
                        onChange={(e) => setWaitlistEmail(e.target.value)}
                        className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-[#0a0a0a] shadow-sm outline-none ring-indigo-500/0 transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
                      />
                      <button
                        type="submit"
                        className="shrink-0 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3 text-sm font-semibold text-indigo-900 transition hover:border-indigo-300 hover:bg-indigo-100"
                      >
                        Join waitlist
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={`${sectionY} border-t border-slate-200/60 bg-white`} aria-labelledby="faq-heading">
          <div className={`${shell} max-w-3xl`}>
            <h2 id="faq-heading" className="text-2xl font-semibold tracking-tight text-[#0a0a0a] md:text-3xl">
              Questions
            </h2>
            <dl className="mt-10 space-y-8">
              {faqs.map((item) => (
                <div key={item.q}>
                  <dt className="text-base font-semibold text-[#0a0a0a]">{item.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-slate-600 md:text-base">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Final CTA */}
        <section className={`${sectionY} bg-[#0c1f2e]`} aria-labelledby="pricing-cta">
          <div className={`${shell} text-center`}>
            <h2 id="pricing-cta" className="text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl">
              Start with Starter today
            </h2>
            <p className="mx-auto mt-5 max-w-md text-lg text-slate-300">
              Free for small teams. Premium when you’re ready to grow.
            </p>
            <Link
              href="/create-company"
              className="mt-10 inline-flex rounded-xl bg-white px-10 py-3.5 text-sm font-semibold text-[#0c1f2e] shadow-lg transition duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-xl"
            >
              Create free workspace
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/80 bg-white py-10 text-center text-sm text-slate-500">
        <div className={shell}>
          <Link href="/" className="font-medium text-slate-600 hover:text-[#0a0a0a]">
            ← Back to home
          </Link>
          <span className="mx-3 text-slate-300">|</span>
          © {new Date().getFullYear()} Planyo
        </div>
      </footer>
    </div>
  );
}
