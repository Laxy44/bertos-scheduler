"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMemo } from "react";
import { days } from "../../../lib/constants";
import { getMonthCalendarDays } from "../../../lib/utils";

const MAX_SHIFTS_VISIBLE = 4;

type MonthScheduleViewProps = {
  month: number;
  year: number;
  monthNames: readonly string[];
  shifts: any[];
  selectedDate: string;
  onPickDate: (date: string) => void;
  isReadOnly: boolean;
  openShiftFromGrid: (shift: any) => void;
};

export default function MonthScheduleView({
  month,
  year,
  monthNames,
  shifts,
  selectedDate,
  onPickDate,
  isReadOnly,
  openShiftFromGrid,
}: MonthScheduleViewProps) {
  const cells = useMemo(() => getMonthCalendarDays(month, year), [month, year]);

  const todayStr = useMemo(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const shiftsByDate = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const shift of shifts) {
      const list = map.get(shift.date) || [];
      list.push(shift);
      map.set(shift.date, list);
    }
    for (const [, list] of map) {
      list.sort((a, b) => a.start.localeCompare(b.start));
    }
    return map;
  }, [shifts]);

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="min-w-[720px] p-3 sm:p-4">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Month</p>
            <h2 className="text-lg font-semibold text-slate-900">
              {monthNames[month]} {year}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px rounded-lg border border-slate-200 bg-slate-200 shadow-sm">
          {days.map((d) => (
            <div
              key={d}
              className="bg-slate-100 px-2 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-slate-600 sm:px-3 sm:py-2.5 sm:text-[11px]"
            >
              {d.slice(0, 3)}
            </div>
          ))}

          {cells.map((cell) => {
            const dayShifts = shiftsByDate.get(cell.date) || [];
            const visible = dayShifts.slice(0, MAX_SHIFTS_VISIBLE);
            const overflow = dayShifts.length - visible.length;
            const isToday = cell.date === todayStr;
            const isSelected = selectedDate === cell.date;

            return (
              <div
                key={cell.date}
                role="presentation"
                onClick={() => onPickDate(cell.date)}
                className={`flex min-h-[108px] cursor-pointer flex-col items-stretch border-t border-transparent px-2 py-2 text-left align-top transition sm:min-h-[120px] sm:px-2.5 sm:py-2.5 ${
                  cell.isCurrentMonth ? "bg-white" : "bg-slate-50/95"
                } ${isToday ? "ring-2 ring-inset ring-indigo-400/90" : ""} ${
                  isSelected ? "bg-indigo-50/90 ring-1 ring-inset ring-indigo-200" : "hover:bg-slate-50"
                } ${!cell.isCurrentMonth ? "text-slate-500" : "text-slate-900"}`}
              >
                <span
                  className={`text-sm font-bold tabular-nums ${
                    isToday ? "text-indigo-700" : !cell.isCurrentMonth ? "text-slate-400" : "text-slate-900"
                  }`}
                >
                  {cell.dayNumber}
                </span>
                <div className="mt-1 flex min-h-0 flex-1 flex-col gap-1">
                  {visible.map((shift) =>
                    isReadOnly ? (
                      <div
                        key={shift.id}
                        className="truncate rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium leading-tight text-slate-800 sm:text-[11px]"
                      >
                        <span className="font-semibold text-slate-700">{shift.start}</span>
                        <span className="text-slate-400">–</span>
                        <span className="font-semibold text-slate-700">{shift.end}</span>
                        <span className="ml-1 text-slate-500">{shift.employee}</span>
                      </div>
                    ) : (
                      <button
                        key={shift.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openShiftFromGrid(shift);
                        }}
                        className="truncate rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-left text-[10px] font-medium leading-tight text-slate-800 transition hover:border-indigo-300 hover:bg-indigo-50/60 sm:text-[11px]"
                      >
                        <span className="font-semibold text-slate-700">{shift.start}</span>
                        <span className="text-slate-400">–</span>
                        <span className="font-semibold text-slate-700">{shift.end}</span>
                        <span className="ml-1 text-slate-500">{shift.employee}</span>
                      </button>
                    )
                  )}
                  {overflow > 0 ? (
                    <span className="text-[10px] font-semibold text-slate-500">+{overflow} more</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
