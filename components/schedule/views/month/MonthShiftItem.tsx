"use client";

import type { MouseEventHandler } from "react";
import type { ShiftLike } from "./types";
import {
  getMonthShiftBorderClass,
  getMonthShiftStatusLabel,
  getMonthShiftStatusPillClass,
} from "./month-shift-styles";

type MonthShiftItemProps = {
  shift: ShiftLike;
  isReadOnly: boolean;
  onSelectShift: (shift: ShiftLike) => void;
};

/**
 * Compact shift card for month cells — aligned with week `ShiftMiniCard` (time, role, status pill).
 */
export default function MonthShiftItem({ shift, isReadOnly, onSelectShift }: MonthShiftItemProps) {
  const border = getMonthShiftBorderClass(shift);
  const statusLabel = getMonthShiftStatusLabel(shift);
  const pillClass = getMonthShiftStatusPillClass(shift);

  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    onSelectShift(shift);
  };

  const inner = (
    <div className="flex items-start justify-between gap-1.5">
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold tabular-nums text-slate-900">
          {shift.start}–{shift.end}
        </div>
        <div className="mt-0.5 truncate text-[10px] text-slate-500">{shift.role}</div>
        <div className="mt-0.5 truncate text-[10px] font-medium text-slate-600">{shift.employee}</div>
      </div>
      <span
        className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold leading-none ${pillClass}`}
      >
        {statusLabel}
      </span>
    </div>
  );

  if (isReadOnly) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`w-full rounded-lg border px-2 py-1.5 text-left shadow-sm transition hover:opacity-95 ${border}`}
      >
        {inner}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full rounded-lg border px-2 py-1.5 text-left shadow-sm transition hover:border-slate-300 hover:brightness-[0.99] ${border}`}
    >
      {inner}
    </button>
  );
}
