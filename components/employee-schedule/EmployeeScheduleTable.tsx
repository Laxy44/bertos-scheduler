"use client";

import type { Shift } from "../../types/schedule";
import { getHours } from "../../lib/utils";

export type ScheduleTableGroup = {
  id: string;
  label: string;
  shifts: Shift[];
};

type EmployeeScheduleTableProps = {
  shifts: Shift[];
  hourlyRate: number;
  highlightDate: string | null;
  grouped?: ScheduleTableGroup[];
};

function formatDisplayDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function payrollForShift(shift: Shift, hourlyRate: number) {
  const hours = getHours(shift.start, shift.end);
  return hours * hourlyRate;
}

function renderShiftRows(shifts: Shift[], hourlyRate: number, highlightDate: string | null) {
  if (shifts.length === 0) {
    return (
      <tr>
        <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
          No shifts in this block.
        </td>
      </tr>
    );
  }

  return shifts.map((shift) => {
    const plannedHours = getHours(shift.start, shift.end);
    const pay = payrollForShift(shift, hourlyRate);
    const hi = highlightDate && shift.date === highlightDate;
    return (
      <tr
        key={shift.id}
        className={hi ? "bg-indigo-50/80 ring-1 ring-inset ring-indigo-200" : "hover:bg-slate-50/80"}
      >
        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
          {formatDisplayDate(shift.date)}
        </td>
        <td className="px-4 py-3 text-sm text-slate-700">{shift.role}</td>
        <td className="whitespace-nowrap px-4 py-3 text-sm tabular-nums text-slate-800">
          {shift.start} – {shift.end}
        </td>
        <td className="whitespace-nowrap px-4 py-3 text-sm tabular-nums text-slate-600">
          {plannedHours.toFixed(1)}h
        </td>
        <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold tabular-nums text-slate-900">
          £{pay.toFixed(2)}
        </td>
      </tr>
    );
  });
}

export default function EmployeeScheduleTable({
  shifts,
  hourlyRate,
  highlightDate,
  grouped,
}: EmployeeScheduleTableProps) {
  const totalHours = shifts.reduce((s, sh) => s + getHours(sh.start, sh.end), 0);
  const totalPay = shifts.reduce((s, sh) => s + payrollForShift(sh, hourlyRate), 0);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Date</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                Role / group
              </th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Start / end</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Hours</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Payroll</th>
            </tr>
          </thead>
          {grouped && grouped.length > 0 ? (
            grouped.map((g) => (
              <tbody key={g.id} className="border-t border-slate-200 first:border-t-0">
                <tr className="bg-slate-100/90">
                  <td
                    colSpan={5}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-600"
                  >
                    {g.label}
                  </td>
                </tr>
                {renderShiftRows(g.shifts, hourlyRate, highlightDate)}
              </tbody>
            ))
          ) : (
            <tbody className="divide-y divide-slate-100">
              {shifts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-500">
                    Nothing scheduled in this view. Pick another date or month from the calendars.
                  </td>
                </tr>
              ) : (
                renderShiftRows(shifts, hourlyRate, highlightDate)
              )}
            </tbody>
          )}
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/80 px-4 py-3 text-sm">
        <span className="font-semibold text-slate-700">
          Shifts: <span className="tabular-nums text-slate-900">{shifts.length}</span>
        </span>
        <span className="font-semibold text-slate-700">
          Hours: <span className="tabular-nums text-slate-900">{totalHours.toFixed(1)}</span>
        </span>
        <span className="font-semibold text-slate-700">
          Planned pay: <span className="tabular-nums text-slate-900">£{totalPay.toFixed(2)}</span>
        </span>
      </div>
    </div>
  );
}
