"use client";

import MonthShiftItem from "./MonthShiftItem";
import type { MonthDayMeta, ShiftLike } from "./types";

type CalendarCell = {
  date: string;
  dayNumber: number;
  isCurrentMonth: boolean;
};

type MonthDayCellProps = {
  cell: CalendarCell;
  dayShifts: ShiftLike[];
  dayMeta: MonthDayMeta;
  todayStr: string;
  selectedDate: string;
  isAdmin: boolean;
  isReadOnly: boolean;
  onActivateDay: (date: string) => void;
  onShiftSelect: (shift: ShiftLike) => void;
};

export default function MonthDayCell({
  cell,
  dayShifts,
  dayMeta,
  todayStr,
  selectedDate,
  isAdmin,
  isReadOnly,
  onActivateDay,
  onShiftSelect,
}: MonthDayCellProps) {
  const isToday = cell.date === todayStr;
  const isSelected = selectedDate === cell.date;
  const hasShifts = dayShifts.length > 0;

  const canActivate = !isReadOnly || hasShifts;
  const cellCursor = canActivate ? "cursor-pointer" : "cursor-default";

  const showQuickAdd = isAdmin && !isReadOnly;

  const selectedStyles = isSelected
    ? "bg-indigo-50 ring-2 ring-inset ring-indigo-300/90 z-[1]"
    : "";
  const todayStyles =
    isToday && !isSelected ? "bg-sky-50/70 ring-1 ring-inset ring-sky-200/90" : "";

  const hoverStyles =
    showQuickAdd || (hasShifts && canActivate) ? "hover:bg-slate-50/90" : canActivate ? "hover:bg-slate-50/90" : "";

  function activate() {
    if (!canActivate) return;
    onActivateDay(cell.date);
  }

  return (
    <div
      tabIndex={canActivate ? 0 : -1}
      onClick={activate}
      onKeyDown={(e) => {
        if (!canActivate) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate();
        }
      }}
      className={`group relative flex min-h-[118px] flex-col border-t border-transparent text-left align-top outline-none transition sm:min-h-[128px] ${cellCursor} ${
        cell.isCurrentMonth ? "bg-white" : "bg-slate-50/95"
      } ${selectedStyles} ${todayStyles} ${hoverStyles} ${
        !cell.isCurrentMonth ? "text-slate-500" : "text-slate-900"
      } ${
        canActivate
          ? "focus-visible:z-[2] focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1"
          : ""
      }`}
      aria-label={
        showQuickAdd
          ? `Schedule ${cell.date}: click to add shift, or select a shift below`
          : hasShifts
            ? `Shifts on ${cell.date}`
            : undefined
      }
    >
      <div className="flex flex-1 flex-col px-2 py-2 sm:px-2.5 sm:py-2.5">
        <div className="flex items-start justify-between gap-1">
          <span
            className={`text-sm font-bold tabular-nums ${
              isToday ? "text-indigo-700" : !cell.isCurrentMonth ? "text-slate-400" : "text-slate-900"
            }`}
          >
            {cell.dayNumber}
          </span>
          {(dayMeta.shiftCount > 0 || dayMeta.plannedHours > 0) && (
            <span className="max-w-[55%] truncate text-right text-[9px] font-medium tabular-nums text-slate-500 sm:text-[10px]">
              {dayMeta.shiftCount > 0 ? `${dayMeta.shiftCount} shift${dayMeta.shiftCount === 1 ? "" : "s"}` : ""}
              {dayMeta.shiftCount > 0 && dayMeta.plannedHours > 0 ? " · " : ""}
              {dayMeta.plannedHours > 0 ? `${dayMeta.plannedHours.toFixed(1)}h` : ""}
            </span>
          )}
        </div>

        <div className="mt-1 flex min-h-0 max-h-[4.75rem] flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden pr-0.5 sm:max-h-[5.5rem]">
          {dayShifts.map((shift) => (
            <MonthShiftItem key={shift.id} shift={shift} isReadOnly={isReadOnly} onSelectShift={onShiftSelect} />
          ))}
        </div>
      </div>

      {showQuickAdd ? (
        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation();
            onActivateDay(cell.date);
          }}
          className="pointer-events-none absolute bottom-2 right-2 z-[2] flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-indigo-600 text-xl font-light leading-none text-white opacity-0 shadow-md transition hover:bg-indigo-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 group-hover:pointer-events-auto group-hover:opacity-100"
          aria-label={`Add shift on ${cell.date}`}
        >
          +
        </button>
      ) : null}
    </div>
  );
}
