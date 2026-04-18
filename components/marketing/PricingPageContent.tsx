"use client";

import Link from "next/link";
import { useState } from "react";

const shell = "mx-auto w-full max-w-[1200px] px-5 md:px-8";
const sectionY = "py-20 md:py-24 lg:py-28";

type Billing = "monthly" | "yearly";

const DISCOUNT = 0.2;

function formatEuro(n: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

function monthlyEquivalent(monthly: number, billing: Billing) {
  if (billing === "monthly") return monthly;
  return Math.round((monthly * (1 - DISCOUNT) + Number.EPSILON) * 100) / 100;
}

const faqs = [
  {
    q: "Can I change plan anytime?",
    a: "Yes. Upgrade or downgrade whenever your team’s needs change — no lock-in.",
  },
  {
    q: "Is there a free trial?",
    a: "Growth and Pro include a free trial so you can run real schedules before you pay.",
  },
  {
    q: "Do employees need accounts?",
    a: "Yes. Invited employees get secure access to their own schedule, hours, and availability.",
  },
  {
    q: "Does payroll include taxes?",
    a: "No. Planyo focuses on hours and pay estimates. Exports are ready for your accountant or payroll tool.",
  },
  {
    q: "What payment methods do you support?",
    a: "Card billing for subscriptions. More options can ship as we connect real payments.",
  },
];

const comparisonRows: { label: string; starter: string; growth: string; pro: string }[] = [
  { label: "Employees", starter: "Up to 5", growth: "Unlimited", pro: "Unlimited" },
  { label: "Scheduling", starter: "✓", growth: "✓", pro: "✓" },
  { label: "Payroll", starter: "—", growth: "✓", pro: "✓" },
  { label: "Reports", starter: "Basic", growth: "Full", pro: "Advanced" },
  { label: "Support", starter: "Email", growth: "Email", pro: "Priority" },
  { label: "API", starter: "—", growth: "—", pro: "✓" },
];

export default function PricingPageContent() {
  const [billing, setBilling] = useState<Billing>("monthly");

  const growthPrice = monthlyEquivalent(29, billing);
  const proPrice = monthlyEquivalent(79, billing);

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#0a0a0a] antialiased">
      <main>
        {/* Hero */}
        <section className={`${sectionY} border-b border-slate-200/60 bg-white`}>
          <div className={`${shell} text-center`}>
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-[#0a0a0a] sm:text-5xl md:text-[3rem]">
              Simple pricing for growing teams
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600 md:text-xl">
              Start free. Upgrade when your team grows.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4">
              <div
                className="inline-flex rounded-full border border-slate-200/90 bg-slate-50/90 p-1 shadow-sm"
                role="group"
                aria-label="Billing period"
              >
                <button
                  type="button"
                  onClick={() => setBilling("monthly")}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition duration-200 ease-out ${
                    billing === "monthly"
                      ? "bg-white text-[#0a0a0a] shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBilling("yearly")}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition duration-200 ease-out ${
                    billing === "yearly"
                      ? "bg-white text-[#0a0a0a] shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Yearly
                  <span className="ml-1.5 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-emerald-800">
                    Save 20%
                  </span>
                </button>
              </div>
              <p className="text-sm text-slate-500">No credit card for Starter • Cancel anytime</p>
            </div>
          </div>
        </section>

        {/* Pricing cards */}
        <section className={`${sectionY} bg-[#fafafa]`} aria-labelledby="plans-heading">
          <div className={shell}>
            <h2 id="plans-heading" className="sr-only">
              Plans
            </h2>
            <div className="mx-auto grid max-w-5xl gap-6 overflow-x-clip lg:grid-cols-3 lg:items-stretch lg:gap-8">
              {/* Starter */}
              <div className="order-2 flex flex-col rounded-2xl border border-slate-200/80 bg-white p-8 shadow-[0_4px_24px_-8px_rgba(15,23,42,0.08)] transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_20px_48px_-16px_rgba(15,23,42,0.12)] lg:order-1 lg:p-10">
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Starter</p>
                <p className="mt-4 text-4xl font-semibold tracking-tight text-[#0a0a0a]">Free</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">Small teams getting started</p>
                <ul className="mt-8 flex flex-col gap-3 text-sm text-slate-600">
                  <li className="flex gap-2"><span className="text-emerald-600">✓</span> Up to 5 employees</li>
                  <li className="flex gap-2"><span className="text-emerald-600">✓</span> Basic scheduling</li>
                  <li className="flex gap-2"><span className="text-emerald-600">✓</span> Availability tracking</li>
                  <li className="flex gap-2"><span className="text-emerald-600">✓</span> Limited reports</li>
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

              {/* Growth — highlighted */}
              <div className="order-1 relative flex flex-col rounded-2xl border-2 border-[#0a0a0a] bg-white p-9 shadow-[0_24px_64px_-20px_rgba(15,23,42,0.18)] transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_28px_72px_-20px_rgba(15,23,42,0.22)] lg:order-2 lg:-mt-2 lg:scale-[1.015] lg:p-11 lg:pb-12">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#0a0a0a] px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  Most popular
                </span>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Growth</p>
                <p className="mt-4 flex items-baseline gap-1 text-4xl font-semibold tracking-tight text-[#0a0a0a] lg:text-5xl">
                  <span className="transition-opacity duration-200" key={billing}>
                    {formatEuro(growthPrice)}
                  </span>
                  <span className="text-lg font-medium text-slate-500">/ month</span>
                </p>
                {billing === "yearly" ? (
                  <p className="mt-1 text-xs text-slate-500">Billed annually (20% off)</p>
                ) : (
                  <p className="mt-1 text-xs text-transparent">.</p>
                )}
                <p className="mt-3 text-sm leading-relaxed text-slate-600">Growing teams that need control</p>
                <ul className="mt-8 flex flex-col gap-3 text-sm text-slate-600">
                  <li className="flex gap-2"><span className="text-emerald-600">✓</span> Unlimited employees</li>
                  <li className="flex gap-2"><span className="text-emerald-600">✓</span> Shift approvals</li>
                  <li className="flex gap-2"><span className="text-emerald-600">✓</span> Payroll calculations</li>
                  <li className="flex gap-2"><span className="text-emerald-600">✓</span> Employee groups &amp; roles</li>
                  <li className="flex gap-2"><span className="text-emerald-600">✓</span> Reports &amp; insights</li>
                  <li className="flex gap-2"><span className="text-emerald-600">✓</span> Email invites</li>
                </ul>
                <div className="mt-10">
                  <Link
                    href="/create-company"
                    className="block w-full rounded-xl bg-[#0a0a0a] py-3.5 text-center text-sm font-semibold text-white shadow-lg transition duration-200 hover:bg-slate-800 hover:shadow-xl"
                  >
                    Start free trial
                  </Link>
                </div>
              </div>

              {/* Pro */}
              <div className="order-3 flex flex-col rounded-2xl border border-slate-200/80 bg-white p-8 shadow-[0_4px_24px_-8px_rgba(15,23,42,0.08)] transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_20px_48px_-16px_rgba(15,23,42,0.12)] lg:order-3 lg:p-10">
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Pro</p>
                <p className="mt-4 flex items-baseline gap-1 text-4xl font-semibold tracking-tight text-[#0a0a0a]">
                  <span className="transition-opacity duration-200" key={`pro-${billing}`}>
                    {formatEuro(proPrice)}
                  </span>
                  <span className="text-lg font-medium text-slate-500">/ month</span>
                </p>
                {billing === "yearly" ? (
                  <p className="mt-1 text-xs text-slate-500">Billed annually (20% off)</p>
                ) : (
                  <p className="mt-1 text-xs text-transparent">.</p>
                )}
                <p className="mt-3 text-sm leading-relaxed text-slate-600">Advanced operations</p>
                <ul className="mt-8 flex flex-col gap-3 text-sm text-slate-600">
                  <li className="flex gap-2"><span className="text-emerald-600">✓</span> Everything in Growth</li>
                  <li className="flex gap-2"><span className="text-emerald-600">✓</span> Advanced reports</li>
                  <li className="flex gap-2"><span className="text-emerald-600">✓</span> API access</li>
                  <li className="flex gap-2"><span className="text-emerald-600">✓</span> Multi-location support</li>
                  <li className="flex gap-2"><span className="text-emerald-600">✓</span> Priority support</li>
                </ul>
                <div className="mt-10 flex flex-col gap-3">
                  <Link
                    href="/create-company"
                    className="block w-full rounded-xl bg-[#0a0a0a] py-3.5 text-center text-sm font-semibold text-white shadow-lg transition duration-200 hover:bg-slate-800"
                  >
                    Start trial
                  </Link>
                  <a
                    href="mailto:hello@planyo.app?subject=Planyo%20Pro%20—%20sales"
                    className="block w-full rounded-xl border border-slate-200 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Contact sales
                  </a>
                </div>
              </div>
            </div>

            <p className="mx-auto mt-12 max-w-lg text-center text-sm text-slate-500">
              Teams on Growth say the switch paid for itself in saved admin time — not because of hype, but because
              everyone finally works from one schedule.
            </p>
          </div>
        </section>

        {/* Comparison */}
        <section className={`${sectionY} border-t border-slate-200/60 bg-white`} aria-labelledby="compare-heading">
          <div className={shell}>
            <h2
              id="compare-heading"
              className="text-center text-2xl font-semibold tracking-tight text-[#0a0a0a] md:text-3xl"
            >
              Compare plans
            </h2>
            <div className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-4 py-4 font-semibold text-slate-500 md:px-6">Feature</th>
                    <th className="px-3 py-4 text-center font-semibold text-[#0a0a0a] md:px-5">Starter</th>
                    <th className="px-3 py-4 text-center font-semibold text-[#0a0a0a] md:px-5">Growth</th>
                    <th className="px-3 py-4 text-center font-semibold text-[#0a0a0a] md:px-5">Pro</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.label} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-4 font-medium text-slate-700 md:px-6">{row.label}</td>
                      <td className="px-3 py-4 text-center text-slate-600 tabular-nums md:px-5">{row.starter}</td>
                      <td className="px-3 py-4 text-center text-slate-600 md:px-5">{row.growth}</td>
                      <td className="px-3 py-4 text-center text-slate-600 md:px-5">{row.pro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={`${sectionY} bg-[#fafafa]`} aria-labelledby="faq-heading">
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
              Start managing your team the smart way
            </h2>
            <p className="mx-auto mt-5 max-w-md text-lg text-slate-300">No setup. No complexity.</p>
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
