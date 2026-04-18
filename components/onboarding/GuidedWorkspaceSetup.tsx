"use client";

import { useMemo } from "react";

export type GuidedChecklistStep = {
  id: string;
  title: string;
  description: string;
  done: boolean;
  ctaLabel: string;
  onCta: () => void;
};

export type GuidedWorkspaceSetupProps = {
  open: boolean;
  steps: GuidedChecklistStep[];
  currentIndex: number;
  onDismiss: () => void;
};

export default function GuidedWorkspaceSetup({
  open,
  steps,
  currentIndex,
  onDismiss,
}: GuidedWorkspaceSetupProps) {
  const completedCount = useMemo(() => steps.filter((s) => s.done).length, [steps]);
  const progressPercent = steps.length ? Math.round((completedCount / steps.length) * 100) : 0;

  if (!open) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[72] flex justify-end p-4 sm:inset-x-auto sm:right-5 sm:top-24 sm:bottom-auto sm:left-auto sm:p-0"
      role="region"
      aria-label="Workspace setup guide"
    >
      <div
        className="pointer-events-auto w-full max-w-md origin-bottom animate-in fade-in slide-in-from-bottom-3 duration-300 sm:origin-top-right sm:slide-in-from-bottom-0 sm:slide-in-from-right-4"
        style={{ animationFillMode: "both" }}
      >
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-2xl shadow-slate-900/10 ring-1 ring-slate-900/[0.04] backdrop-blur-md">
          <div className="border-b border-slate-100 bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 px-5 py-4 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-100/90">
                  Setup
                </p>
                <h2 className="mt-1 text-lg font-bold tracking-tight">Let&apos;s set up your workspace</h2>
              </div>
              <button
                type="button"
                onClick={onDismiss}
                className="shrink-0 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-white/20"
              >
                Skip
              </button>
            </div>
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-indigo-100">
                <span>Progress</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-black/20">
                <div
                  className="h-full rounded-full bg-white transition-[width] duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <ul className="max-h-[min(60vh,28rem)] space-y-0 divide-y divide-slate-100 overflow-y-auto px-2 py-2">
            {steps.map((step, i) => {
              const isCurrent = i === currentIndex;
              return (
                <li key={step.id}>
                  <div
                    className={`flex flex-col gap-2 rounded-xl px-3 py-3 transition-colors ${
                      isCurrent ? "bg-indigo-50/80 ring-1 ring-indigo-100" : "hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          step.done
                            ? "bg-emerald-500 text-white shadow-sm"
                            : isCurrent
                              ? "bg-indigo-600 text-white shadow-sm"
                              : "border border-slate-200 bg-white text-slate-400"
                        }`}
                        aria-hidden
                      >
                        {step.done ? "✓" : i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{step.description}</p>
                      </div>
                    </div>
                    <div className="pl-9">
                      <button
                        type="button"
                        onClick={step.onCta}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm transition ${
                          isCurrent
                            ? "bg-slate-900 text-white hover:bg-slate-800"
                            : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                        }`}
                      >
                        {step.ctaLabel}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
