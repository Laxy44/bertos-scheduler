"use client";

import { days } from "../../../../lib/constants";
import MonthDayCell from "./MonthDayCell";
import type { MonthDayMeta, ShiftLike } from "./types";

type CalendarCell = {
  date: string;
  dayNumber: number;
  isCurrentMonth: boolean;
};

type MonthCalendarGridProps = {
  cells: CalendarCell[];
  shiftsByDate: Map<string, ShiftLike[]>;
  dayMetaByDate: Map<string, MonthDayMeta>;
  todayStr: string;
  selectedDate: string;
  isAdmin: boolean;
  isReadOnly: boolean;
  onActivateDay: (date: string) => void;
  onOpenDayDetails: (date: string) => void;
  onShiftSelect: (shift: ShiftLike) => void;
};

export default function MonthCalendarGrid({
  cells,
  shiftsByDate,
  dayMetaByDate,
  todayStr,
  selectedDate,
  isAdmin,
  isReadOnly,
  onActivateDay,
  onOpenDayDetails,
  onShiftSelect,
}: MonthCalendarGridProps) {
  return (
    <div className="grid grid-cols-7 gap-px rounded-lg border border-slate-200 bg-slate-200 shadow-sm">
      {days.map((d) => (
        <div
          key={d}
          className="bg-slate-100 px-2 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-slate-600 sm:px-3 sm:py-2.5 sm:text-[11px]"
        >
          {d.slice(0, 3)}
        </div>
      ))}

      {cells.map((cell) => (
        <MonthDayCell
          key={cell.date}
          cell={cell}
          dayShifts={shiftsByDate.get(cell.date) || []}
          dayMeta={dayMetaByDate.get(cell.date) || { shiftCount: 0, plannedHours: 0, plannedPayroll: 0 }}
          todayStr={todayStr}
          selectedDate={selectedDate}
          isAdmin={isAdmin}
          isReadOnly={isReadOnly}
          onActivateDay={onActivateDay}
          onOpenDayDetails={onOpenDayDetails}
          onShiftSelect={onShiftSelect}
        />
      ))}
    </div>
  );
}
