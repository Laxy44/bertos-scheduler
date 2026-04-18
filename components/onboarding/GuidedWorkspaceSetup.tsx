"use client";

import { useMemo, useState } from "react";

export type GuidedWorkspaceSetupProps = {
  open: boolean;
  hasEmployeeGroups: boolean;
  hasEmployees: boolean;
  hasShifts: boolean;
  onDismiss: () => void;
  onCreateDefaultGroup: () => Promise<void>;
  onOpenEmployeeGroups: () => void;
  onOpenEmployees: () => void;
  onCreateShift: () => void;
};

export default function GuidedWorkspaceSetup({
  open,
  hasEmployeeGroups,
  hasEmployees,
  hasShifts,
  onDismiss,
  onCreateDefaultGroup,
  onOpenEmployeeGroups,
  onOpenEmployees,
  onCreateShift,
}: GuidedWorkspaceSetupProps) {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const steps = useMemo(() => {
    type Step = {
      title: string;
      body: string;
      primary: { label: string; action: () => void | Promise<void> };
      secondary?: { label: string; action: () => void };
      skip?: { label: string; action: () => void };
    };

    const list: Step[] = [
      {
        title: "Welcome to your workspace",
        body: "We’ll walk through a few quick steps so you can run your first week in Planyo.",
        primary: { label: "Start", action: () => setStep(1) },
      },
      {
        title: "Organize with groups (optional)",
        body: "Employee groups help with roles and payroll defaults. You can skip and add groups later under People.",
        primary: hasEmployeeGroups
          ? { label: "Continue", action: () => setStep(2) }
          : {
              label: "Create “General” group",
              action: async () => {
                setErr(null);
                setBusy(true);
                try {
                  await onCreateDefaultGroup();
                  setStep(2);
                } catch (e) {
                  setErr(e instanceof Error ? e.message : "Could not create group.");
                } finally {
                  setBusy(false);
                }
              },
            },
        secondary: { label: "Manage groups", action: () => onOpenEmployeeGroups() },
        skip: { label: "Skip", action: () => setStep(2) },
      },
      {
        title: "Add your team",
        body: "Add anyone who should appear on the schedule. When you’re done, come back to Home — this guide stays open until you create your first shift.",
        primary: hasEmployees
          ? { label: "Continue", action: () => setStep(3) }
          : { label: "Open Employees", action: () => onOpenEmployees() },
      },
      {
        title: "Create your first shift",
        body: "Pick a day, assign someone, and save your first shift. That unlocks week totals and payroll.",
        primary: hasShifts
          ? { label: "Finish", action: () => onDismiss() }
          : { label: "Create shift", action: () => onCreateShift() },
      },
    ];
    return list;
  }, [
    hasEmployeeGroups,
    hasEmployees,
    hasShifts,
    onCreateDefaultGroup,
    onCreateShift,
    onDismiss,
    onOpenEmployeeGroups,
    onOpenEmployees,
  ]);

  if (!open) return null;

  const current = steps[Math.min(step, steps.length - 1)];

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onDismiss}
      />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">First-time setup</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">{current.title}</h2>
          <div className="mt-3 flex gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-indigo-600" : "bg-slate-200"}`}
              />
            ))}
          </div>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm leading-relaxed text-slate-600">{current.body}</p>
          {err ? (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 ring-1 ring-red-100">{err}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
          <button
            type="button"
            onClick={onDismiss}
            className="text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            Skip setup
          </button>
          <div className="flex flex-wrap gap-2">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Back
              </button>
            ) : null}
            {"secondary" in current && current.secondary ? (
              <button
                type="button"
                onClick={current.secondary.action}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                {current.secondary.label}
              </button>
            ) : null}
            {"skip" in current && current.skip && step === 1 ? (
              <button
                type="button"
                onClick={current.skip.action}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                {current.skip.label}
              </button>
            ) : null}
            <button
              type="button"
              disabled={busy}
              onClick={() => void current.primary.action()}
              className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
            >
              {busy ? "Please wait…" : current.primary.label}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
