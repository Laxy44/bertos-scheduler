"use client";

import type { Shift } from "../../types/schedule";
import {
  earningsForShift,
  endDisplayForShift,
  hoursForPayrollShift,
  startDisplayForShift,
} from "../../lib/payroll/compute";

type EmployeePayrollDetailProps = {
  workspaceName: string;
  employeeName: string;
  periodLabel: string;
  hourlyRate: number;
  totalHours: number;
  totalEarnings: number;
  shifts: Shift[];
  formatDKK: (n: number) => string;
  currencyCode?: string;
  onBack: () => void;
};

export default function EmployeePayrollDetail({
  workspaceName,
  employeeName,
  periodLabel,
  hourlyRate,
  totalHours,
  totalEarnings,
  shifts,
  formatDKK,
  currencyCode = "DKK",
  onBack,
}: EmployeePayrollDetailProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 md:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={onBack}
              className="mb-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              ← Back to overview
            </button>
            <h2 className="text-lg font-semibold text-slate-900">Employee payroll</h2>
            <p className="mt-1 text-sm text-slate-500">
              {workspaceName} · <span className="font-medium text-slate-700">{employeeName}</span> ·{" "}
              {periodLabel}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 border-b border-slate-100 p-5 md:grid-cols-3 md:p-6">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hourly rate</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">
            {hourlyRate.toFixed(2)} {currencyCode}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total hours</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">{totalHours.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Total earnings</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-emerald-900">{formatDKK(totalEarnings)}</p>
        </div>
      </div>

      <div className="overflow-x-auto p-5 md:p-6">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Shifts</h3>
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
              <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Start</th>
              <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">End</th>
              <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Hours</th>
              <th className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Earnings</th>
            </tr>
          </thead>
          <tbody>
            {shifts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                  No shifts in this period.
                </td>
              </tr>
            ) : (
              shifts.map((shift) => {
                const h = hoursForPayrollShift(shift);
                const earn = earningsForShift(shift, hourlyRate);
                return (
                  <tr key={shift.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-3 py-2.5 text-slate-800">{shift.date}</td>
                    <td className="px-3 py-2.5 tabular-nums text-slate-700">{startDisplayForShift(shift)}</td>
                    <td className="px-3 py-2.5 tabular-nums text-slate-700">{endDisplayForShift(shift)}</td>
                    <td className="px-3 py-2.5 tabular-nums text-slate-700">{h.toFixed(2)}</td>
                    <td className="px-3 py-2.5 font-medium tabular-nums text-slate-900">{formatDKK(earn)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
