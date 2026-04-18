"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Shift } from "../../types/schedule";
import { addDays, formatWeekRange, getPlannedHours, startOfWeek, toDateInputValue } from "../../lib/utils";

type EmployeeRow = { name: string; active: boolean };

type ContractedHoursClientProps = {
  companyId: string;
  companyName: string | null;
  employees: EmployeeRow[];
  shiftsThisWeek: Shift[];
};

function storageKey(companyId: string) {
  return `planyo_weekly_contract_hours_v1_${companyId}`;
}

function loadTargets(companyId: string): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(storageKey(companyId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(parsed)) {
      const n = Number(v);
      if (!Number.isNaN(n) && n >= 0) out[k] = n;
    }
    return out;
  } catch {
    return {};
  }
}

function saveTargets(companyId: string, targets: Record<string, number>) {
  try {
    localStorage.setItem(storageKey(companyId), JSON.stringify(targets));
  } catch {
    /* ignore quota */
  }
}

export default function ContractedHoursClient({
  companyId,
  companyName,
  employees,
  shiftsThisWeek,
}: ContractedHoursClientProps) {
  const weekStart = useMemo(() => startOfWeek(new Date()), []);
  const weekLabel = useMemo(() => formatWeekRange(weekStart).range, [weekStart]);
  const weekDateSet = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i < 7; i++) {
      set.add(toDateInputValue(addDays(weekStart, i)));
    }
    return set;
  }, [weekStart]);

  const plannedByEmployee = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const e of employees) acc[e.name] = 0;
    for (const s of shiftsThisWeek) {
      if (!weekDateSet.has(s.date)) continue;
      if (!acc[s.employee]) acc[s.employee] = 0;
      acc[s.employee] += getPlannedHours(s);
    }
    return acc;
  }, [employees, shiftsThisWeek, weekDateSet]);

  const [targets, setTargets] = useState<Record<string, number>>({});

  useEffect(() => {
    setTargets(loadTargets(companyId));
  }, [companyId]);

  const activeEmployees = useMemo(() => employees.filter((e) => e.active), [employees]);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {companyName || "Workspace"}
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Contracted hours</h1>
            <p className="mt-1 text-sm text-slate-600">
              Set a weekly target per person. Planned hours use scheduled shifts for{" "}
              <span className="font-semibold text-slate-800">{weekLabel}</span> (this week).
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex w-fit items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
          >
            Back to workspace
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Employee</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Weekly target (h)
                </th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Planned (h)
                </th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Difference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeEmployees.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                    No active employees yet. Add people under People → Employees.
                  </td>
                </tr>
              ) : (
                activeEmployees.map((emp) => {
                  const hasTarget = Object.prototype.hasOwnProperty.call(targets, emp.name);
                  const target = hasTarget ? targets[emp.name] : 0;
                  const planned = plannedByEmployee[emp.name] ?? 0;
                  const diff = planned - target;
                  const diffLabel =
                    !hasTarget && planned <= 0
                      ? "—"
                      : diff > 0.05
                        ? `+${diff.toFixed(1)} over`
                        : diff < -0.05
                          ? `${diff.toFixed(1)} under`
                          : "On target";
                  const diffClass =
                    !hasTarget && planned <= 0
                      ? "text-slate-400"
                      : diff > 0.05
                        ? "font-semibold text-amber-800"
                        : diff < -0.05
                          ? "font-semibold text-sky-800"
                          : "font-semibold text-emerald-800";

                  return (
                    <tr key={emp.name}>
                      <td className="px-4 py-3 font-medium text-slate-900">{emp.name}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={0}
                          max={80}
                          step={0.5}
                          value={hasTarget ? target : ""}
                          placeholder="e.g. 37"
                          onChange={(e) => {
                            const raw = e.target.value;
                            setTargets((prev) => {
                              let next: Record<string, number>;
                              if (raw === "") {
                                next = { ...prev };
                                delete next[emp.name];
                              } else {
                                const n = Math.max(0, Math.min(80, Number(raw)));
                                next = { ...prev, [emp.name]: Number.isNaN(n) ? 0 : n };
                              }
                              saveTargets(companyId, next);
                              return next;
                            });
                          }}
                          className="w-28 rounded-md border border-slate-200 px-2 py-1.5 text-sm tabular-nums shadow-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                          aria-label={`Weekly target hours for ${emp.name}`}
                        />
                      </td>
                      <td className="px-4 py-3 tabular-nums text-slate-700">{planned.toFixed(1)}</td>
                      <td className={`px-4 py-3 tabular-nums ${diffClass}`}>{diffLabel}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-500">
          Targets are stored in this browser for now ({storageKey(companyId)}). Planned hours are computed from
          published shifts in the current week.
        </p>
      </div>
    </main>
  );
}
