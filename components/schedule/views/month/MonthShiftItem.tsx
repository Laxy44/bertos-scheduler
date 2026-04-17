"use client";

import type { MouseEventHandler } from "react";
import type { ShiftLike } from "./types";
import { getMonthShiftBorderClass } from "./month-shift-styles";

type MonthShiftItemProps = {
  shift: ShiftLike;
  isReadOnly: boolean;
  onSelectShift: (shift: ShiftLike) => void;
};

/**
 * Compact shift chip for month cells — time range + employee name, status-colored border.
 */
export default function MonthShiftItem({ shift, isReadOnly, onSelectShift }: MonthShiftItemProps) {
  const border = getMonthShiftBorderClass(shift);

  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    onSelectShift(shift);
  };

  if (isReadOnly) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`w-full truncate rounded border px-1.5 py-0.5 text-left text-[10px] font-medium leading-tight transition hover:opacity-95 sm:text-[11px] ${border}`}
      >
        <span className="font-semibold tabular-nums">
          {shift.start}–{shift.end}
        </span>{" "}
        <span className="text-slate-600">{shift.employee}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full truncate rounded border px-1.5 py-0.5 text-left text-[10px] font-medium leading-tight transition hover:brightness-[0.98] sm:text-[11px] ${border}`}
    >
      <span className="font-semibold tabular-nums">
        {shift.start}–{shift.end}
      </span>{" "}
      <span className="text-slate-600">{shift.employee}</span>
    </button>
  );
}
