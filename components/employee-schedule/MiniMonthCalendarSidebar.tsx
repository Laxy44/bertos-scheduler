"use client";

import MiniMonthCalendar from "./MiniMonthCalendar";

function addCalendarMonthsFirst(d: Date, delta: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1, 0, 0, 0, 0);
}

type MiniMonthCalendarSidebarProps = {
  /** First of the leftmost visible month */
  anchorMonth: Date;
  onAnchorMonthChange: (firstOfMonth: Date) => void;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
};

export default function MiniMonthCalendarSidebar({
  anchorMonth,
  onAnchorMonthChange,
  selectedDate,
  onSelectDate,
}: MiniMonthCalendarSidebarProps) {
  const m0 = anchorMonth.getMonth() + 1;
  const y0 = anchorMonth.getFullYear();
  const m1 = addCalendarMonthsFirst(anchorMonth, 1).getMonth() + 1;
  const y1 = addCalendarMonthsFirst(anchorMonth, 1).getFullYear();
  const m2 = addCalendarMonthsFirst(anchorMonth, 2).getMonth() + 1;
  const y2 = addCalendarMonthsFirst(anchorMonth, 2).getFullYear();

  return (
    <aside className="flex w-full flex-col gap-3 lg:w-56 lg:shrink-0 print:hidden">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onAnchorMonthChange(addCalendarMonthsFirst(anchorMonth, -1))}
          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          aria-label="Previous months"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => onAnchorMonthChange(addCalendarMonthsFirst(anchorMonth, 1))}
          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          aria-label="Next months"
        >
          →
        </button>
      </div>
      <MiniMonthCalendar year={y0} month={m0} selectedDate={selectedDate} onSelectDate={onSelectDate} />
      <MiniMonthCalendar year={y1} month={m1} selectedDate={selectedDate} onSelectDate={onSelectDate} />
      <MiniMonthCalendar year={y2} month={m2} selectedDate={selectedDate} onSelectDate={onSelectDate} />
    </aside>
  );
}
