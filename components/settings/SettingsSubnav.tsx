"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/settings/general", label: "General" },
  { href: "/settings/schedule", label: "Schedule" },
  { href: "/settings/employees", label: "Employees" },
  { href: "/settings/payroll", label: "Payroll" },
  { href: "/settings/security", label: "Security" },
] as const;

const base =
  "rounded-xl px-3 py-2 text-sm font-medium transition ring-1 ring-transparent";
const idle = "text-slate-600 hover:bg-white hover:ring-slate-200";
const active = "bg-white font-semibold text-slate-900 ring-slate-200 shadow-sm";

export default function SettingsSubnav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Settings sections" className="flex flex-col gap-1">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`${base} ${pathname === l.href ? active : idle}`}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
