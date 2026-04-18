"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type LandingHeaderProps = {
  isAuthenticated?: boolean;
};

export default function LandingHeader({ isAuthenticated = false }: LandingHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-[background-color,box-shadow,border-color] duration-300 ease-out ${
        scrolled
          ? "border-slate-200/70 bg-white/88 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-xl"
          : "border-transparent bg-white/50 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-[4.25rem] max-w-[1200px] items-center justify-between px-5 md:px-8">
        <Link href="/" className="text-[17px] font-semibold tracking-tight text-[#0a0a0a]">
          Planyo
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Marketing">
          <Link
            href="/pricing"
            className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors duration-200 hover:text-slate-900"
          >
            Pricing
          </Link>
          {isAuthenticated ? (
            <Link
              href="/app"
              className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors duration-200 hover:text-slate-900"
            >
              Open workspace
            </Link>
          ) : null}
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-colors duration-200 hover:text-slate-900"
          >
            Login
          </Link>
          <Link
            href="/create-company"
            className="ml-1 rounded-xl bg-[#0a0a0a] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md active:translate-y-0"
          >
            Start free
          </Link>
        </nav>
      </div>
    </header>
  );
}
