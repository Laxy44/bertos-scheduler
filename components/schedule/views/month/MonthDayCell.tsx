"use client";

import MonthShiftItem from "./MonthShiftItem";
import type { MonthDayMeta, ShiftLike } from "./types";

const MAX_VISIBLE = 3;

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
  onOpenDayDetails: (date: string) => void;
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
  onOpenDayDetails,
  onShiftSelect,
}: MonthDayCellProps) {
  const visible = dayShifts.slice(0, MAX_VISIBLE);
  const overflow = dayShifts.length - visible.length;
  const isToday = cell.date === todayStr;
  const isSelected = selectedDate === cell.date;
  const hasShifts = dayShifts.length > 0;

  const emptyAdmin = isAdmin && !isReadOnly && !hasShifts;
  const cellCursor = isReadOnly && !hasShifts ? "cursor-default" : "cursor-pointer";
  const canActivate = !isReadOnly || hasShifts;

  return (
    <div
      tabIndex={canActivate ? 0 : -1}
      onClick={() => {
        if (!canActivate) return;
        onActivateDay(cell.date);
      }}
      onKeyDown={(e) => {
        if (!canActivate) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivateDay(cell.date);
        }
      }}
      className={`group flex min-h-[108px] flex-col items-stretch border-t border-transparent px-2 py-2 text-left align-top outline-none transition sm:min-h-[124px] sm:px-2.5 sm:py-2.5 ${cellCursor} ${
        cell.isCurrentMonth ? "bg-white" : "bg-slate-50/95"
      } ${isToday ? "ring-2 ring-inset ring-indigo-400/90" : ""} ${
        isSelected ? "bg-indigo-50/90 ring-1 ring-inset ring-indigo-200" : ""
      } ${
        !cell.isCurrentMonth ? "text-slate-500" : "text-slate-900"
      } ${
        emptyAdmin
          ? "hover:bg-sky-50/80 hover:ring-1 hover:ring-inset hover:ring-sky-200/80"
          : hasShifts
            ? "hover:bg-slate-50/95"
            : ""
      }`}
    >
      <div className="flex items-start justify-between gap-1">
        <span
          className={`text-sm font-bold tabular-nums ${
            isToday ? "text-indigo-700" : !cell.isCurrentMonth ? "text-slate-400" : "text-slate-900"
          }`}
        >
          {cell.dayNumber}
        </span>
        {emptyAdmin ? (
          <span className="rounded border border-dashed border-slate-300/80 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-400 opacity-0 transition group-hover:opacity-100">
            +
          </span>
        ) : null}
      </div>
      {(dayMeta.shiftCount > 0 || dayMeta.plannedHours > 0) && (
        <p className="mt-0.5 text-[9px] font-medium tabular-nums text-slate-500 sm:text-[10px]">
          {dayMeta.shiftCount > 0 ? `${dayMeta.shiftCount} shift${dayMeta.shiftCount === 1 ? "" : "s"}` : ""}
          {dayMeta.shiftCount > 0 && dayMeta.plannedHours > 0 ? " · " : ""}
          {dayMeta.plannedHours > 0 ? `${dayMeta.plannedHours.toFixed(1)}h` : ""}
          {dayMeta.plannedPayroll > 0 ? ` · £${dayMeta.plannedPayroll.toFixed(0)}` : ""}
        </p>
      )}
      <div className="mt-1 flex min-h-0 flex-1 flex-col gap-1">
        {visible.map((shift) => (
          <MonthShiftItem
            key={shift.id}
            shift={shift}
            isReadOnly={isReadOnly}
            onSelectShift={onShiftSelect}
          />
        ))}
        {overflow > 0 ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDayDetails(cell.date);
            }}
            className="w-full rounded border border-slate-200/80 bg-slate-50 py-0.5 text-center text-[10px] font-semibold text-indigo-700 transition hover:bg-indigo-50"
          >
            +{overflow} more
          </button>
        ) : null}
      </div>
    </div>
  );
}
