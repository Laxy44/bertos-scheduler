"use client";

import { getMonthShiftBorderClass } from "./month-shift-styles";
import type { ShiftLike } from "./types";

type MonthDayDetailsPanelProps = {
  date: string;
  dateLabel: string;
  shifts: ShiftLike[];
  isAdmin: boolean;
  isReadOnly: boolean;
  onClose: () => void;
  onAddShift: () => void;
  onEditShift: (shift: ShiftLike) => void;
  getPlannedHours: (s: ShiftLike) => number;
  getWorkedHours: (s: ShiftLike) => number;
};

export default function MonthDayDetailsPanel({
  date,
  dateLabel,
  shifts,
  isAdmin,
  isReadOnly,
  onClose,
  onAddShift,
  onEditShift,
  getPlannedHours,
  getWorkedHours,
}: MonthDayDetailsPanelProps) {
  const totalPlanned = shifts.reduce((s, sh) => s + getPlannedHours(sh), 0);
  const totalWorked = shifts.reduce((s, sh) => s + getWorkedHours(sh), 0);

  return (
    <div className="fixed inset-0 z-[60] flex justify-end print:hidden" role="dialog" aria-modal="true" aria-labelledby="month-day-details-title">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl animate-in slide-in-from-right duration-200">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-4">
          <div>
            <p id="month-day-details-title" className="text-lg font-semibold text-slate-900">
              {dateLabel}
            </p>
            <p className="mt-0.5 text-xs font-medium tabular-nums text-slate-500">{date}</p>
            <p className="mt-2 text-xs text-slate-600">
              {shifts.length} shift{shifts.length === 1 ? "" : "s"} · {totalPlanned.toFixed(1)}h planned
              {totalWorked > 0 ? ` · ${totalWorked.toFixed(1)}h worked` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {shifts.length === 0 ? (
            <p className="text-sm text-slate-600">
              {isReadOnly
                ? "No shifts on this day."
                : "No shifts yet — add one to cover this date."}
            </p>
          ) : (
            <ul className="space-y-3">
              {shifts.map((shift) => {
                const border = getMonthShiftBorderClass(shift);
                const planned = getPlannedHours(shift);
                const worked = getWorkedHours(shift);
                return (
                  <li
                    key={shift.id}
                    className={`rounded-xl border p-3 shadow-sm ${border}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {shift.employee} · {shift.start}–{shift.end}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-600">
                          {shift.role}
                          {shift.notes ? ` · ${shift.notes}` : ""}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Planned {planned.toFixed(1)}h
                          {worked > 0 ? ` · Worked ${worked.toFixed(1)}h` : ""}
                          {shift.approved ? " · Approved" : ""}
                        </p>
                      </div>
                      {isAdmin && !isReadOnly ? (
                        <button
                          type="button"
                          onClick={() => onEditShift(shift)}
                          className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
                        >
                          Edit
                        </button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {isAdmin && !isReadOnly ? (
          <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
            <button
              type="button"
              onClick={onAddShift}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              Add shift on this day
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
