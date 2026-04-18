import type { ShiftLike } from "./types";

export function getMonthShiftBorderClass(shift: ShiftLike): string {
  if (shift.approved) return "border-emerald-300 bg-emerald-50/90 text-emerald-900";
  return "border-slate-200 bg-white text-slate-800";
}

/** Match week `ScheduleGrid` shift status labels for consistent UX. */
export function getMonthShiftStatusLabel(shift: ShiftLike): string {
  return shift.approved ? "Approved" : "Draft";
}

/** Compact pill styles aligned with `ScheduleGrid` `getShiftStatusStyles`. */
export function getMonthShiftStatusPillClass(shift: ShiftLike): string {
  return shift.approved
    ? "border-emerald-300 bg-emerald-100 text-emerald-800"
    : "border-slate-200 bg-white text-slate-600";
}
