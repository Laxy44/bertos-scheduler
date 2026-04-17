"use client";

import { useMemo } from "react";
import { days, monthNames } from "../../lib/constants";
import { getMonthCalendarDays } from "../../lib/utils";

type MiniMonthCalendarProps = {
  year: number;
  month: number;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
};

export default function MiniMonthCalendar({
  year,
  month,
  selectedDate,
  onSelectDate,
}: MiniMonthCalendarProps) {
  const cells = useMemo(() => getMonthCalendarDays(month, year), [month, year]);

  const todayStr = useMemo(() => {
    const n = new Date();
    const y = n.getFullYear();
    const m = String(n.getMonth() + 1).padStart(2, "0");
    const d = String(n.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

  const title = `${monthNames[month]} ${year}`;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
      <p className="border-b border-slate-100 px-1 pb-2 text-center text-xs font-bold text-slate-800">
        {title}
      </p>
      <div className="mt-1 grid grid-cols-7 gap-px text-[10px]">
        {days.map((d) => (
          <div key={d} className="py-1 text-center font-semibold uppercase text-slate-400">
            {d.slice(0, 1)}
          </div>
        ))}
        {cells.map((cell) => {
          const isSel = selectedDate === cell.date;
          const isToday = cell.date === todayStr;
          return (
            <button
              key={cell.date}
              type="button"
              onClick={() => onSelectDate(cell.date)}
              className={`aspect-square max-h-8 rounded text-[10px] font-semibold tabular-nums transition ${
                !cell.isCurrentMonth ? "text-slate-300" : "text-slate-800"
              } ${isToday ? "ring-1 ring-indigo-400" : ""} ${
                isSel ? "bg-indigo-600 text-white ring-0" : "hover:bg-slate-100"
              }`}
            >
              {cell.dayNumber}
            </button>
          );
        })}
      </div>
    </div>
  );
}
