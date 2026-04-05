"use client";

import { useState } from "react";
import { addDays, formatWeekRange, getWeekDates } from "../lib/utils";

export default function WeekNavigator({
  weekStart,
  goPrev,
  goNext,
  goToday,
  setWeekStart,
  setSelectedDate,
  setCopyFromDate,
  setForm,
}: any) {
  const [open, setOpen] = useState(false);

  const current = formatWeekRange(weekStart);

  const generateWeeks = () => {
    const weeks = [];
    for (let i = -6; i <= 6; i++) {
      const w = addDays(weekStart, i * 7);
      weeks.push({ start: w, ...formatWeekRange(w) });
    }
    return weeks;
  };

  const weeks = generateWeeks();

  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={goPrev}
          className="rounded-xl px-3 py-2 text-lg hover:bg-slate-100"
        >
          ←
        </button>

        <div
          className="relative cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          <div className="text-center">
            <div className="text-sm font-semibold text-slate-500">
              {current.label}
            </div>
            <div className="text-base font-bold text-slate-900">
              {current.range}
            </div>
          </div>

          {open && (
            <div className="absolute left-1/2 z-20 mt-3 w-72 -translate-x-1/2 rounded-2xl border bg-white shadow-lg">
              {weeks.map((w, i) => (
                <div
                  key={i}
                  onClick={() => {
                    const newDates = getWeekDates(w.start);
                    setWeekStart(w.start);
                    setSelectedDate(newDates[0].date);
                    setCopyFromDate(newDates[0].date);
                    setForm((c: any) => ({ ...c, date: newDates[0].date }));
                    setOpen(false);
                  }}
                  className="cursor-pointer px-4 py-3 text-sm hover:bg-slate-100"
                >
                  <div className="font-semibold">{w.label}</div>
                  <div className="text-slate-500">{w.range}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={goNext}
          className="rounded-xl px-3 py-2 text-lg hover:bg-slate-100"
        >
          →
        </button>

        <button
          onClick={goToday}
          className="ml-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Today
        </button>
      </div>
    </div>
  );
}