"use client";

import type { ReactNode } from "react";
import Link from "next/link";

const linkClass =
  "rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800/80 hover:text-white";

type EmployeePortalShellProps = {
  displayName: string;
  companyName: string | null;
  activeHref: string;
  children: ReactNode;
};

const navLinks: { href: string; label: string }[] = [
  { href: "/app", label: "Home" },
  { href: "/app/your-schedule", label: "Your schedule" },
  { href: "/app/your-availability", label: "Your availability" },
  { href: "/app/punch-clock", label: "Punch clock" },
];

/**
 * Compact workspace chrome for member self-service routes (matches dark nav tone).
 */
export default function EmployeePortalShell({
  displayName,
  companyName,
  activeHref,
  children,
}: EmployeePortalShellProps) {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950 text-slate-100 shadow-lg shadow-slate-950/20">
        <div className="flex h-14 w-full items-center justify-between px-4 xl:px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight text-white" title="Planyo marketing site">
            Planyo
          </Link>
          <span className="max-w-[50%] truncate text-sm text-slate-300">{displayName}</span>
        </div>
        <nav
          aria-label="Member shortcuts"
          className="flex flex-wrap items-center gap-x-0.5 gap-y-1 border-t border-slate-800/80 px-2 py-2 xl:px-4"
        >
          {navLinks.map((item) => {
            const active = activeHref === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${linkClass} ${active ? "bg-slate-800 text-white" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        {companyName ? (
          <p className="border-t border-slate-800/60 px-4 py-1.5 text-xs text-slate-500">{companyName}</p>
        ) : null}
      </header>
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}
